import React, {memo, useState, useMemo} from "react";
import {Menu, Button, Modal, Form, Input, Flex, Space} from "antd";
import type {MenuProps} from 'antd';
import {useNavigate} from "react-router";
import useNoteInfo from "../../hooks/useNoteInfo";

interface IFieldValues {
    groupName: string;
}

const NoteGroups: React.FC = () => {
    const navigate = useNavigate();
    const {
        groups,
        setGroupsConfig,
    } = useNoteInfo()

    const [form] = Form.useForm();

    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [openKeys, setOpenKeys] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const items = useMemo(() => {
        return groups.map((group) => {
            return {
                key: group.key,
                label: group.name,
                children: (group.children || []).map((child) => {
                    return {
                        key: child.key,
                        label: child.name,
                    }
                })
            }
        })
    }, [groups]);

    const onSelect: MenuProps['onSelect'] = (e) => {
        setSelectedKeys(e.selectedKeys)
        navigate(`/home/note/${e.key}`)
    };
    const onOpenChange: MenuProps['onOpenChange'] = (_openKeys) => {
        setOpenKeys(_openKeys)
    };

    const createGroup = async (values: IFieldValues) => {
        const now = Date.now();
        const needRename = groups.find((item) => {
            return item.name === values.groupName;
        });
        if (needRename) {
            form.setFields([
                {
                    errors: ['文件名重复，请重新输入！'],
                    name: 'groupName',
                }
            ])
            return;
        }
        const _groupsConfig = {
            groups: [
                ...groups,
                {
                    key: `${crypto.randomUUID()}`,
                    name: values.groupName,
                    createTime: now,
                    updateTime: now,
                    children: [],
                }
            ],
        }
        setGroupsConfig(_groupsConfig)
        await Promise.all([
            // 重新生成groups.json文件
            window.electronAPI.updateGroupsConfigAsync(_groupsConfig),
            // 创建笔记文件
            window.electronAPI.createNoteAsync({
                paths: [values.groupName],
                type: 'group',
            })
        ])
        setIsModalOpen(false);
    }

    return (
        <div className="scrollable" style={{background: '#FAFAFA', height: '100%'}}>
            <Button
                style={{width: '100%', margin: '10px 0'}}
                color="primary"
                variant="outlined"
                onClick={() => {
                    setIsModalOpen(true);
                }}
            >
                新建分组
            </Button>
            <Menu
                style={{border: '1px solid #e8e8e8', borderBottom: 'none'}}
                onSelect={onSelect}
                onOpenChange={onOpenChange}
                selectedKeys={selectedKeys}
                openKeys={openKeys}
                mode="inline"
                items={items}
            />
            <Modal
                title="新建分组"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form
                    form={form}
                    labelCol={{span: 4}}
                    wrapperCol={{span: 19}}
                    onFinish={(values) => {
                        createGroup(values);
                    }}
                >
                    <Form.Item<IFieldValues>
                        label="分组名称"
                        name="groupName"
                        rules={[{required: true, message: '分组名称是必填项！'}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Flex justify="flex-end">
                        <Space>
                            <Button onClick={() => setIsModalOpen(false)}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit">
                                确定
                            </Button>
                        </Space>
                    </Flex>
                </Form>
            </Modal>
        </div>
    );
};

export default memo(NoteGroups);