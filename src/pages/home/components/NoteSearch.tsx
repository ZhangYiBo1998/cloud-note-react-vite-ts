/**
 * 笔记搜索组件
 *
 * 左侧下拉选择搜索类型（文件名/标签/内容），右侧输入框实时搜索。
 * 搜索逻辑在父组件 Home 中实现：fileName/tags 为客户端过滤，content 为 IPC 全文搜索。
 */
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
            {/* 搜索类型下拉 */}
            <Select
                size="small"
                value={searchType}
                onChange={(value) => onSearchTypeChange(value)}
                style={{ width: 80 }}
                options={[
                    { label: '文件名', value: 'fileName' },
                    { label: '标签', value: 'tags' },
                    { label: '内容', value: 'content' },
                ]}
            />
            {/* 搜索输入框 */}
            <Input
                size="small"
                placeholder={searchType === 'tags' ? '搜索标签...' : searchType === 'content' ? '搜索内容...' : '搜索文件名...'}
                prefix={<SearchOutlined style={{ color: 'var(--text-secondary)' }} />}
                onChange={(e) => onSearch(e.target.value, searchType)}
            />
        </Space.Compact>
    );
};

export default memo(NoteSearch);
