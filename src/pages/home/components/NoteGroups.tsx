import React, {memo, useState, useMemo, useEffect} from "react";
import {Menu, Button} from "antd";
import type {MenuProps} from 'antd';
import {useNavigate} from "react-router";
import useNoteInfo from "../../hooks/useNoteInfo";
import CreateNewModal from "./CreateNewModal";
import eventBus from "../../../utils/EventBus";


const NoteGroups: React.FC = () => {
    const navigate = useNavigate();
    const {
        groups,
        groupsMap,
    } = useNoteInfo()


    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [openKeys, setOpenKeys] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const id = eventBus.subscribe('open-group-by-key', (groupKey: string, noteKey) => {
            const group = groupsMap[groupKey];
            setSelectedKeys([noteKey])
            setOpenKeys((pre) => {
                return Array.from(new Set([...pre, group.key]))
            })
        })
        return () => {
            eventBus.unsubscribe(id);
        }
    }, [groupsMap]);

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
            />
        </div>
    );
};

export default memo(NoteGroups);