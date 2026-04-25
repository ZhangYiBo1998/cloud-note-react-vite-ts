/**
 * 自动备份模块
 *
 * 定期将 saveDirectory 完整复制到 backupDirectory/<timestamp>/ 目录。
 * 调度器通过 setInterval 实现，状态由模块级变量管理。
 */
import fs from 'fs/promises';
import path from 'path';
import { getAppSaveDirectoryAsync, getConfigJsonAsync } from '../utils/tools';

/** 备份状态 */
export interface BackupState {
  lastBackupTime: number | null;
  nextBackupTime: number | null;
  backupInProgress: boolean;
  backupCount: number;
}

/** 模块级备份状态 */
const backupState: BackupState = {
  lastBackupTime: null,
  nextBackupTime: null,
  backupInProgress: false,
  backupCount: 0,
};

/** 调度器定时器引用 */
let backupTimer: ReturnType<typeof setInterval> | null = null;

/**
 * 递归复制目录
 * 使用 fs.cp 进行递归复制，忽略权限错误
 */
async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.cp(src, dest, { recursive: true, force: true });
}

/**
 * 执行一次完整备份
 * 将 saveDirectory 复制到 <backupDirectory>/backup-<YYYYMMDD-HHmmss>/
 * 无备份目录或正在进行中时抛出错误，由调用方处理
 */
export async function performBackupAsync(): Promise<void> {
  if (backupState.backupInProgress) {
    throw new Error('备份正在进行中，请稍后再试');
  }

  const config = await getConfigJsonAsync();
  const backupDir = config.backupDirectory;
  if (!backupDir) {
    throw new Error('未配置备份目录，请先在设置中指定备份存放位置');
  }

  backupState.backupInProgress = true;
  try {
    const saveDir = await getAppSaveDirectoryAsync();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const destDir = path.join(backupDir, `backup-${timestamp}`);

    await fs.mkdir(destDir, { recursive: true });
    await copyDirectory(saveDir, destDir);

    backupState.lastBackupTime = Date.now();
    backupState.backupCount++;

    // 清理旧备份，最多保留 10 份
    await cleanupOldBackups(backupDir, 10);
  } catch (err) {
    console.error('备份失败:', err);
    throw err;
  } finally {
    backupState.backupInProgress = false;
  }
}

/** 清理旧备份，按修改时间排序，保留最新的 maxCount 份 */
async function cleanupOldBackups(backupDir: string, maxCount: number): Promise<void> {
  try {
    const entries = await fs.readdir(backupDir, { withFileTypes: true });
    const backupDirs = entries
      .filter(e => e.isDirectory() && e.name.startsWith('backup-'))
      .map(e => e.name);

    if (backupDirs.length <= maxCount) return;

    // 按文件夹名（含时间戳）降序排列，删除多余的旧备份
    backupDirs.sort().reverse();
    const toDelete = backupDirs.slice(maxCount);
    for (const dir of toDelete) {
      await fs.rm(path.join(backupDir, dir), { recursive: true, force: true });
    }
  } catch {
    // 清理失败不影响备份流程
  }
}

/** 获取当前备份状态 */
export function getBackupStatus(): BackupState {
  return { ...backupState };
}

/** 启动定时备份调度器 */
export function startBackupScheduler(intervalMinutes: number): void {
  stopBackupScheduler();
  if (intervalMinutes <= 0) return;

  backupState.nextBackupTime = Date.now() + intervalMinutes * 60 * 1000;
  backupTimer = setInterval(async () => {
    await performBackupAsync();
    backupState.nextBackupTime = Date.now() + intervalMinutes * 60 * 1000;
  }, intervalMinutes * 60 * 1000);
}

/** 停止定时备份调度器 */
export function stopBackupScheduler(): void {
  if (backupTimer) {
    clearInterval(backupTimer);
    backupTimer = null;
  }
  backupState.nextBackupTime = null;
}

/** 根据当前配置重启调度器（配置变更后调用） */
export async function restartSchedulerFromConfig(): Promise<void> {
  const config = await getConfigJsonAsync();
  const interval = config.backupIntervalMinutes || 0;
  if (interval > 0 && config.backupDirectory) {
    startBackupScheduler(interval);
  } else {
    stopBackupScheduler();
  }
}
