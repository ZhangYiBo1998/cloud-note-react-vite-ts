import React, {useState} from 'react';
import {Outlet} from "react-router";
import SystemHeader from "./components/SystemHeader";
import {
    SettingsContext,
    type ISettings,
} from "./utils/context";
import './App.css'

const App: React.FC = () => {
    // 获取配置项
    const [settings, setSettings] = useState<ISettings>({
        theme: 'light',
        closeType: 'hide',
    });
    return (
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
    )
}
export default App
