/**
 * 主页布局组件
 *
 * 左侧 240px 侧边栏（搜索 + 笔记树/搜索结果 + 同步状态栏）+ 右侧内容区。
 * - 文件名/标签搜索：客户端侧过滤
 * - 内容搜索：通过 IPC searchNotesAsync 全文搜索，300ms 防抖
 */
import React, {useState, useMemo, useEffect, memo, useCallback, useRef, useContext} from "react";
import {Flex, List, Typography} from "antd";
import {FileTextOutlined} from "@ant-design/icons";
import {Outlet, useNavigate} from "react-router";
import NoteSearch from "./components/NoteSearch";
import NoteGroups from "./components/NoteGroups";
import SyncStatusBar from "../../components/SyncStatusBar";
import {useSyncStatus} from "../../hooks/useSyncStatus";
import {SidebarContext} from "../../utils/context";
import "./index.scss"
import useNoteInfo from "../hooks/useNoteInfo";
import type {SearchResultItem} from "../../types/global";

const Home: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('fileName');
    const { groups } = useNoteInfo();
    const sync = useSyncStatus();
    const navigate = useNavigate();
    const { width, collapsed, isResizing, onDragStart } = useContext(SidebarContext);

    /** 内容搜索结果 */
    const [contentResults, setContentResults] = useState<SearchResultItem[]>([]);
    /** 内容搜索进行中标志 */
    const [isSearching, setIsSearching] = useState(false);
    /** 防抖定时器引用 */
    const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

    /**
     * 客户端侧搜索过滤
     * - fileName：对 note.name 做大小写不敏感子串匹配
     * - tags：对 note.tags 数组做子串匹配
     * - content：走 IPC 全文搜索（不经过此 useMemo）
     */
    const filteredGroups = useMemo(() => {
        if (!searchTerm || searchType === 'content') return groups;
        return groups.map(group => {
            const matchedChildren = (group.children || []).filter(child => {
                if (searchType === 'fileName') {
                    return child.name.toLowerCase().includes(searchTerm.toLowerCase());
                }
                if (searchType === 'tags') {
                    return (child.tags || []).some(tag =>
                        tag.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                return true;
            });
            return { ...group, children: matchedChildren };
        }).filter(group => group.children.length > 0 || group.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [groups, searchTerm, searchType]);

    /** 内容搜索：300ms 防抖后调用 IPC 全文搜索 */
    useEffect(() => {
        if (searchType !== 'content' || !searchTerm.trim()) {
            setContentResults([]);
            return;
        }

        setIsSearching(true);
        clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(async () => {
            const result = await window.electronAPI?.searchNotesAsync(searchTerm.trim());
            if (result?.success) {
                setContentResults(result.data || []);
            } else {
                setContentResults([]);
            }
            setIsSearching(false);
        }, 300);

        return () => clearTimeout(searchTimerRef.current);
    }, [searchTerm, searchType]);

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    return (
        <Flex style={{ height: 'calc(100vh - 36px)', flex: 1 }}>
            {/* 左侧边栏：搜索 + 笔记树/搜索结果 + 同步状态 */}
            <Flex
                className={`sidebar${collapsed ? ' collapsed' : ''}`}
                vertical
                style={{
                    width: collapsed ? 0 : width,
                    minWidth: collapsed ? 0 : width,
                    borderRight: collapsed ? 'none' : '1px solid var(--border-color, #e8e8ed)',
                    background: 'var(--sidebar-bg, #fafafa)',
                    overflow: collapsed ? 'hidden' : 'visible',
                    transition: isResizing ? 'none' : 'width 0.2s ease',
                }}
            >
                <Flex style={{ padding: '12px 12px 12px', borderBottom: '1px solid var(--border-color)' }} vertical>
                    <NoteSearch
                        searchType={searchType}
                        value={searchTerm}
                        onSearchTypeChange={setSearchType}
                        onSearch={handleSearch}
                    />
                </Flex>

                {/* 内容搜索模式下展示搜索结果列表，否则展示笔记树 */}
                {searchType === 'content' && searchTerm ? (
                    <div className="scrollable" style={{ flex: 1, padding: '0 8px' }}>
                        {isSearching ? (
                            <Typography.Text type="secondary" style={{ padding: 12, display: 'block', fontSize: 13 }}>
                                搜索中...
                            </Typography.Text>
                        ) : contentResults.length === 0 ? (
                            <Typography.Text type="secondary" style={{ padding: 12, display: 'block', fontSize: 13 }}>
                                无匹配结果
                            </Typography.Text>
                        ) : (
                            <List
                                size="small"
                                dataSource={contentResults}
                                renderItem={(item) => (
                                    <List.Item
                                        style={{
                                            cursor: 'pointer',
                                            padding: '8px 10px',
                                            borderRadius: 6,
                                            border: 'none',
                                        }}
                                        onClick={() => navigate(`/home/note/${item.noteKey}`)}
                                    >
                                        <Flex vertical gap={2} style={{ width: '100%' }}>
                                            <Flex align="center" gap={6}>
                                                <FileTextOutlined style={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                                                <Typography.Text
                                                    style={{ fontSize: 13, fontWeight: 500 }}
                                                    ellipsis
                                                >
                                                    {item.fileName}
                                                </Typography.Text>
                                            </Flex>
                                            <Typography.Text
                                                type="secondary"
                                                style={{ fontSize: 11, paddingLeft: 18 }}
                                            >
                                                {item.groupName}
                                            </Typography.Text>
                                            <Typography.Text
                                                type="secondary"
                                                style={{
                                                    fontSize: 11,
                                                    paddingLeft: 18,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {item.snippet}
                                            </Typography.Text>
                                        </Flex>
                                    </List.Item>
                                )}
                            />
                        )}
                    </div>
                ) : (
                    <NoteGroups
                        filteredGroups={filteredGroups}
                        searchTerm={searchTerm}
                        onSyncNow={sync.pushNow}
                        syncStatus={sync.status}
                    />
                )}

                <SyncStatusBar
                    status={sync.status}
                    message={sync.message}
                    onSyncNow={sync.pushNow}
                />
            </Flex>
            {/* 拖拽手柄：侧边栏与内容区之间，可拖拽调整侧边栏宽度 */}
            {!collapsed && (
                <div
                    className="resize-handle"
                    onMouseDown={onDragStart}
                    style={{
                        cursor: 'col-resize',
                        width: 4,
                        minWidth: 4,
                        height: '100%',
                        background: isResizing ? 'var(--color-primary, #0071e3)' : 'transparent',
                        transition: isResizing ? 'none' : 'background 0.2s',
                        userSelect: 'none',
                        zIndex: 10,
                    }}
                />
            )}
            {/* 右侧内容区：笔记编辑器路由出口 */}
            <Flex
                className="content scrollable"
                vertical
                style={{
                    flex: 1,
                    background: 'var(--content-bg, #ffffff)',
                }}
            >
                <Outlet/>
            </Flex>
        </Flex>
    );
};

export default memo(Home);
