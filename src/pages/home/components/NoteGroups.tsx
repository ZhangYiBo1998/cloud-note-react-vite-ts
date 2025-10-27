import React, {memo, useState, useMemo} from "react";
import {Menu} from "antd";
import type {MenuProps} from 'antd';
import {useNavigate} from "react-router";
import useNoteInfo from "../../hooks/useNoteInfo";

const NoteGroups: React.FC = () => {
    const navigate = useNavigate();
    const {
        groups,
    } = useNoteInfo()

    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [openKeys, setOpenKeys] = useState<string[]>([]);

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
        <div className="scrollable">
            <Menu
                onSelect={onSelect}
                onOpenChange={onOpenChange}
                selectedKeys={selectedKeys}
                openKeys={openKeys}
                mode="inline"
                items={items}
            />
        </div>
    );
};

export default memo(NoteGroups);