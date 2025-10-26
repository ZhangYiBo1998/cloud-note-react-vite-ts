import React, {useEffect, useState, memo} from "react";
import {
    Input,
    Flex,
} from "antd";
import CreateNoteButton from "./components/CreateNoteButton";
import ToastUIEditor from "../components/ToastUIEditor";
import {FILE_TYPE} from "../../utils/Enums";

const NoteEdit: React.FC = () => {
    const [editorType, setEditorType] = useState('txt');

    useEffect(() => {

    }, []);

    return (
        <div className="scrollable">
            <Flex vertical justify="space-between" gap={10} style={{padding: 10}}>
                <Input placeholder="标题"/>
                {
                    editorType === FILE_TYPE.text && <Input.TextArea placeholder="内容" autoSize={{minRows: 17, maxRows: 17}}/>
                }
                {
                    editorType === FILE_TYPE.Markdown && <ToastUIEditor/>
                }
            </Flex>
            <CreateNoteButton
                onChange={(type) => {
                    setEditorType(type)
                }}
            />
        </div>
    );
};

export default memo(NoteEdit);