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
  if (status === 'idle' && !message) return null;

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
      <span>{message}</span>
      {status === 'error' && (
        <span
          style={{ cursor: 'pointer', textDecoration: 'underline', marginLeft: 8 }}
          onClick={onSyncNow}
        >
          重试
        </span>
      )}
    </Flex>
  );
};

export default memo(SyncStatusBar);
