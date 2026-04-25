/**
 * 应用配置 IPC Handler
 *
 * 处理 config.json 的读写、开机自启设置、保存目录选择。
 * config.json 路径：<userDocuments>/cloudNote/config.json
 *
 * 所有 invoke handler 统一返回 IpcResult { success, data, error }，不再 throw。
 */
import { app, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import { successResult, errorResult } from '../shared/ipc-result';
import type { AppConfig } from '../utils/tools';
import {
  getConfigJsonAsync,
  getGroupsConfigAsync,
} from '../utils/tools';
import { restartSchedulerFromConfig } from '../backup/backup';

export function registerConfigHandlers(): void {
  /** 设置/取消开机自启（fire-and-forget，无返回值） */
  ipcMain.handle(IPC_CHANNELS.SET_AUTO_LAUNCH, async (_event, enabled: boolean) => {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      path: app.getPath('exe'),
      args: enabled ? ['--hidden'] : [],
    });
  });

  /** 获取当前开机自启状态 */
  ipcMain.handle(IPC_CHANNELS.GET_AUTO_LAUNCH, async () => {
    try {
      const settings = app.getLoginItemSettings({ args: ['--hidden'] });
      return successResult(settings.openAtLogin);
    } catch (err) {
      return errorResult('获取开机自启状态失败');
    }
  });

  /** 读取 config.json 配置（支持 force 强制重新读取磁盘） */
  ipcMain.handle(IPC_CHANNELS.GET_CONFIG, async (_event, force?: boolean) => {
    try {
      const config = await getConfigJsonAsync(force);
      return successResult(config);
    } catch (err) {
      console.error('[get-config] error:', err);
      return errorResult('读取配置失败');
    }
  });

  /**
   * 更新并持久化配置
   * 与现有配置做浅合并，写入 config.json 并同步 global.app_config
   * 如果 saveDirectory 变更，会重新加载 groups 数据
   */
  ipcMain.handle(IPC_CHANNELS.UPDATE_CONFIG, async (_event, newConfig: Record<string, unknown>) => {
    try {
      const config = await getConfigJsonAsync();
      console.log('[update-config] current config:', config);
      console.log('[update-config] merging with:', newConfig);
      const mergedConfig = {
        ...config,
        ...newConfig,
      };
      global.app_config = mergedConfig as AppConfig;

      // 存档目录变更时重新加载笔记分组数据
      if (newConfig.saveDirectory) {
        global.app_groupsConfig = await getGroupsConfigAsync(true);
        global.app_groupsConfigMap = undefined;
      }

      // 写入磁盘
      const configDir = app.getPath('documents');
      const configFilePath = path.join(configDir, 'cloudNote', 'config.json');
      await fs.mkdir(path.dirname(configFilePath), { recursive: true });
      await fs.writeFile(configFilePath, JSON.stringify(mergedConfig, null, 2), 'utf-8');

      // 备份配置变更时重启调度器
      if (newConfig.backupDirectory !== undefined || newConfig.backupIntervalMinutes !== undefined) {
        await restartSchedulerFromConfig();
      }

      return successResult(undefined);
    } catch (err) {
      console.error('更新配置失败:', err);
      return errorResult('更新配置失败');
    }
  });

  /** 打开系统目录选择对话框，返回用户选中的目录路径或 null */
  ipcMain.handle(IPC_CHANNELS.SELECT_SAVE_DIRECTORY, async (_event, defaultPath?: string) => {
    try {
      const result = await dialog.showOpenDialog({
        title: '选择存档文件夹',
        defaultPath,
        properties: ['openDirectory'],
      });

      if (!result.canceled && result.filePaths.length > 0) {
        return successResult(result.filePaths[0]);
      }
      return successResult(null);
    } catch (err) {
      console.error('选择目录失败:', err);
      return errorResult('选择目录失败');
    }
  });
}
