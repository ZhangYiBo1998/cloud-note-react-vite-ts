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
        groups,
        setGroupsConfig,
    } = useNoteInfo()
    const [editorType, setEditorType] = useState(FILE_TYPE.text);
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

    // Persist tags to groups.json when they change (no debounce needed — Select fires on explicit add/remove)
    useEffect(() => {
        if (!params.id) return;
        const noteId = params.id;
        const tags = tagsValue;
        window.electronAPI?.updateNoteTagsAsync(noteId, tags);
        // Update local groupsConfig so groupsMap reflects tag changes
        const updatedGroups = groups.map((g) => {
            if (g.children?.some(c => c.key === noteId)) {
                return {
                    ...g,
                    children: g.children.map(c =>
                        c.key === noteId ? { ...c, tags, updateTime: Date.now() } : c
                    ),
                };
            }
            return g;
        });
        setGroupsConfig({ groups: updatedGroups });
    }, [tagsValue]);

    const writeNoteAsync = useCallback(debounce((value: string) => {
        if (!params.id) {
            return;
        }
        window.electronAPI?.writeNoteAsync(params.id, value)
    }, 3000), [params.id])

    // 未选中笔记时显示占位提示
    if (!params.id) {
        return (
            <Flex justify="center" align="center" style={{ height: '100%', color: 'var(--text-secondary, #6e6e73)', fontSize: 14 }}>
                选择或新建一条笔记开始编辑
            </Flex>
        );
    }

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