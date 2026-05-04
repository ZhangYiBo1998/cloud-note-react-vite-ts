import React, { useMemo, useCallback } from "react";
import { Dropdown, Modal, message } from "antd";
import useNoteInfo from "../../hooks/useNoteInfo";

interface TagPanelProps {
    selectedTag: string | null;
    onTagSelect: (tag: string | null) => void;
    onTagDelete?: (tagName: string) => void;
}

/** 左侧标签列表面板 —— 展示所有标签及其计数，点击过滤备忘列表，右键删除标签 */
const TagPanel: React.FC<TagPanelProps> = ({ selectedTag, onTagSelect, onTagDelete }) => {
    const { groups, setGroupsConfig } = useNoteInfo();

    const { allTags, tagCounts, totalMemos } = useMemo(() => {
        const counts: Record<string, number> = {};
        let total = 0;
        groups.forEach(group => {
            (group.children || []).forEach(note => {
                total++;
                (note.tags || []).forEach(tag => {
                    counts[tag] = (counts[tag] || 0) + 1;
                });
            });
        });
        const sortedTags = Object.keys(counts).sort((a, b) =>
            a.toLowerCase().localeCompare(b.toLowerCase())
        );
        return { allTags: sortedTags, tagCounts: counts, totalMemos: total };
    }, [groups]);

    /** 删除标签：移除所有笔记上的该标签，持久化到磁盘 */
    const deleteTag = useCallback((tagName: string) => {
        Modal.confirm({
            title: '删除标签',
            content: `确定要删除标签"${tagName}"吗？所有备忘录中该标签将被移除，此操作不可恢复。`,
            okText: '确认删除',
            okButtonProps: { danger: true },
            cancelText: '取消',
            onOk: async () => {
                const newGroups = groups.map(group => ({
                    ...group,
                    children: (group.children || []).map(note => ({
                        ...note,
                        tags: (note.tags || []).filter(t => t !== tagName),
                    })),
                }));
                const newConfig = { groups: newGroups };
                const result = await window.electronAPI?.updateGroupsConfigAsync(newConfig);
                if (result?.success) {
                    setGroupsConfig(newConfig);
                    onTagDelete?.(tagName);
                } else {
                    message.error('删除标签失败');
                }
            },
        });
    }, [groups, setGroupsConfig, onTagDelete]);

    return (
        <div className="scrollable" style={{ flex: 1, padding: '8px 12px' }}>
            {/* "无" —— 展示全部 */}
            <div
                className={`tag-item${selectedTag === null ? ' tag-item--active' : ''}`}
                onClick={() => onTagSelect(null)}
            >
                <span>无</span>
                <span className="tag-item__count">{totalMemos}</span>
            </div>

            {allTags.map(tag => (
                <Dropdown
                    key={tag}
                    menu={{
                        items: [{ label: '删除标签', key: 'delete', danger: true }],
                        onClick: ({ key }) => {
                            if (key === 'delete') deleteTag(tag);
                        },
                    }}
                    trigger={['contextMenu']}
                >
                    <div
                        className={`tag-item${selectedTag === tag ? ' tag-item--active' : ''}`}
                        onClick={() => onTagSelect(tag)}
                    >
                        <span className="tag-item__name">{tag}</span>
                        <span className="tag-item__count">{tagCounts[tag]}</span>
                    </div>
                </Dropdown>
            ))}
        </div>
    );
};

export default TagPanel;
