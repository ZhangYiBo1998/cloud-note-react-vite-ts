import React, { memo } from "react";
import { Dropdown } from "antd";
import type { IMemoItem } from "../../../types";

interface MemoCardProps {
    memo: IMemoItem;
    onClick: () => void;
    onDelete?: () => void;
}

/** 格式化时间戳为 yyyy-MM-dd HH:mm */
function formatTime(ts: number): string {
    const d = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const MemoCard: React.FC<MemoCardProps> = ({ memo, onClick, onDelete }) => {
    const card = (
        <div className="memo-card" onClick={onClick}>
            <div className="memo-card__header">
                <span className="memo-card__title">{memo.name}</span>
                <span className="memo-card__time">{formatTime(memo.createTime)}</span>
            </div>
            <div className="memo-card__group">{memo.parentName}</div>
            <div className="memo-card__tags">
                {(memo.tags || []).map(tag => (
                    <span key={tag} className="memo-card__tag">{tag}</span>
                ))}
            </div>
        </div>
    );

    if (!onDelete) return card;

    return (
        <Dropdown
            menu={{
                items: [{ label: '删除笔记', key: 'delete' }],
                onClick: ({ key }) => {
                    if (key === 'delete') onDelete();
                },
            }}
            trigger={['contextMenu']}
        >
            {card}
        </Dropdown>
    );
};

export default memo(MemoCard);
