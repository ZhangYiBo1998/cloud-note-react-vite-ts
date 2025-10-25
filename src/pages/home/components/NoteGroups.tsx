import React, {memo, useContext, useState} from "react";
import {Menu} from "antd";
import type {MenuProps} from 'antd';
import {useNavigate} from "react-router";
import {
    ConfigContext,
} from "../../../utils/context";

type MenuItem = Required<MenuProps>['items'][number];

const NoteGroups: React.FC = () => {
    const navigate = useNavigate();
    const config = useContext(ConfigContext);

    const items: MenuItem[] = config.groups || [];
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [openKeys, setOpenKeys] = useState([]);

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