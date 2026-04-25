/**
 * 自动备份 IPC Handler
 *
 * 暴露 performBackupAsync 和 getBackupStatus 给渲染进程。
 * 备份目录和间隔从 config.json 读取，调度器由 main.ts 管理。
 */
import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import { successResult, errorResult } from '../shared/ipc-result';
import { performBackupAsync, getBackupStatus } from '../backup/backup';

export function registerBackupHandlers(): void {
  /** 手动触发一次完整备份 */
  ipcMain.handle(IPC_CHANNELS.PERFORM_BACKUP, async () => {
    try {
      await performBackupAsync();
      return successResult(undefined);
    } catch (err) {
      console.error('备份失败:', err);
      return errorResult('备份失败');
    }
  });

  /** 获取当前备份状态（上次备份时间、下次备份时间、进行中、备份数） */
  ipcMain.handle(IPC_CHANNELS.GET_BACKUP_STATUS, async () => {
    return successResult(getBackupStatus());
  });
}
