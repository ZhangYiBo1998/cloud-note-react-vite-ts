import React, { useState,  memo} from "react";
import {Flex, type GetProps, Input, Select, Space} from "antd";

type SearchProps = GetProps<typeof Input.Search>;

const {Search} = Input;

const NoteSearch: React.FC = () => {

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
        <Flex className="right" justify="center" align="center" style={{padding: "0 20px"}}>
            <Space.Compact>
                <Select style={{width: '100px'}} options={options} value={searchType}
                        onChange={(value) => setSearchType(value)}/>
                <Search style={{width: '400px'}} placeholder={`根据${searchType}搜索`} onSearch={onSearch}/>
            </Space.Compact>
        </Flex>
    );
};

export default memo(NoteSearch);