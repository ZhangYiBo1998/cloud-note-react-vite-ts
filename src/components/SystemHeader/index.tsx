import React, {memo} from "react";
import type {PropsWithChildren} from "react";
import {
    MinusOutlined,
    CloseOutlined,
    SettingOutlined,
    HomeOutlined,
} from '@ant-design/icons';
import {Flex} from "antd";
import {useNavigate, useLocation} from "react-router";

const SystemHeader: React.FC<PropsWithChildren> = (props) => {
    const {children} = props;
    const navigate = useNavigate();
    const location = useLocation();
    const isSettings = location.pathname.startsWith('/setting');

    return (
        <Flex vertical style={{ height: '100vh' }}>
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
                <Flex align="center" gap={6} style={{ fontSize: 13, color: 'var(--text-secondary, #6e6e73)' }}>
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
                <Flex>
                    <Flex
                        className="no-drag-area system-icon system-icon-minimize"
                        justify="center"
                        align="center"
                        onClick={() => window.electronAPI?.hideWindow()}
                    >
                        <MinusOutlined style={{ fontSize: 12 }} />
                    </Flex>
                    <Flex
                        className="no-drag-area system-icon system-icon-close"
                        justify="center"
                        align="center"
                        onClick={() => {
                            const closeType = (window as any).__closeType;
                            if (closeType === 'quit') {
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
            {children}
        </Flex>
    );
};

export default memo(SystemHeader);