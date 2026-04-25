/** Git 同步状态管理 Hook — 提供 status/message/lastSyncTime/pushNow，每5分钟自动同步 */
import { useState, useEffect, useCallback, useRef } from 'react';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface SyncStatusState {
  status: SyncStatus;
  message: string;
  lastSyncTime: number | null;
}

export function useSyncStatus() {
  const [state, setState] = useState<SyncStatusState>({
    status: 'idle',
    message: '',
    lastSyncTime: null,
  });
  /** 定时器引用，用于组件卸载时清理 */
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** 发起同步 — 将状态置为 syncing */
  const setSyncing = useCallback(() => {
    setState(prev => ({ ...prev, status: 'syncing', message: '同步中...' }));
  }, []);

  /** 同步成功 — 显示成功消息，3 秒后自动恢复 idle */
  const setSuccess = useCallback((msg?: string) => {
    setState({
      status: 'success',
      message: msg || '同步成功',
      lastSyncTime: Date.now(),
    });
    // 3 秒后恢复空闲状态
    setTimeout(() => {
      setState(prev => prev.status === 'success'
        ? { ...prev, status: 'idle', message: '' }
        : prev
      );
    }, 3000);
  }, []);

  /** 同步失败 — 显示错误消息，不自动恢复 */
  const setError = useCallback((msg: string) => {
    setState({
      status: 'error',
      message: msg || '同步失败',
      lastSyncTime: Date.now(),
    });
  }, []);

  /** 立即执行一次 Git 推送同步 */
  /** 立即执行一次 Git 推送同步 */
  const pushNow = useCallback(async () => {
    setSyncing();
    try {
      const result = await window.electronAPI?.pushToGitHubAsync();
      if (result?.success) {
        setSuccess(result?.data || '同步成功');
      } else {
        setError(result?.error || '同步失败');
      }
    } catch (err) {
      setError('同步出错');
    }
  }, [setSyncing, setSuccess, setError]);

  /** 挂载后每 5 分钟自动同步一次，卸载时清理定时器 */
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      pushNow();
    }, 5 * 60 * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pushNow]);

  return { ...state, pushNow };
}
