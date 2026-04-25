/**
 * 笔记树组件
 *
 * 渲染侧边栏中的笔记分组树形菜单，支持：
 * - 右键菜单删除/重命名（分组和笔记）
 * - "新建笔记"按钮打开创建弹窗
 * - 点击笔记导航到编辑页
 * - 首次挂载自动展开所有分组
 */
import React, {memo, useState, useMemo, useEffect, useRef} from "react";
import {Menu, Dropdown, Modal, Input, message} from "antd";
import type {MenuProps} from 'antd';
import {useNavigate} from "react-router";
import useNoteInfo from "../../hooks/useNoteInfo";
import CreateNewModal from "./CreateNewModal";
import type {IGroupsItem, IGroupsItemMap, INoteItem} from "../../../types";

interface NoteGroupsProps {
    filteredGroups?: IGroupsItem[];
    searchTerm?: string;
}

const NoteGroups: React.FC<NoteGroupsProps> = ({ filteredGroups, searchTerm }) => {
    const navigate = useNavigate();
    const {
        groups: allGroups,
        groupsMap,
        setGroupsConfig,
    } = useNoteInfo()
    // 搜索过滤后的分组列表，优先使用父组件传入的 filteredGroups
    const groups = filteredGroups || allGroups;

    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [openKeys, setOpenKeys] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // 首次挂载时自动展开所有分组
    const expanded = useRef(false);
    useEffect(() => {
        if (!expanded.current && groups.length > 0) {
            setOpenKeys(groups.map(g => g.key));
            expanded.current = true;
        }
    }, [groups]);
    const [renameVisible, setRenameVisible] = useState(false);
    const [renameTarget, setRenameTarget] = useState<{ key: string; name: string; type: 'note' | 'group' } | null>(null);
    const [renameValue, setRenameValue] = useState('');

    /**
     * 构建 Ant Design Menu 所需的 items 树
     * 每个分组和笔记包裹在 Dropdown 中以支持右键菜单（删除/重命名）
     */
    const items = useMemo(() => {
        return groups.map((group) => {
            return {
                key: group.key,
                label: (
                    <Dropdown menu={{
                        items: [
                            {
                                label: '删除分组',
                                key: 'delete',
                            },
                            {
                                label: '重命名',
                                key: 'rename',
                            },
                        ],
                        onClick: async ({key}: { key: string }) => {
                            if (key === 'delete') {
                                await deleteGroup(group.key)
                            } else if (key === 'rename') {
                                setRenameTarget({ key: group.key, name: group.name, type: 'group' });
                                setRenameValue(group.name);
                                setRenameVisible(true);
                            }
                        }
                    }} trigger={['contextMenu']}>
                        <div>
                            {group.name}
                        </div>
                    </Dropdown>
                ),
                children: (group.children || []).map((child) => {
                    return {
                        key: child.key,
                        label: (
                            <Dropdown menu={{
                                items: [
                                    {
                                        label: '删除笔记',
                                        key: 'delete',
                                    },
                                    {
                                        label: '重命名',
                                        key: 'rename',
                                    },
                                ],
                                onClick: async ({key}: { key: string }) => {
                                    if (key === 'delete') {
                                        await deleteNoteInGroup(child.key)
                                    } else if (key === 'rename') {
                                        setRenameTarget({ key: child.key, name: child.name, type: 'note' });
                                        setRenameValue(child.name);
                                        setRenameVisible(true);
                                    }
                                }
                            }} trigger={['contextMenu']}>
                                <div>
                                    {child.name}
                                </div>
                            </Dropdown>
                        ),
                    }
                })
            }
        })
    }, [groups]);

    /** 选中菜单项 → 导航到对应笔记 */
    const onSelect: MenuProps['onSelect'] = (e) => {
        setSelectedKeys(e.selectedKeys)
        navigate(`/home/note/${e.key}`)
    };
    const onOpenChange: MenuProps['onOpenChange'] = (_openKeys) => {
        setOpenKeys(_openKeys)
    };

    /** 创建新分组：更新 groupsConfig 并创建磁盘目录 */
    const createNewGroup = async (data: IGroupsItem) => {
        const _groups = [...groups, data];
        const _groupsConfig = {
            groups: _groups,
        };
        setGroupsConfig(_groupsConfig)
        const [updateResult, createResult] = await Promise.all([
            window.electronAPI.updateGroupsConfigAsync(_groupsConfig),
            window.electronAPI.createNoteAsync({
                paths: [data.name],
                type: 'group',
            })
        ]);
        if (!updateResult?.success) console.error('创建分组失败:', updateResult?.error);
        if (!createResult?.success) console.error('创建分组目录失败:', createResult?.error);
    }

    /** 在已有分组下创建新笔记：插入 children 并创建磁盘文件 */
    const createNewNoteInGroup = async (data: INoteItem, groupKey: string) => {
        const targetGroup = {...(groupsMap[groupKey] || {})} as IGroupsItemMap;
        const newGroups = [...groups].map((item) => {
            if (item.key === groupKey) {
                if (!item.children) {
                    item.children = [];
                }
                item.children.push(data);
            }
            return item;
        })
        const _groupsConfig = {
            groups: newGroups,
        }
        setGroupsConfig(_groupsConfig)
        const [updateResult, createResult] = await Promise.all([
            window.electronAPI.updateGroupsConfigAsync(_groupsConfig),
            window.electronAPI.createNoteAsync({
                paths: [targetGroup.name, `${data.name}`],
                type: 'file',
                content: '',
            })
        ]);
        if (!updateResult?.success) console.error('创建笔记失败:', updateResult?.error);
        if (!createResult?.success) console.error('创建笔记文件失败:', createResult?.error);
        // 创建后自动导航到新笔记并展开所在分组
        navigate(`/home/note/${data.key}`)
        setSelectedKeys([data.key])
        setOpenKeys((pre) => {
            return Array.from(new Set([...pre, targetGroup.key]))
        })
    }

    /** 删除分组（含确认弹窗），物理删除目录 + 更新 groups.json */
    const deleteGroup = async (groupKey: string) => {
        Modal.confirm({
            title: '提示',
            content: '确认删除？',
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                const result = await window.electronAPI.deleteGroupAsync(groupKey);
                if (result?.success && result.data) {
                    setGroupsConfig(result.data);
                } else {
                    message.error(result?.error || '删除失败');
                }
            },
        })
    }

    /** 删除分组内的单个笔记（含确认弹窗） */
    const deleteNoteInGroup = async (noteKey: string) => {
        Modal.confirm({
            title: '提示',
            content: '确认删除？',
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                const result = await window.electronAPI.deleteNoteInGroupAsync(noteKey);
                if (result?.success && result.data) {
                    setGroupsConfig(result.data);
                } else {
                    message.error(result?.error || '删除失败');
                }
            },
        })
    }

    /** 重命名确认：根据 target.type 调用 renameNoteAsync 或 renameGroupAsync */
    const handleRenameOk = async () => {
        if (!renameTarget || !renameValue.trim()) return;
        const result = renameTarget.type === 'note'
            ? await window.electronAPI.renameNoteAsync(renameTarget.key, renameValue.trim())
            : await window.electronAPI.renameGroupAsync(renameTarget.key, renameValue.trim());
        if (result?.success && result.data) {
            setGroupsConfig(result.data);
        } else {
            message.error(result?.error || '重命名失败');
        }
        setRenameVisible(false);
        setRenameTarget(null);
    }

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* 新建笔记按钮 */}
            <div style={{ padding: '0 12px 8px' }}>
                <button
                    className="new-note-btn"
                    onClick={() => setIsModalOpen(true)}
                >
                    + 新建笔记
                </button>
            </div>
            {/* 笔记树菜单 */}
            <div className="scrollable" style={{ flex: 1 }}>
                <Menu
                    style={{ border: 'none', background: 'transparent' }}
                    onSelect={onSelect}
                    onOpenChange={onOpenChange}
                    selectedKeys={selectedKeys}
                    openKeys={openKeys}
                    mode="inline"
                    inlineIndent={16}
                    items={items}
                />
            </div>
            {/* 新建笔记/分组弹窗 */}
            <CreateNewModal
                visible={isModalOpen}
                visibleChange={setIsModalOpen}
                createNewGroup={createNewGroup}
                createNewNoteInGroup={createNewNoteInGroup}
            />
            {/* 重命名弹窗 */}
            <Modal
                title="重命名"
                open={renameVisible}
                okText="确认"
                cancelText="取消"
                onOk={handleRenameOk}
                onCancel={() => {
                    setRenameVisible(false);
                    setRenameTarget(null);
                }}
            >
                <Input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onPressEnter={handleRenameOk}
                />
            </Modal>
        </div>
    );
};

export default memo(NoteGroups);
