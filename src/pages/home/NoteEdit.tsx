import React, {useEffect, useState, memo, useCallback} from "react";
import {
    Select,
    Input,
    Flex,
} from "antd";
import ToastUIEditor from "../components/ToastUIEditor";
import {FILE_TYPE} from "../../utils/Enums";
import {useParams} from "react-router";
import type {INoteItem} from "../../types";
import {debounce} from "../../utils/tool";
import useNoteInfo from "../hooks/useNoteInfo";

const NoteEdit: React.FC = () => {
    const params = useParams();
    const {
        groupsMap,
    } = useNoteInfo()
    const [editorType, setEditorType] = useState('txt');
    const [tagsValue, setTagsValue] = useState<string[]>([]);
    const [noteValue, setNoteValue] = useState('');

    useEffect(() => {
        if (!params.id) {
            return;
        }
        window.electronAPI?.readNoteAsync(params.id).then((data: string) => {
            const noteInfo = groupsMap[params.id as string] as INoteItem;
            setEditorType(`.${noteInfo.name?.split?.('.')?.[1]}`);
            setTagsValue(noteInfo.tags || [])
            setNoteValue(data)
        })
    }, [params.id]);

    useEffect(() => {

    }, [tagsValue]);

    const writeNoteAsync = useCallback(debounce((value: string) => {
        if (!params.id) {
            return;
        }
        window.electronAPI?.writeNoteAsync(params.id, value)
    }, 3000), [params.id])

    return (
        <div className="scrollable" key={params.id}>
            <Flex vertical gap={10} style={{padding: 10}}>
                <Select
                    mode="tags"
                    style={{width: '100%'}}
                    placeholder="Tags Mode"
                    value={tagsValue}
                    onChange={setTagsValue}
                />
                {
                    editorType === FILE_TYPE.text && (
                        <Input.TextArea
                            style={{
                                height: 'calc(100vh - 160px)'
                            }}
                            placeholder="内容"
                            // autoSize={{minRows: 17, maxRows: 17}}
                            value={noteValue}
                            onChange={(e) => {
                                setNoteValue(e.target.value)
                                writeNoteAsync(e.target.value)
                            }}
                        />
                    )
                }
                {
                    editorType === FILE_TYPE.Markdown && (
                        <ToastUIEditor
                            style={{
                                height: 'calc(100vh - 160px)'
                            }}
                            value={noteValue}
                            onChange={(v: string) => {
                                setNoteValue(v)
                                writeNoteAsync(v)
                            }}
                        />
                    )
                }
            </Flex>
        </div>
    );
};

export default memo(NoteEdit);