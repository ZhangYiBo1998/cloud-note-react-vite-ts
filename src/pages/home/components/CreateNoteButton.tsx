import React from 'react';
import {PlusOutlined} from '@ant-design/icons';
import {FloatButton, Tooltip} from 'antd';
import IconTxt from "../../../assets/icon-txt.svg";

const Icon = (props: { src: string }) => {
    const {src} = props;
    return (
        <div>
            <img style={{width: 18, height: 18}} src={src} alt=""/>
        </div>
    )
}

const App: React.FC = () => (
    <>
        <FloatButton.Group
            trigger="click"
            type="primary"
            style={{bottom: 24}}
            icon={<PlusOutlined/>}
        >
            <Tooltip title="普通文本">
                <FloatButton icon={<Icon src={IconTxt}/>}/>
            </Tooltip>
            <Tooltip title="富文本">
                <FloatButton/>
            </Tooltip>
        </FloatButton.Group>
    </>
);

export default App;