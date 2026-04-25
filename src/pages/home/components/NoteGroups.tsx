import React, {memo, useState, useMemo, useEffect, useRef} from "react";
import {Menu, Dropdown, Modal, Input} from "antd";
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

    const onSelect: MenuProps['onSelect'] = (e) => {
        setSelectedKeys(e.selectedKeys)
        navigate(`/home/note/${e.key}`)
    };
    const onOpenChange: MenuProps['onOpenChange'] = (_openKeys) => {
        setOpenKeys(_openKeys)
    };

    // 创建新分组
    const createNewGroup = async (data: IGroupsItem) => {
        const _groups = [...groups, data];
        const _groupsConfig = {
            groups: _groups,
        };
        setGroupsConfig(_groupsConfig)
        await Promise.all([
            // 重新生成groups.json文件
            window.electronAPI.updateGroupsConfigAsync(_groupsConfig),
            // 创建笔记文件
            window.electronAPI.createNoteAsync({
                paths: [data.name],
                type: 'group',
            })
        ])
    }

    // 在已有分组下创建新笔记
    const createNewNoteInGroup = async (data: INoteItem, groupKey: string) => {
        const targetGroup = {...(groupsMap[groupKey] || {})} as IGroupsItemMap;
        const newGroups = [...groups].map((item) => {
            if (item.key === groupKey) {
                // 往对应的分组位置插入新的笔记
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
        await Promise.all([
            // 重新生成groups.json文件
            window.electronAPI.updateGroupsConfigAsync(_groupsConfig),
            // 创建笔记文件
            window.electronAPI.createNoteAsync({
                paths: [targetGroup.name, `${data.name}`],
                type: 'file',
                content: '',
            })
        ])
        navigate(`/home/note/${data.key}`)
        setSelectedKeys([data.key])
        setOpenKeys((pre) => {
            return Array.from(new Set([...pre, targetGroup.key]))
        })
    }

    const deleteGroup = async (groupKey: string) => {
        Modal.confirm({
            title: '提示',
            content: '确认删除？',
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                const newGroupsConfig = await window.electronAPI.deleteGroupAsync(groupKey);
                setGroupsConfig(newGroupsConfig)
            },
        })
    }

    const deleteNoteInGroup = async (noteKey: string) => {
        Modal.confirm({
            title: '提示',
            content: '确认删除？',
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                const newGroupsConfig = await window.electronAPI.deleteNoteInGroupAsync(noteKey)
                setGroupsConfig(newGroupsConfig)
            },
        })
    }

    const handleRenameOk = async () => {
        if (!renameTarget || !renameValue.trim()) return;
        try {
            const newGroupsConfig = renameTarget.type === 'note'
                ? await window.electronAPI.renameNoteAsync(renameTarget.key, renameValue.trim())
                : await window.electronAPI.renameGroupAsync(renameTarget.key, renameValue.trim());
            setGroupsConfig(newGroupsConfig);
        } catch (err) {
            console.error('重命名失败:', err);
        }
        setRenameVisible(false);
        setRenameTarget(null);
    }

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ padding: '0 12px 8px' }}>
                <button
                    className="new-note-btn"
                    onClick={() => setIsModalOpen(true)}
                >
                    + 新建笔记
                </button>
            </div>
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
            <CreateNewModal
                visible={isModalOpen}
                visibleChange={setIsModalOpen}
                createNewGroup={createNewGroup}
                createNewNoteInGroup={createNewNoteInGroup}
            />
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