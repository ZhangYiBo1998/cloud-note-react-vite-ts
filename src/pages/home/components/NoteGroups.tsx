import React, {useEffect, useState, useRef, memo} from "react";
import {Menu} from "antd";
import type {MenuProps} from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

const NoteGroups: React.FC = () => {

    const items: MenuItem[] = [
        {
            key: 'sub1',
            label: 'Navigation One',
            children: [
                {
                    key: 'g1',
                    label: 'Item 1',
                },
                {
                    key: 'g2',
                    label: 'Item 2',
                },
            ],
        },
        {
            key: 'sub2',
            label: 'Navigation Two',
            children: [
                {key: '5', label: 'Option 5'},
                {key: '6', label: 'Option 6'},
            ],
        },
        {
            key: 'sub4',
            label: 'Navigation Three',
            children: [
                {key: '9', label: 'Option 9'},
                {key: '10', label: 'Option 10'},
                {key: '11', label: 'Option 11'},
                {key: '12', label: 'Option 12'},
                {key: '13', label: 'Option 9'},
                {key: '14', label: 'Option 10'},
                {key: '15', label: 'Option 11'},
                {key: '16', label: 'Option 12'},
            ],
        },
    ];

    const onClick: MenuProps['onClick'] = (e) => {
        console.log('click ', e);
    };

    return (
        <div className="scrollable">
            <Menu
                onClick={onClick}
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1']}
                mode="inline"
                items={items}
            />
        </div>
    );
};

export default memo(NoteGroups);