import React, {memo} from "react";
import type {PropsWithChildren} from "react";
import {
    MinusOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import {Flex} from "antd";

const SystemHeader: React.FC<PropsWithChildren> = (props) => {
    const {children} = props;

    return (
        <Flex vertical style={{height: '100vh'}}>
            <Flex className="drag-area" justify="flex-end" gap={30} style={{padding: '10px 15px'}}>
                <MinusOutlined className="cursor-pointer" onClick={() => window.electronAPI?.hideWindow()}/>
                <CloseOutlined className="cursor-pointer" onClick={() => window.electronAPI?.closeWindow()}/>
            </Flex>
            {children}
        </Flex>
    );
};

export default memo(SystemHeader);