import React, {useEffect, useState, memo} from "react";
import {
    Select,
    Input,
    Flex,
} from "antd";
import CreateNoteButton from "./components/CreateNoteButton";
import ToastUIEditor from "../components/ToastUIEditor";
import {FILE_TYPE} from "../../utils/Enums";
import {useParams} from "react-router";
import type {INoteInfoMap} from "../../types";

const NoteEdit: React.FC = () => {
    const params = useParams();
    const [editorType, setEditorType] = useState('txt');
    const [tagsValue, setTagsValue] = useState<string[]>([]);
    const [noteValue, setNoteValue] = useState('');

    useEffect(() => {
        console.log('useParams', params.id);
        if (!params.id) {
            return;
        }
        window.electronAPI?.readNoteAsync(params.id).then((config: INoteInfoMap) => {
            setEditorType(config.name?.split?.('.')?.[1]);
            setTagsValue(config.tags || [])
            setNoteValue(config.content)
        })
    }, [params.id]);

    return params.id && (
        <div className="scrollable" key={params.id}>
            <Flex vertical justify="space-between" gap={10} style={{padding: 10}}>
                <Select
                    mode="tags"
                    style={{ width: '100%' }}
                    placeholder="Tags Mode"
                    value={tagsValue}
                    onChange={setTagsValue}
                />
                {
                    editorType === FILE_TYPE.text && (
                        <Input.TextArea
                            placeholder="内容"
                            autoSize={{minRows: 17, maxRows: 17}}
                            value={noteValue}
                            onChange={(e) => {
                                setNoteValue(e.target.value)
                            }}
                        />
                    )
                }
                {
                    editorType === FILE_TYPE.Markdown && (
                        <ToastUIEditor
                            value={noteValue}
                            onChange={(v: string) => {
                                setNoteValue(v)
                            }}
                        />
                    )
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