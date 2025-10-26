import React, {useRef, useState, useMemo} from 'react';
import {PlusOutlined} from '@ant-design/icons';
import {FloatButton, Tooltip, Modal, Form, Select, Button, Space, Flex} from 'antd';
import Icon from "../../components/Icon";
import IconMD from "../../../assets/icon-markdown.svg";
import type {IGroupsContextValue} from "../../../types";
import {FILE_TYPE} from "../../../utils/Enums";
import useNoteInfo from "../../hooks/useNoteInfo";


interface IFieldValues {
    group: string;
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
                value: item.key,
            }
        })
    }, [groups])

    // 创建笔记
    const createNote = async (groupId: string) => {
        console.log(groupId);
        const noteTypeMap = {
            [FILE_TYPE.text]: '.txt',
            [FILE_TYPE.Markdown]: '.md',
        }
        // 根据groupId找到对应的分组位置
        const newGroups = groups.map((item) => {
            if (item.key === groupId) {
                const now = Date.now();
                // 往对应的分组位置插入新的笔记
                if (!item.children) {
                    item.children = [];
                }
                item.children.push({
                    key: `group-${crypto.randomUUID()}`,
                    label: `新建笔记${noteTypeMap[typeRef.current]}`,
                    createTime: now,
                    updateTime: now,
                    tags: [],
                });
            }
            return item;
        })
        setGroupsConfig({
            groups: newGroups,
        } as IGroupsContextValue['groupsConfig'])
        // 重新生成groups.json文件
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
                closable={{'aria-label': 'Custom Close Button'}}
                open={isModalOpen}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={async (values) => {
                        createNote(values.group);
                    }}
                    initialValues={{
                        group: 'default',
                    }}
                >
                    <Form.Item<IFieldValues>
                        label="分组"
                        name="group"
                    >
                        <Select options={groupOptions}/>
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