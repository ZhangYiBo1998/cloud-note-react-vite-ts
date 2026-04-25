import React, {memo} from "react";
import {Input} from "antd";
import {SearchOutlined} from "@ant-design/icons";

interface NoteSearchProps {
    searchType: string;
    onSearchTypeChange: (type: string) => void;
    onSearch: (value: string, type: string) => void;
}

const NoteSearch: React.FC<NoteSearchProps> = ({ searchType, onSearch, onSearchTypeChange }) => {
    return (
        <Input
            size="small"
            placeholder={searchType === 'tags' ? '搜索标签...' : '搜索文件名...'}
            prefix={<SearchOutlined style={{ color: '#8e8e93' }} />}
            onChange={(e) => onSearch(e.target.value, searchType)}
            style={{ borderRadius: 6 }}
            addonBefore={
                <select
                    value={searchType}
                    onChange={(e) => onSearchTypeChange(e.target.value)}
                    style={{
                        border: 'none',
                        background: 'transparent',
                        fontSize: 12,
                        color: '#8e8e93',
                        cursor: 'pointer',
                        outline: 'none',
                        padding: 0,
                    }}
                >
                    <option value="fileName">文件名</option>
                    <option value="tags">标签</option>
                </select>
            }
        />
    );
};

export default memo(NoteSearch);