import React, {memo, useState, useMemo} from "react";
import {Menu, Button} from "antd";
import type {MenuProps} from 'antd';
import {useNavigate} from "react-router";
import useNoteInfo from "../../hooks/useNoteInfo";
import CreateNewModal from "./CreateNewModal";
import type {IGroupsItem, INoteItem} from "../../../types";

const NoteGroups: React.FC = () => {
    const navigate = useNavigate();
    const {
        groups,
        groupsMap,
        setGroupsConfig,
    } = useNoteInfo()

    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [openKeys, setOpenKeys] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const items = useMemo(() => {
        return groups.map((group) => {
            return {
                key: group.key,
                label: group.name,
                children: (group.children || []).map((child) => {
                    return {
                        key: child.key,
                        label: child.name,
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
        const targetGroup = {...(groupsMap[groupKey] || {})} as IGroupsItem;
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

    // const deleteGroup = (groupKey: string) => {
    //     const newGroups = groups.filter((item) => item.key !== groupKey);
    //     setGroupsConfig({
    //         groups: newGroups,
    //     })
    // }
    //
    // const deleteNoteInGroup = (noteKey: string) => {
    //     const targetNote = {...(groupsMap[noteKey] || {})};
    //     const targetGroup: IGroupsItem = {...(groupsMap[targetNote.parent] || {})};
    //     if (!targetGroup.children) {
    //         targetGroup.children = [];
    //     }
    //     targetGroup.children = targetGroup.children.filter((item) => item.key !== noteKey);
    //     const newGroups = [...groups];
    //     const index = newGroups.findIndex((item) => item.key === targetGroup.key);
    //     newGroups[index] = targetGroup;
    //     setGroupsConfig({
    //         groups: newGroups,
    //     })
    // }

    return (
        <div className="scrollable" style={{background: '#FAFAFA', height: '100%'}}>
            <Button
                style={{
                    width: '100%',
                    margin: '10px 0',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                }}
                color="primary"
                variant="outlined"
                onClick={() => {
                    setIsModalOpen(true);
                }}
            >
                新建
            </Button>
            <Menu
                style={{border: '1px solid #e8e8e8', borderBottom: 'none'}}
                onSelect={onSelect}
                onOpenChange={onOpenChange}
                selectedKeys={selectedKeys}
                openKeys={openKeys}
                mode="inline"
                items={items}
            />
            <CreateNewModal
                visible={isModalOpen}
                visibleChange={setIsModalOpen}
                createNewGroup={createNewGroup}
                createNewNoteInGroup={createNewNoteInGroup}
            />
        </div>
    );
};

export default memo(NoteGroups);