import React, {useEffect, memo, useState, useContext} from "react";
import {Card, Switch, Form, Input, Modal} from 'antd';
import {
    EllipsisOutlined,
    EditOutlined,
    SaveOutlined,
} from '@ant-design/icons';
import {
    SettingsContext,
} from "../../utils/context";
import useNoteInfo from "../hooks/useNoteInfo";

const Setting: React.FC = () => {
    const {settings, setSettings} = useContext(SettingsContext);
    const {
        saveDirectory,
    } = useNoteInfo();

    const [form] = Form.useForm()
    // 开机自启
    const [autoLaunchValue, setAutoLaunchValue] = useState(false);
    const [editDisable, setEditDisable] = useState(true);

    let preGitUrl = 'https://github.com/ZhangYiBo1998/cloud-note-save.git'

    useEffect(() => {
        window.electronAPI.getAutoLaunch().then(enabled => {
            setAutoLaunchValue(enabled)
        })
    }, []);

    const setAutoLaunchHandler = (checked: boolean) => {
        setAutoLaunchValue(checked);
        window.electronAPI?.setAutoLaunch(checked)
    }

    const selectSaveDirectory = async () => {
        const dir = await window.electronAPI?.selectSaveDirectory(saveDirectory);
        if (dir) {
            window.electronAPI?.updateConfigJsonAsync({
                saveDirectory: dir
            });
        }
    }

    const initGitHub = async () => {
        Modal.confirm({
            title: '提示',
            content: '确认修改仓库地址？',
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                const gitUrl = form.getFieldValue('gitUrl')
                preGitUrl = gitUrl;
                window.electronAPI?.initGitHub(gitUrl)
            },
            onCancel: () => {
                setEditDisable(true);
                form.setFieldValue('gitUrl', preGitUrl);
            }
        })
    }

    return (
        <Card title="设置" variant="borderless">
            <Form form={form}>
                <Form.Item label="开机自启">
                    <Switch value={autoLaunchValue} onChange={setAutoLaunchHandler}/>
                </Form.Item>
                <Form.Item label="关闭应用时最小化到系统托盘">
                    <Switch value={settings.closeType === 'hide'}
                            onChange={(checked) => setSettings({...settings, closeType: checked ? 'hide' : 'quit'})}/>
                </Form.Item>
                <Form.Item label="指定存档文件夹">
                    <Input value={saveDirectory} addonAfter={<EllipsisOutlined onClick={selectSaveDirectory}/>}/>
                </Form.Item>
                <Form.Item label="git仓库地址" name="gitUrl">
                    <Input
                        disabled={editDisable}
                        addonAfter={
                            editDisable
                                ? <EditOutlined onClick={() => setEditDisable(false)}/>
                                : <SaveOutlined onClick={initGitHub}/>
                        }
                    />
                </Form.Item>
            </Form>
        </Card>
    );
};

export default memo(Setting);