import React, {useState, memo} from "react";
import {Flex, type GetProps, Input, Select, Space} from "antd";

type SearchProps = GetProps<typeof Input.Search>;

const {Search} = Input;

const options = [
    {
        value: 'fileName',
        label: '文件名',
        placeholder: '搜索文件名',
    },
    {
        value: 'tags',
        label: '标签',
        placeholder: '搜索标签',
    },
];

const searchTypeMap = options.reduce((obj, item) => {
    obj[item.value] = item;
    return obj
}, {});

const NoteSearch: React.FC = () => {
    // 搜索类型
    const [searchType, setSearchType] = useState('fileName');

    // 根据类型搜索
    const onSearch: SearchProps['onSearch'] = async (value) => {
        if (!value) {
            return;
        }
    };

    return (
        <Flex className="right" justify="center" align="center" style={{padding: "0 20px"}}>
            <Space.Compact>
                <Select
                    style={{width: '100px'}}
                    options={options}
                    value={searchType}
                    onChange={(value) => setSearchType(value)}
                />
                <Search
                    style={{width: '400px'}}
                    placeholder={searchTypeMap[searchType].placeholder}
                    onSearch={onSearch}
                />
            </Space.Compact>
        </Flex>
    );
};

export default memo(NoteSearch);