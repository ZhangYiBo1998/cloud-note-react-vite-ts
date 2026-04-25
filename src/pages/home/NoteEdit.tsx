/**
 * 笔记编辑器
 *
 * 根据文件扩展名自动切换编辑器类型：
 * - .txt  → Input.TextArea（纯文本）
 * - .md   → ToastUIEditor（WYSIWYG Markdown）
 * - .html → HtmlEditor（富文本）【待 Task 6 实现】
 *
 * 标签通过 Ant Design Select mode="tags" 管理，变更实时持久化。
 * 笔记内容通过 3 秒防抖自动保存。
 */
import React, {useEffect, useState, memo, useCallback} from "react";
import {
    Select,
    Input,
    Flex,
} from "antd";
import ToastUIEditor from "../components/ToastUIEditor";
import HtmlEditor from "./components/HtmlEditor";
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
    /** 当前文件扩展名，决定渲染哪个编辑器组件 */
    const [editorType, setEditorType] = useState(FILE_TYPE.text);
    /** 标签列表 */
    const [tagsValue, setTagsValue] = useState<string[]>([]);
    /** 笔记正文内容 */
    const [noteValue, setNoteValue] = useState('');

    // 路由参数变化时（切换笔记），重新加载笔记内容和元数据
    useEffect(() => {
        if (!params.id) {
            return;
        }
        window.electronAPI?.readNoteAsync(params.id).then((result) => {
            if (!result?.success) {
                console.error('读取笔记失败:', result?.error);
                setNoteValue('');
                return;
            }
            const noteInfo = groupsMap[params.id as string] as INoteItem;
            // 从文件名提取扩展名判断编辑器类型
            setEditorType(`.${noteInfo.name?.split?.('.')?.[1]}`);
            setTagsValue(noteInfo.tags || [])
            setNoteValue(result.data || '')
        })
    }, [params.id]);

    // 标签变更时立即持久化到 groups.json 并更新本地状态
    useEffect(() => {
        if (!params.id) return;
        const noteId = params.id;
        const tags = tagsValue;
        window.electronAPI?.updateNoteTagsAsync(noteId, tags);
        // 更新本地 groupsConfig 使侧边栏标签实时反映
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

    // 3 秒防抖自动保存，避免频繁写入磁盘
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
        <div className="scrollable" key={params.id} style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 10 }}>
            {/* 编辑器区域：flex: 1 填充剩余高度 */}
            {
                editorType === FILE_TYPE.text && (
                    <Input.TextArea
                        style={{ flex: 1, minHeight: 0 }}
                        placeholder="内容"
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
                        style={{ flex: 1, minHeight: 0 }}
                        value={noteValue}
                        onChange={(v: string) => {
                            setNoteValue(v)
                            writeNoteAsync(v)
                        }}
                    />
                )
            }
            {
                editorType === FILE_TYPE.Html && (
                    <HtmlEditor
                        style={{ flex: 1, minHeight: 0 }}
                        value={noteValue}
                        onChange={(v: string) => {
                            setNoteValue(v)
                            writeNoteAsync(v)
                        }}
                    />
                )
            }
            {/* 标签输入（支持自由输入 + 多选），紧跟编辑器下方 */}
            <Select
                mode="tags"
                style={{ width: '100%', marginTop: 10, flexShrink: 0 }}
                placeholder="Tags Mode"
                value={tagsValue}
                onChange={setTagsValue}
            />
        </div>
    );
};

export default memo(NoteEdit);
