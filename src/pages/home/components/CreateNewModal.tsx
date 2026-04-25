/**
 * 新建笔记/分组弹窗
 *
 * 通过 Radio 切换创建类型（笔记/分组）：
 * - 笔记模式：选择目标分组 + 输入文件名 + 选择文件类型（.txt/.md）
 * - 分组模式：仅输入分组名
 * - 创建前检查同目录下是否有重名
 */
import React, {memo, useMemo} from "react";
import {Button, Modal, Form, Input, Flex, Space, Radio, Select} from "antd";
import useNoteInfo from "../../hooks/useNoteInfo";
import {FILE_TYPE} from "../../../utils/Enums";
import type {IGroupsItem, INoteItem} from "../../../types";

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
    createNewGroup: (data: IGroupsItem) => Promise<void>;
    createNewNoteInGroup: (data: INoteItem, groupKey: string) => Promise<void>;
}

const CreateNewModal: React.FC<IProps> = (props) => {
    const {
        visible,
        visibleChange,
        createNewGroup,
        createNewNoteInGroup,
    } = props;

    const {
        groups,
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
        await createNewGroup({
            key: `${crypto.randomUUID()}`,
            name: values.groupName as string,
            createTime: now,
            updateTime: now,
            children: [],
        })
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
        const randomUUID = crypto.randomUUID();
        const now = Date.now();

        await createNewNoteInGroup({
            key: `${randomUUID}`,
            name: `${fileName}${values.fileType}`,
            createTime: now,
            updateTime: now,
            tags: [],
        }, groupKey as string)
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
                                <Space.Compact style={{ width: '100%' }}>
                                    <Form.Item<IFieldValues>
                                        name="fileType"
                                        noStyle
                                    >
                                        <Select
                                            style={{ width: 100 }}
                                            options={[
                                                {
                                                    label: '普通文本',
                                                    value: FILE_TYPE.text,
                                                },
                                                {
                                                    label: 'Md文档',
                                                    value: FILE_TYPE.Markdown,
                                                },
                                                {
                                                    label: 'HTML文档',
                                                    value: FILE_TYPE.Html,
                                                },
                                            ]}
                                        />
                                    </Form.Item>
                                    <Input />
                                </Space.Compact>
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