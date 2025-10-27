import React, {useRef, useState, useMemo} from 'react';
import {PlusOutlined} from '@ant-design/icons';
import {FloatButton, Tooltip, Modal, Form, Select, Button, Space, Flex, Input} from 'antd';
import Icon from "../../components/Icon";
import IconMD from "../../../assets/icon-markdown.svg";
import type {IGroupsContextValue, IMenuItem} from "../../../types";
import {FILE_TYPE} from "../../../utils/Enums";
import useNoteInfo from "../../hooks/useNoteInfo";


interface IFieldValues {
    groupId: string;
    fileName: string;
}

const CreateNoteButton: React.FC<{ onChange: (fileType: string) => void }> = (props) => {
    const {
        onChange,
    } = props;

    const {
        groups,
        setGroupsConfig,
    } = useNoteInfo()
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const typeRef = useRef('');

    // 悬浮按钮列表
    const floatButtonList = useMemo(() => {
        return [
            {
                id: FILE_TYPE.Markdown,
                label: 'Markdown文件',
                icon: <Icon src={IconMD}/>,
                onClick: () => {
                    typeRef.current = FILE_TYPE.Markdown;
                    setIsModalOpen(true);
                },
            },
            {
                id: FILE_TYPE.text,
                label: '普通文本',
                onClick: () => {
                    typeRef.current = FILE_TYPE.text;
                    setIsModalOpen(true);
                },
            },
        ]
    }, []);

    // 下拉选项菜单
    const groupOptions = useMemo(() => {
        return groups.map((item) => {
            return {
                ...item,
                label: item.name,
                value: item.key,
            }
        })
    }, [groups])

    // 创建笔记
    const createNote = async (values: IFieldValues) => {
        const {
            groupId,
            fileName,
        } = values;
        const noteTypeMap = {
            [FILE_TYPE.text]: '.txt',
            [FILE_TYPE.Markdown]: '.md',
        }
        // 根据groupId找到对应的分组位置
        const targetGroup: IMenuItem = groups.find((item) => item.key === groupId) || {} as IMenuItem;
        const needRename = targetGroup.children?.find((item) => {
            return item.name === `${fileName}${noteTypeMap[typeRef.current]}`;
        });
        if (needRename) {
            form.setFields([
                {
                    errors: ['文件名重复，请重新输入！'],
                    name: 'fileName',
                }
            ])
            return;
        }
        const newGroups = groups.map((item) => {
            if (item.key === groupId) {
                const now = Date.now();
                // 往对应的分组位置插入新的笔记
                if (!item.children) {
                    item.children = [];
                }
                item.children.push({
                    key: `${crypto.randomUUID()}`,
                    name: `${fileName}${noteTypeMap[typeRef.current]}`,
                    createTime: now,
                    updateTime: now,
                    tags: [],
                });
            }
            return item;
        })
        const _groupsConfig = {
            groups: newGroups,
        }
        setGroupsConfig(_groupsConfig as IGroupsContextValue['groupsConfig']);
        await Promise.all([
            // 重新生成groups.json文件
            window.electronAPI.updateGroupsConfigAsync(_groupsConfig),
            // 创建笔记文件
            window.electronAPI.createNoteAsync({
                paths: [targetGroup.name, `${fileName}${noteTypeMap[typeRef.current]}`],
                content: '',
            })
        ])
        onChange(typeRef.current);
        setIsModalOpen(false);
    }

    return (
        <>
            <FloatButton.Group
                trigger="click"
                type="primary"
                style={{bottom: 24}}
                icon={<PlusOutlined/>}
            >
                {
                    floatButtonList.map((item) => {
                        return (
                            <Tooltip key={item.id} title={item.label} placement="left">
                                <FloatButton
                                    icon={item.icon}
                                    onClick={item.onClick}
                                />
                            </Tooltip>
                        )
                    })
                }
            </FloatButton.Group>
            <Modal
                title="新建"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form
                    form={form}
                    labelCol={{span: 4}}
                    wrapperCol={{span: 19}}
                    onFinish={(values) => {
                        createNote(values);
                    }}
                    initialValues={{
                        groupId: groupOptions[0]?.value || '',
                    }}
                >
                    <Form.Item<IFieldValues>
                        label="分组"
                        name="groupId"
                        rules={[{required: true, message: '分组是必填项！'}]}
                    >
                        <Select options={groupOptions}/>
                    </Form.Item>
                    <Form.Item<IFieldValues>
                        label="文件名"
                        name="fileName"
                        rules={[{required: true, message: '文件名是必填项！'}]}
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
        </>
    )
};

export default CreateNoteButton;