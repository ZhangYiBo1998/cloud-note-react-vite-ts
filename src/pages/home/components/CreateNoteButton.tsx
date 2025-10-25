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

const CreateNoteButton: React.FC<{ onChange: (fileType: string) => void}> = (props) => {
    const {
        onChange,
    } = props;

    return (
        <>
            <FloatButton.Group
                trigger="click"
                type="primary"
                style={{bottom: 24}}
                icon={<PlusOutlined/>}
            >
                <Tooltip title="普通文本">
                    <FloatButton
                        icon={<Icon src={IconTxt}/>}
                        onClick={() => {
                            onChange('txt')
                        }}
                    />
                </Tooltip>
                <Tooltip title="富文本">
                    <FloatButton
                        onClick={() => {
                            onChange('richTxt')
                        }}
                    />
                </Tooltip>
            </FloatButton.Group>
        </>
    )
};

export default CreateNoteButton;