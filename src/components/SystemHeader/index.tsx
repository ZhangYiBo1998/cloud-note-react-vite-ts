/**
 * 系统标题栏组件
 *
 * 自定义窗口标题栏（frame: false），包含：
 * - 左侧：设置/首页导航图标 + 应用名
 * - 右侧：最小化 → 隐藏到托盘、关闭按钮（根据 closeType 决定隐藏还是退出）
 * - 顶部区域可拖拽移动窗口（drag-area）
 */
import React, {memo, useContext, useEffect, useState} from "react";
import type {PropsWithChildren} from "react";
import {
    MinusOutlined,
    CloseOutlined,
    SettingOutlined,
    HomeOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    PushpinOutlined,
    PushpinFilled,
    CodeOutlined,
} from '@ant-design/icons';
import {Flex} from "antd";
import {useNavigate, useLocation} from "react-router";
import {SidebarContext, SettingsContext, ConfigContext} from "../../utils/context";
import {useShortcut} from "../../hooks/useShortcut";

const SystemHeader: React.FC<PropsWithChildren> = (props) => {
    const {children} = props;
    const navigate = useNavigate();
    const location = useLocation();
    const isSettings = location.pathname.startsWith('/setting');
    const { collapsed, toggleCollapse } = useContext(SidebarContext);
    const { settings } = useContext(SettingsContext);
    const { config } = useContext(ConfigContext);
    const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);

    // 注册开发者工具快捷键（默认 Ctrl+Shift+I）
    useShortcut(config.devToolsShortcut || 'Ctrl+Shift+I', () => {
        window.electronAPI?.toggleDevTools();
    });

    useEffect(() => {
        window.electronAPI?.onAlwaysOnTopChanged((isOnTop: boolean) => {
            setIsAlwaysOnTop(isOnTop);
        });
    }, []);

    return (
        <Flex vertical style={{ height: '100vh' }}>
            {/* 拖拽栏（drag-area） */}
            <Flex
                className="drag-area"
                justify="space-between"
                align="center"
                style={{
                    height: '36px',
                    paddingLeft: '12px',
                    paddingRight: '4px',
                    background: 'var(--header-bg, transparent)',
                    userSelect: 'none',
                }}
            >
                {/* 左侧导航区域 */}
                <Flex align="center" gap={4} style={{ fontSize: 13, color: 'var(--text-secondary, #6e6e73)' }}>
                    {/* 侧边栏折叠/展开按钮 */}
                    {!isSettings && (
                        <Flex
                            className="no-drag-area system-icon"
                            justify="center"
                            align="center"
                            onClick={toggleCollapse}
                            title={collapsed ? '展开侧边栏' : '折叠侧边栏'}
                        >
                            {collapsed
                                ? <MenuUnfoldOutlined style={{ fontSize: 13 }} />
                                : <MenuFoldOutlined style={{ fontSize: 13 }} />
                            }
                        </Flex>
                    )}
                    {/* 齿轮/首页图标：根据当前路由自动切换 */}
                    <Flex
                        className="no-drag-area system-icon"
                        justify="center"
                        align="center"
                        onClick={() => navigate(isSettings ? '/home' : '/setting')}
                        title={isSettings ? '返回首页' : '设置'}
                    >
                        {isSettings
                            ? <HomeOutlined style={{ fontSize: 13 }} />
                            : <SettingOutlined style={{ fontSize: 13 }} />
                        }
                    </Flex>
                    Cloud Note
                </Flex>
                {/* 右侧窗口控制区域 */}
                <Flex align="center" gap={2}>
                    {/* Chrome DevTools */}
                    <Flex
                        className="no-drag-area system-icon"
                        justify="center"
                        align="center"
                        onClick={() => window.electronAPI?.toggleDevTools()}
                        title="开发者工具"
                    >
                        <CodeOutlined style={{ fontSize: 13 }} />
                    </Flex>
                    {/* 磁铁按钮：窗口始终置顶 */}
                    <Flex
                        className={`no-drag-area system-icon${isAlwaysOnTop ? ' system-icon-magnet-active' : ''}`}
                        justify="center"
                        align="center"
                        onClick={() => window.electronAPI?.toggleAlwaysOnTop()}
                        title={isAlwaysOnTop ? '取消置顶' : '窗口置顶'}
                    >
                        {isAlwaysOnTop
                            ? <PushpinFilled style={{ fontSize: 13 }} />
                            : <PushpinOutlined style={{ fontSize: 13 }} />
                        }
                    </Flex>
                    {/* 最小化 → 隐藏到系统托盘 */}
                    <Flex
                        className="no-drag-area system-icon system-icon-minimize"
                        justify="center"
                        align="center"
                        onClick={() => window.electronAPI?.hideWindow()}
                    >
                        <MinusOutlined style={{ fontSize: 12 }} />
                    </Flex>
                    {/* 关闭按钮：根据 closeType 决定退出还是隐藏 */}
                    <Flex
                        className="no-drag-area system-icon system-icon-close"
                        justify="center"
                        align="center"
                        onClick={() => {
                            if (settings.closeType === 'quit') {
                                window.electronAPI?.closeWindow();
                            } else {
                                window.electronAPI?.hideWindow();
                            }
                        }}
                    >
                        <CloseOutlined style={{ fontSize: 12 }} />
                    </Flex>
                </Flex>
            </Flex>
            {/* 路由内容出口 */}
            {children}
        </Flex>
    );
};

export default memo(SystemHeader);
