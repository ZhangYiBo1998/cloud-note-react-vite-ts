import React, {useRef, useState, useContext} from 'react';
import {PlusOutlined} from '@ant-design/icons';
import {FloatButton, Tooltip, Modal, Form, Select, Button, Space, Flex} from 'antd';
import IconMD from "../../../assets/icon-markdown.svg";;
import {
    ConfigContext,
} from "../../../utils/context";

const Icon = (props: { src: string }) => {
    const {src} = props;
    return (
        <div>
            <img style={{width: 18, height: 18}} src={src} alt=""/>
        </div>
    )
}

interface IFieldValues {
    group: string;
}

const CreateNoteButton: React.FC<{ onChange: (fileType: string) => void }> = (props) => {
    const {
        onChange,
    } = props;
    const config = useContext(ConfigContext);
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const typeRef = useRef('');

    const floatButtonList = [
        {
            id: 'Md',
            label: 'Markdown文件',
            icon: <Icon src={IconMD}/>,
            onClick: () => {
                typeRef.current = 'Md';
                setIsModalOpen(true);
            },
        },
        {
            id: 'txt',
            label: '普通文本',
            onClick: () => {
                typeRef.current = 'txt';
                setIsModalOpen(true);
            },
        },
    ]

    const groupOptions = (config.groups || []).map((item) => {
        return {
            ...item,
            value: item.key,
        }
    })

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
                    onFinish={(values) => {
                        console.log(values);
                        onChange(typeRef.current);
                        setIsModalOpen(false);

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