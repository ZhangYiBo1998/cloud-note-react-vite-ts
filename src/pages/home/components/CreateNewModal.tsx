import React, {memo, useMemo} from "react";
import {Button, Modal, Form, Input, Flex, Space, Radio, Select} from "antd";
import useNoteInfo from "../../hooks/useNoteInfo";
import {FILE_TYPE} from "../../../utils/Enums";
import type {IGroupsConfig, IGroupsContextValue, IGroupsItem} from "../../../types";
import {useNavigate} from "react-router";
import eventBus from "../../../utils/EventBus";

interface IFieldValues {
    type: number;
    groupName?: string;
    groupKey?: string;
    fileName?: string;
    fileType?: string;
}

interface IProps {
    visible: boolean;
    visibleChange: (visible: boolean) => void;
}

const CreateNewModal: React.FC<IProps> = (props) => {
    const {
        visible,
        visibleChange,
    } = props;

    const navigate = useNavigate();
    const {
        groups,
        setGroupsConfig,
    } = useNoteInfo()

    const [form] = Form.useForm();

    const type = Form.useWatch('type', form);
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
    // 创建分组
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
        } as IGroupsConfig
        setGroupsConfig(_groupsConfig)
        await Promise.all([
            // 重新生成groups.json文件
            window.electronAPI.updateGroupsConfigAsync(_groupsConfig),
            // 创建笔记文件
            window.electronAPI.createNoteAsync({
                paths: [values.groupName as string],
                type: 'group',
            })
        ])
        visibleChange(false);
    }
    // 创建笔记
    const createNote = async (values: IFieldValues) => {
        const {
            groupKey,
            fileName,
        } = values;
        // 根据groupId找到对应的分组位置
        const targetGroup: IGroupsItem = groups.find((item) => item.key === groupKey) || {} as IGroupsItem;
        const needRename = targetGroup.children?.find((item) => {
            return item.name === `${fileName}${values.fileType}`;
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
        const randomUUID = crypto.randomUUID()
        const newGroups = groups.map((item) => {
            if (item.key === groupKey) {
                const now = Date.now();
                // 往对应的分组位置插入新的笔记
                if (!item.children) {
                    item.children = [];
                }
                item.children.push({
                    key: `${randomUUID}`,
                    name: `${fileName}${values.fileType}`,
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
                paths: [targetGroup.name, `${fileName}${values.fileType}`],
                content: '',
            })
        ])
        navigate(`/home/note/${randomUUID}`)
        eventBus.publish('open-group-by-key', groupKey, randomUUID)
        visibleChange(false);
    }

    return (
        <>

            <Modal
                title="新建分组"
                open={visible}
                onCancel={() => visibleChange(false)}
                footer={null}
            >
                <Form
                    form={form}
                    labelCol={{span: 4}}
                    wrapperCol={{span: 19}}
                    onFinish={(values) => {
                        if (values.type === 1) {
                            createGroup(values);
                        } else {
                            createNote(values);
                        }
                    }}
                    initialValues={{
                        type: 0,
                        groupKey: groupOptions[0]?.value || '',
                        fileType: FILE_TYPE.text
                    }}
                >
                    <Form.Item<IFieldValues>
                        label="类型"
                        name="type"
                    >
                        <Radio.Group
                            options={[
                                {value: 0, label: '笔记'},
                                {value: 1, label: '分组'},
                            ]}
                        />
                    </Form.Item>
                    {type === 0 && (
                        <>
                            <Form.Item<IFieldValues>
                                label="分组"
                                name="groupKey"
                                rules={[{required: true, message: '分组是必填项！'}]}
                            >
                                <Select options={groupOptions}/>
                            </Form.Item>
                            <Form.Item<IFieldValues>
                                label="文件名"
                                name="fileName"
                                rules={[{required: true, message: '文件名是必填项！'}]}
                            >
                                <Input
                                    addonBefore={(
                                        <Form.Item<IFieldValues>
                                            name="fileType"
                                            noStyle
                                        >
                                            <Select
                                                style={{width: 100}}
                                                options={[
                                                    {
                                                        label: '普通文本',
                                                        value: FILE_TYPE.text,
                                                    },
                                                    {
                                                        label: 'Md文档',
                                                        value: FILE_TYPE.Markdown,
                                                    },
                                                ]}
                                            />
                                        </Form.Item>
                                    )}
                                />
                            </Form.Item>
                        </>
                    )}
                    {type === 1 && (
                        <Form.Item<IFieldValues>
                            label="分组名称"
                            name="groupName"
                            rules={[{required: true, message: '分组名称是必填项！'}]}
                        >
                            <Input/>
                        </Form.Item>
                    )}
                    <Flex justify="flex-end">
                        <Space>
                            <Button onClick={() => visibleChange(false)}>
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
    );
};

export default memo(CreateNewModal);