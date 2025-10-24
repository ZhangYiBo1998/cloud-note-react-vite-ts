import React, {memo } from "react";
import type {PropsWithChildren} from "react";
import {
    MinusOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import {Flex} from "antd";

const SystemHeader: React.FC<PropsWithChildren> = (props) => {
    const {children} = props;

    return (
        <div>
            <Flex justify="flex-end" gap={20}>
                <MinusOutlined className="cursor-pointer" onClick={() => window.electronAPI?.hideWindow()}/>
                <CloseOutlined className="cursor-pointer" onClick={() => window.electronAPI?.closeWindow()}/>
            </Flex>
            <div>
                {children}
            </div>
        </div>
    );
};

export default memo(SystemHeader);