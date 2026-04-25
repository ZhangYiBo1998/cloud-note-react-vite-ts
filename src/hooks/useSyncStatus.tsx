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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setSyncing = useCallback(() => {
    setState(prev => ({ ...prev, status: 'syncing', message: '同步中...' }));
  }, []);

  const setSuccess = useCallback((msg?: string) => {
    setState({
      status: 'success',
      message: msg || '同步成功',
      lastSyncTime: Date.now(),
    });
    // Reset to idle after 3s
    setTimeout(() => {
      setState(prev => prev.status === 'success'
        ? { ...prev, status: 'idle', message: '' }
        : prev
      );
    }, 3000);
  }, []);

  const setError = useCallback((msg: string) => {
    setState({
      status: 'error',
      message: msg || '同步失败',
      lastSyncTime: Date.now(),
    });
  }, []);

  const pushNow = useCallback(async () => {
    setSyncing();
    try {
      const result = await window.electronAPI?.pushToGitHubAsync();
      if (result?.success) {
        setSuccess('同步成功');
      } else {
        setError(result?.error || '同步失败');
      }
    } catch (err) {
      setError('同步出错');
    }
  }, [setSyncing, setSuccess, setError]);

  // Auto-sync every 5 minutes
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
