/** 同步状态栏组件 — 显示在侧边栏底部，展示 Git 同步状态和重试入口 */
import React, { memo } from 'react';
import { Flex } from 'antd';
import {
  CloudSyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import type { SyncStatus } from '../../hooks/useSyncStatus';

interface SyncStatusBarProps {
  status: SyncStatus;
  message: string;
  onSyncNow: () => void;
}

const SyncStatusBar: React.FC<SyncStatusBarProps> = ({ status, message, onSyncNow }) => {
  // idle 且无消息时不显示
  if (status === 'idle' && !message) return null;

  /** 根据同步状态返回对应的图标元素 */
  const icon = () => {
    switch (status) {
      case 'syncing':
        return <LoadingOutlined style={{ color: '#0071e3', fontSize: 12 }} />;
      case 'success':
        return <CheckCircleOutlined style={{ color: '#30d158', fontSize: 12 }} />;
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff453a', fontSize: 12 }} />;
      default:
        return <CloudSyncOutlined style={{ color: '#8e8e93', fontSize: 12 }} />;
    }
  };

  return (
    <Flex
      align="center"
      justify="center"
      gap={6}
      style={{
        height: 28,
        fontSize: 11,
        color: 'var(--text-secondary, #6e6e73)',
        borderTop: '1px solid var(--border-color, #e8e8ed)',
        background: 'var(--sidebar-bg, #fafafa)',
        cursor: 'default',
        padding: '0 12px',
      }}
    >
      {icon()}
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {status === 'error' ? '同步失败' : message}
      </span>
      <span
        style={{ cursor: 'pointer', opacity: 0.7, fontSize: 12, flexShrink: 0 }}
        onClick={onSyncNow}
        title="手动同步"
      >
        {status === 'syncing' ? '同步中...' : (status === 'error' ? '重试' : '同步')}
      </span>
    </Flex>
  );
};

export default memo(SyncStatusBar);
