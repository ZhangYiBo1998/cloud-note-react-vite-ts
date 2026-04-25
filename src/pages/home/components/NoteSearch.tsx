import React, {memo} from "react";
import {Input, Select, Space} from "antd";
import {SearchOutlined} from "@ant-design/icons";

interface NoteSearchProps {
    searchType: string;
    onSearchTypeChange: (type: string) => void;
    onSearch: (value: string, type: string) => void;
}

const NoteSearch: React.FC<NoteSearchProps> = ({ searchType, onSearch, onSearchTypeChange }) => {
    return (
        <Space.Compact style={{ width: '100%' }}>
            <Select
                size="small"
                value={searchType}
                onChange={(value) => onSearchTypeChange(value)}
                style={{ width: 80 }}
                options={[
                    { label: '文件名', value: 'fileName' },
                    { label: '标签', value: 'tags' },
                ]}
            />
            <Input
                size="small"
                placeholder={searchType === 'tags' ? '搜索标签...' : '搜索文件名...'}
                prefix={<SearchOutlined style={{ color: 'var(--text-secondary)' }} />}
                onChange={(e) => onSearch(e.target.value, searchType)}
            />
        </Space.Compact>
    );
};

export default memo(NoteSearch);