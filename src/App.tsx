import React, {useEffect, useState} from 'react';
import {Outlet} from "react-router";
import '@ant-design/v5-patch-for-react-19';
import SystemHeader from "./components/SystemHeader";
import {
    SettingsContext,
    type ISettings,
    ConfigContext,
} from "./utils/context";
import './App.css'

const App: React.FC = () => {
    const [config, setConfig] = useState({});
    // 获取配置项
    const [settings, setSettings] = useState<ISettings>({
        theme: 'light',
        closeType: 'hide',
    });

    useEffect(() => {
        const init = async () => {
            // 获取本地存储的配置项
            setConfig(await window.electronAPI?.getConfigJsonAsync())
        }
        init();
    }, []);

    return (
        <ConfigContext value={config}>
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

        </ConfigContext>
    )
}
export default App
