import React, {useEffect, useState, useRef, memo} from "react";
import {
    Input,
    Flex,
} from "antd";
import CreateNoteButton from "./CreateNoteButton";

const NoteEdit: React.FC = () => {
    const [editorType, setEditorType] = useState('txt');

    useEffect(() => {

    }, []);

    return (
        <div className="scrollable">
            <Flex vertical justify="space-between" gap={10} style={{padding: 10}}>
                <Input placeholder="标题"/>
                {
                    editorType === 'txt' && <Input.TextArea placeholder="内容"/>
                }
            </Flex>
            <CreateNoteButton onChange={(type) => {setEditorType(type)}}/>
        </div>
    );
};

export default memo(NoteEdit);