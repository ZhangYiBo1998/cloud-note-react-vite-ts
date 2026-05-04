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
import React, {useEffect, useState, memo, useRef, useMemo} from "react";
import {
    Select,
    Input,
    Flex,
    Button,
} from "antd";
import {ArrowLeftOutlined} from "@ant-design/icons";
import ToastUIEditor from "../components/ToastUIEditor";
import HtmlEditor from "./components/HtmlEditor";
import {FILE_TYPE} from "../../utils/Enums";
import {useParams, useNavigate} from "react-router";
import type {INoteItem} from "../../types";
import {debounce} from "../../utils/tool";
import useNoteInfo from "../hooks/useNoteInfo";

const NoteEdit: React.FC = () => {
    const params = useParams();
    const navigate = useNavigate();
    const {
        groupsMap,
        groups,
        setGroupsConfig,
    } = useNoteInfo()
    /** 当前笔记信息，从 groupsMap 中获取 */
    const currentNote = params.id ? (groupsMap[params.id] as INoteItem | undefined) : undefined;
    /** 从文件名推导编辑器类型（直接推导，无需 useEffect） */
    const editorType = currentNote
        ? (`.${currentNote.name?.split?.('.')?.[1] ?? ''}` as string)
        : FILE_TYPE.text;
    /** 标签列表 */
    const [tagsValue, setTagsValue] = useState<string[]>([]);
    /** 笔记正文内容 */
    const [noteValue, setNoteValue] = useState('');

    /** 标签池：从所有笔记中收集已有标签供下拉选择 */
    const tagPool = useMemo(() => {
        const set = new Set<string>();
        groups.forEach(g => (g.children || []).forEach(n => (n.tags || []).forEach(t => set.add(t))));
        return Array.from(set).sort();
    }, [groups]);

    // 路由参数变化时（切换笔记），重新加载笔记内容和元数据
    useEffect(() => {
        if (!params.id) {
            setNoteValue('');
            return;
        }
        setNoteValue('');
        window.electronAPI?.readNoteAsync(params.id).then((result) => {
            if (!result?.success) {
                console.error('读取笔记失败:', result?.error);
                setNoteValue('');
                return;
            }
            const noteInfo = groupsMap[params.id as string] as INoteItem;
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
    const writeNoteAsyncRef = useRef<ReturnType<typeof debounce>>();

    useEffect(() => {
        writeNoteAsyncRef.current = debounce((value: string) => {
            if (!params.id) return;
            window.electronAPI?.writeNoteAsync(params.id, value);
        }, 3000);
    }, [params.id]);

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
            {/* 顶部：返回按钮 + 文件名 */}
            <Flex align="center" gap={8} style={{ marginBottom: 8, flexShrink: 0 }}>
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/home')}
                    size="small"
                />
                <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)' }}>
                    {currentNote?.name || ''}
                </span>
            </Flex>

            {/* 编辑器区域：flex: 1 填充剩余高度 */}
            {
                editorType === FILE_TYPE.text && (
                    <Input.TextArea
                        style={{ flex: 1, minHeight: 0 }}
                        placeholder="内容"
                        value={noteValue}
                        onChange={(e) => {
                            setNoteValue(e.target.value)
                            writeNoteAsyncRef.current?.(e.target.value)
                        }}
                    />
                )
            }
            {
                editorType === FILE_TYPE.markdown && (
                    <ToastUIEditor
                        style={{ flex: 1, minHeight: 0 }}
                        value={noteValue}
                        onChange={(v: string) => {
                            setNoteValue(v)
                            writeNoteAsyncRef.current?.(v)
                        }}
                    />
                )
            }
            {
                editorType === FILE_TYPE.html && (
                    <HtmlEditor
                        style={{ flex: 1, minHeight: 0 }}
                        value={noteValue}
                        onChange={(v: string) => {
                            setNoteValue(v)
                            writeNoteAsyncRef.current?.(v)
                        }}
                    />
                )
            }
            {/* 标签输入（支持自由输入 + 从已有标签中选择） */}
            <Select
                mode="tags"
                style={{ width: '100%', marginTop: 10, flexShrink: 0 }}
                placeholder="添加标签..."
                value={tagsValue}
                onChange={setTagsValue}
                options={tagPool.map(t => ({ label: t, value: t }))}
            />
        </div>
    );
};

export default memo(NoteEdit);
