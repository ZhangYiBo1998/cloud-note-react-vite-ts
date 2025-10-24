import React, {memo, useEffect, useRef, useState} from "react";
import type {PropsWithChildren} from "react";
import {
    HomeOutlined,
    SettingOutlined,
    MinusOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import {Flex} from "antd";
import EventEmitter from "../../utils/eventBus";

const SystemHeader: React.FC<PropsWithChildren> = (props) => {
    const {children} = props;
    const [isHome, setIsHome] = useState(true);
    const eventBusRef = useRef<any>(null);

    useEffect(() => {
        eventBusRef.current = new EventEmitter();
    }, []);

    return (
        <Flex vertical style={{height: '100vh'}}>
            <Flex className="drag-area" justify="space-between" style={{padding: '10px 15px'}}>
                <Flex>
                    {
                        isHome ? (
                            <SettingOutlined
                                className="no-drag-area"
                                onClick={() => {
                                    eventBusRef.current?.emit('toSetting')
                                    setIsHome(false)
                                }}
                            />
                        ) : (
                            <HomeOutlined
                                className="no-drag-area"
                                onClick={() => {
                                    eventBusRef.current?.emit('toHome')
                                    setIsHome(true)
                                }}
                            />
                        )
                    }
                </Flex>
                <Flex gap={30}>
                    <MinusOutlined
                        className="no-drag-area"
                        onClick={() => window.electronAPI?.hideWindow()}
                    />
                    <CloseOutlined
                        className="no-drag-area" onClick={() => window.electronAPI?.closeWindow()}
                    />
                </Flex>
            </Flex>
            {children}
        </Flex>
    );
};

export default memo(SystemHeader);