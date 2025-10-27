import React, {useEffect, memo, useState, useContext} from "react";
import {Card, Switch, Form, Input} from 'antd';
import {
    EllipsisOutlined,
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
    // 开机自启
    const [autoLaunchValue, setAutoLaunchValue] = useState(false);

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

    return (
        <Card title="设置" variant="borderless">
            <Form>
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
            </Form>
        </Card>
    );
};

export default memo(Setting);