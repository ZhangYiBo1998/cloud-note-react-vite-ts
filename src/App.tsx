/**
 * 应用根组件
 *
 * 职责：配置加载、主题切换、全局 Context 提供、Ant Design ConfigProvider 包裹。
 * 启动流程：getConfigJsonAsync → 初始化 settings/groupsMap → 渲染路由树。
 */
import React, {useEffect, useMemo, useState, useRef} from 'react';
import {Outlet, useNavigate} from "react-router";
import {ConfigProvider} from "antd";
import SystemHeader from "./components/SystemHeader";
import {
    SettingsContext,
    ConfigContext,
    GroupsContext,
    SidebarContext,
} from "./utils/context";
import type {
    ISettings,
    IConfigData,
    IGroupsContextValue,
    IGroupsMap,
} from "./types";
import {useResizablePanel} from "./hooks/useResizablePanel";
import {lightTheme, darkTheme} from "./theme/tokens";
import './App.css'

const App: React.FC = () => {
    /** 应用配置（config.json 内容） */
    const [config, setConfig] = useState<IConfigData>({});
    /** 笔记分组元数据 */
    const [groupsConfig, setGroupsConfig] = useState<IGroupsContextValue['groupsConfig']>({});
    /** 用户偏好设置 */
    const [settings, setSettings] = useState<ISettings>({
        theme: 'light',
        closeType: 'hide',
    });

    /** 侧边栏可拖拽/折叠状态 */
    const sidebar = useResizablePanel();
    const navigate = useNavigate();

    // 监听托盘菜单"设置"导航指令
    useEffect(() => {
        window.electronAPI?.onNavigateTo((path: string) => {
            navigate(path);
        });
    }, [navigate]);

    // 根据主题切换选择对应的 Ant Design token 配置
    const theme = useMemo(() => settings.theme === 'dark' ? darkTheme : lightTheme, [settings.theme]);

    // 动态设置 CSS 自定义属性，控制非 Ant Design 组件的主题色彩
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
            root.style.setProperty('--content-bg', '#f5f5f7');
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

    // 标记初始化是否完成，防止 persistence useEffect 在 init 之前覆盖配置
    const isInitialized = useRef(false);

    // 应用启动初始化：加载配置 → 提取 settings → 加载笔记分组
    useEffect(() => {
        const init = async () => {
            try {
                const configResult = await window.electronAPI?.getConfigJsonAsync();
                console.log('[App] config loaded:', configResult);
                if (!configResult?.success || !configResult.data) {
                    console.warn('[App] Failed to load config, using defaults');
                    setConfig({});
                    return;
                }
                const _config = configResult.data;
                setConfig(_config);

                // 从持久化配置中恢复用户偏好
                setSettings({
                    theme: (_config.theme as 'light' | 'dark') || 'light',
                    closeType: (_config.closeType as 'hide' | 'quit') || 'hide',
                });

                // 有存档目录时才加载笔记列表
                const saveDir = _config.saveDirectory;
                if (saveDir) {
                    const groupsResult = await window.electronAPI?.getNoteGroupsAsync(saveDir);
                    if (groupsResult?.success) {
                        setGroupsConfig(groupsResult.data || {});
                    }
                }
            } catch (err) {
                console.error('[App] init error:', err);
                setConfig({});
            } finally {
                // init 完成后才允许 persistence effect 写入
                isInitialized.current = true;
            }
        }
        init();
    }, []);

    // 主题/关闭行为变更时自动持久化到 config.json（仅在 init 完成后生效）
    useEffect(() => {
        if (!isInitialized.current) return;
        window.electronAPI?.updateConfigJsonAsync({
            theme: settings.theme,
            closeType: settings.closeType,
        });
    }, [settings.theme, settings.closeType]);

    /**
     * 将 groups 数组扁平化为 key → item 映射
     * group 条目 type='group', parent=null
     * file 条目 type='file', parent=groupKey
     * 用于 O(1) 时间复杂度的笔记路径解析
     */
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
                        <SidebarContext.Provider value={sidebar}>
                            <SystemHeader>
                                <Outlet/>
                            </SystemHeader>
                        </SidebarContext.Provider>
                    </SettingsContext.Provider>
                </GroupsContext.Provider>
            </ConfigContext.Provider>
        </ConfigProvider>
    )
}
export default App
