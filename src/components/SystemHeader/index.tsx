import React, {memo, useContext, useState} from "react";
import type {PropsWithChildren} from "react";
import {
    HomeOutlined,
    SettingOutlined,
    MinusOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import {Flex} from "antd";
import {useNavigate} from "react-router";
import {
    SettingsContext,
} from "../../utils/context";

const SystemHeader: React.FC<PropsWithChildren> = (props) => {
    const {children} = props;
    // 获取配置项
    const {settings} = useContext(SettingsContext);
    const navigate = useNavigate();

    const [isHome, setIsHome] = useState(true);

    return (
        <Flex vertical>
            <Flex
                className="drag-area" justify="space-between"
                style={{height: '40px', backgroundColor: '#7ed0f6', paddingLeft: '15px'}}
            >
                <Flex>
                    {
                        isHome ? (
                            <SettingOutlined
                                className="no-drag-area"
                                onClick={() => {
                                    navigate('/setting')
                                    setIsHome(false)
                                }}
                            />
                        ) : (
                            <HomeOutlined
                                className="no-drag-area"
                                onClick={() => {
                                    navigate(-1)
                                    setIsHome(true)
                                }}
                            />
                        )
                    }
                </Flex>
                <Flex>
                    <Flex
                        className="no-drag-area system-icon-Minus"
                        style={{ width: '40px', height: '40px' }}
                        justify="center"
                        align="center"
                        onClick={() => window.electronAPI?.hideWindow()}
                    >
                        <MinusOutlined />
                    </Flex>
                    <Flex
                        className="no-drag-area system-icon-close"
                        style={{ width: '40px', height: '40px' }}
                        justify="center"
                        align="center"
                        onClick={() => {
                            if (settings.closeType === 'hide') {
                                window.electronAPI?.hideWindow();
                                return;
                            }

                            if (settings.closeType === 'quit') {
                                window.electronAPI?.closeWindow();
                                return;
                            }
                        }}
                    >
                        <CloseOutlined />
                    </Flex>
                </Flex>
            </Flex>
            {children}
        </Flex>
    );
};

export default memo(SystemHeader);