import React, {useEffect, useMemo, useState} from 'react';
import {Outlet} from "react-router";
import {ConfigProvider} from "antd";
import SystemHeader from "./components/SystemHeader";
import {
    SettingsContext,
    ConfigContext,
    GroupsContext,
} from "./utils/context";
import type {
    ISettings,
    IConfigData,
    IGroupsContextValue,
    IGroupsMap,
} from "./types";
import {lightTheme, darkTheme} from "./theme/tokens";
import './App.css'

const App: React.FC = () => {
    // APP配置项
    const [config, setConfig] = useState<IConfigData>({});
    // 笔记列表
    const [groupsConfig, setGroupsConfig] = useState<IGroupsContextValue['groupsConfig']>({});
    // 设置页配置
    const [settings, setSettings] = useState<ISettings>({
        theme: 'light',
        closeType: 'hide',
    });

    const theme = useMemo(() => settings.theme === 'dark' ? darkTheme : lightTheme, [settings.theme]);

    // 同步 CSS 变量到 :root，保证深色模式下自定义颜色也切换
    useEffect(() => {
        const root = document.documentElement;
        if (settings.theme === 'dark') {
            root.style.setProperty('--header-bg', '#1c1c1e');
            root.style.setProperty('--sidebar-bg', '#1c1c1e');
            root.style.setProperty('--content-bg', '#2c2c2e');
            root.style.setProperty('--text-primary', '#f5f5f7');
            root.style.setProperty('--text-secondary', '#98989d');
            root.style.setProperty('--border-color', '#3a3a3c');
            root.style.setProperty('--btn-bg', 'rgba(77, 166, 255, 0.10)');
            root.style.setProperty('--btn-border', 'rgba(77, 166, 255, 0.25)');
            root.style.setProperty('--btn-color', '#4da6ff');
            root.style.setProperty('--btn-hover-bg', 'rgba(77, 166, 255, 0.18)');
            root.style.setProperty('--btn-hover-border', 'rgba(77, 166, 255, 0.4)');
            root.style.setProperty('--btn-hover-color', '#7dc4ff');
        } else {
            root.style.setProperty('--header-bg', '#f5f5f7');
            root.style.setProperty('--sidebar-bg', '#fafafa');
            root.style.setProperty('--content-bg', '#ffffff');
            root.style.setProperty('--text-primary', '#1d1d1f');
            root.style.setProperty('--text-secondary', '#6e6e73');
            root.style.setProperty('--border-color', '#e8e8ed');
            root.style.setProperty('--btn-bg', '#ffffff');
            root.style.setProperty('--btn-border', '#d2d2d7');
            root.style.setProperty('--btn-color', '#1d1d1f');
            root.style.setProperty('--btn-hover-bg', 'rgba(0, 113, 227, 0.08)');
            root.style.setProperty('--btn-hover-border', '#0071e3');
            root.style.setProperty('--btn-hover-color', '#0071e3');
        }
    }, [settings.theme]);

    useEffect(() => {
        const init = async () => {
            try {
                // 读取 config.json 的配置项
                const _config = await window.electronAPI?.getConfigJsonAsync();
                console.log('[App] config loaded:', _config);
                if (!_config) {
                    console.warn('[App] Failed to load config, using defaults');
                    setConfig({})
                    return;
                }
                setConfig(_config)

                // 从配置中初始化设置项
                setSettings({
                    theme: (_config.theme as 'light' | 'dark') || 'light',
                    closeType: (_config.closeType as 'hide' | 'quit') || 'hide',
                })

                // 获取保存目录后，读取笔记列表
                const saveDir = _config.saveDirectory;
                if (saveDir) {
                    // 读取笔记列表
                    const _groupsConfig = await window.electronAPI?.getNoteGroupsAsync(saveDir);
                    setGroupsConfig(_groupsConfig || {})
                }
            } catch (err) {
                console.error('[App] init error:', err);
                setConfig({});
            }
        }
        init();
    }, []);

    // Persist settings changes (theme, closeType) to config.json
    useEffect(() => {
        (window as any).__closeType = settings.closeType;
        window.electronAPI?.updateConfigJsonAsync({
            theme: settings.theme,
            closeType: settings.closeType,
        });
    }, [settings.theme, settings.closeType]);

    const groupsMap = useMemo(() => {
        return groupsConfig?.groups?.reduce((obj, item) => {
            obj[item.key] = {
                ...item,
                type: 'group',
                parent: null,
            };
            if (Array.isArray(item.children)) {
                item.children.forEach((it: any) => {
                    it.parent = item.key;
                    it.type = 'file';
                    obj[it.key] = it;
                })
            }
            return obj;
        }, {} as IGroupsMap) || {};
    }, [groupsConfig]);

    return (
        <ConfigProvider theme={theme}>
            <ConfigContext.Provider value={{ config, setConfig }}>
                <GroupsContext.Provider value={{
                    groupsMap,
                    groupsConfig,
                    setGroupsConfig,
                }}>
                    <SettingsContext.Provider
                        value={{
                            settings,
                            setSettings,
                        }}
                    >
                        <SystemHeader>
                            <Outlet/>
                        </SystemHeader>
                    </SettingsContext.Provider>
                </GroupsContext.Provider>
            </ConfigContext.Provider>
        </ConfigProvider>
    )
}
export default App
