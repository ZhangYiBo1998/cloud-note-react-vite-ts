import React, { useState, useMemo, useEffect, useRef, useCallback, useContext } from "react";
import { Flex, Typography, Modal, message } from "antd";
import { useNavigate } from "react-router";
import useNoteInfo from "../../hooks/useNoteInfo";
import { MemoFilterContext } from "../../../utils/context";
import MemoCard from "./MemoCard";
import type { IMemoItem } from "../../../types";

const ITEM_HEIGHT = 120;
const OVERSCAN = 5;

/** 备忘录列表面板 —— 虚拟滚动，按创建时间倒序展示，支持标签/分组过滤 */
const MemoList: React.FC = () => {
    const { groups, setGroupsConfig } = useNoteInfo();
    const { selectedTag, selectedGroupKey, panelMode } = useContext(MemoFilterContext);
    const navigate = useNavigate();

    /** 删除备忘（含二次确认弹窗） */
    const deleteNoteInGroup = useCallback((noteKey: string) => {
        Modal.confirm({
            title: '提示',
            content: '确认删除该备忘？',
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                const result = await window.electronAPI?.deleteNoteInGroupAsync(noteKey);
                if (result?.success && result.data) {
                    setGroupsConfig(result.data);
                } else {
                    message.error(result?.error || '删除失败');
                }
            },
        });
    }, [setGroupsConfig]);

    const memos: IMemoItem[] = useMemo(() => {
        const all: IMemoItem[] = [];
        groups.forEach(group => {
            (group.children || []).forEach(note => {
                all.push({
                    ...note,
                    parent: group.key,
                    parentName: group.name,
                });
            });
        });

        let filtered = all;

        // 标签模式：按选中标签过滤
        if (panelMode === 'tag' && selectedTag) {
            filtered = all.filter(n => (n.tags || []).includes(selectedTag));
        }

        // 分组模式：按选中分组过滤
        if (panelMode === 'group' && selectedGroupKey) {
            filtered = all.filter(n => n.parent === selectedGroupKey);
        }

        return filtered.sort((a, b) => b.createTime - a.createTime);
    }, [groups, selectedTag, selectedGroupKey, panelMode]);

    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(entries => {
            setContainerHeight(entries[0].contentRect.height);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const handleScroll = useCallback(() => {
        if (containerRef.current) {
            setScrollTop(containerRef.current.scrollTop);
        }
    }, []);

    // 可见范围计算
    const totalHeight = memos.length * ITEM_HEIGHT;
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
    const endIndex = Math.min(memos.length, Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN);
    const visibleMemos = memos.slice(startIndex, endIndex);
    const offsetY = startIndex * ITEM_HEIGHT;

    // 空态
    if (memos.length === 0) {
        return (
            <Flex justify="center" align="center" style={{ height: '100%', color: 'var(--text-secondary)', fontSize: 14 }}>
                {selectedTag
                    ? `标签"${selectedTag}"下没有匹配的备忘`
                    : selectedGroupKey
                        ? '该分组下暂无备忘'
                        : '还没有备忘，点击左侧"新建笔记"开始'}
            </Flex>
        );
    }

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{ height: '100%', overflowY: 'auto', padding: '12px' }}
        >
            <div style={{ position: 'relative', height: totalHeight }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, transform: `translateY(${offsetY}px)` }}>
                    {visibleMemos.map((memo) => (
                        <MemoCard
                            key={memo.key}
                            memo={memo}
                            onClick={() => navigate(`/home/note/${memo.key}`)}
                            onDelete={() => deleteNoteInGroup(memo.key)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MemoList;
