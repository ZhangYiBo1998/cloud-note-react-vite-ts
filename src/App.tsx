import React, {useEffect, useState} from 'react';
import {Outlet} from "react-router";
import '@ant-design/v5-patch-for-react-19';
import SystemHeader from "./components/SystemHeader";
import {
    SettingsContext,
    ConfigContext,
    GroupsContext,
} from "./utils/context";
import type {
    ISettings,
    IConfigContextValue,
    IGroupsContextValue,
} from "./types";
import './App.css'

const App: React.FC = () => {
    // APP配置项
    const [config, setConfig] = useState<IConfigContextValue>({});
    // 笔记列表
    const [groupsConfig, setGroupsConfig] = useState<IGroupsContextValue['groupsConfig']>({});
    // 设置页配置
    const [settings, setSettings] = useState<ISettings>({
        theme: 'light',
        closeType: 'hide',
    });

    useEffect(() => {
        const init = async () => {
            // 读取 config.json 的配置项
            const _config = await window.electronAPI?.getConfigJsonAsync();
            setConfig(_config)

            // 获取保存目录后，读取笔记列表
            const saveDir = _config.saveDirectory;
            if (saveDir) {
                // 读取笔记列表
                const _groupsConfig = await window.electronAPI?.getNoteGroupsAsync(saveDir);
                setGroupsConfig(_groupsConfig)
            }
        }
        init();
    }, []);

    return (
        <ConfigContext value={config}>
            <GroupsContext value={{
                groupsConfig,
                setGroupsConfig,
            }}>
                <SettingsContext
                    value={{
                        settings,
                        setSettings,
                    }}
                >
                    <SystemHeader>
                        <Outlet/>
                    </SystemHeader>
                </SettingsContext>
            </GroupsContext>
        </ConfigContext>
    )
}
export default App
