import React, {memo, useState} from "react";
import {useNavigate, Outlet} from "react-router";
import {Flex, Input, Select, Space} from "antd";
import type {GetProps} from 'antd';
import "./index.scss"

const {Search} = Input;

type SearchProps = GetProps<typeof Input.Search>;

const Home: React.FC = () => {
    const navigate = useNavigate();

    // 搜索类型
    const [searchType, setSearchType] = useState('title');

    // 根据类型搜索
    const onSearch: SearchProps['onSearch'] = async (value) => {
        if (!value) {
            return;
        }
        const result = await window.electronAPI.findFiles(value, searchType)
        console.log('搜索结果', result);
    };

    const options = [
        {
            value: 'title',
            label: '标题',
        },
        {
            value: 'tags',
            label: '标签',
        },
    ];

    return (
        <Flex id="cloudNoteHome" vertical>
            <Flex className="header">
                <Flex className="left flex-shrink-0" justify="center" align="center">
                    <Flex className="logo" justify="center" align="center" onClick={() => navigate("/")}>
                        <img src="src/assets/icon.png" alt=""/>
                    </Flex>
                    <Flex className="title">Cloud Note</Flex>
                </Flex>
                <Flex className="right" justify="center" align="center" style={{padding: "0 20px"}}>
                    <Space.Compact>
                        <Select style={{width: '100px'}} options={options} value={searchType}
                                onChange={(value) => setSearchType(value)}/>
                        <Search style={{width: '400px'}} placeholder={`根据${searchType}搜索`} onSearch={onSearch}/>
                    </Space.Compact>
                </Flex>
            </Flex>
            <Flex className="container height-100">
                <Flex className="sidebar">侧边栏</Flex>
                <Flex className="content">
                    编辑区域
                    <Outlet/>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default memo(Home);