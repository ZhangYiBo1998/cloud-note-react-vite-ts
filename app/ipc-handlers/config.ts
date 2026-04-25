import { app, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import {
  getConfigJsonAsync,
  getAppSaveDirectoryAsync,
  getGroupsConfigAsync,
  updateGroupsConfigAsync,
} from '../utils/tools';

export function registerConfigHandlers(): void {
  // Set auto launch
  ipcMain.handle(IPC_CHANNELS.SET_AUTO_LAUNCH, async (_event, enabled: boolean) => {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      path: app.getPath('exe'),
      args: enabled ? ['--hidden'] : [],
    });
  });

  // Get auto launch status
  ipcMain.handle(IPC_CHANNELS.GET_AUTO_LAUNCH, async () => {
    try {
      const settings = app.getLoginItemSettings({
        args: ['--hidden'],
      });
      return settings.openAtLogin;
    } catch {
      return false;
    }
  });

  // Get config
  ipcMain.handle(IPC_CHANNELS.GET_CONFIG, async (_event, force?: boolean) => {
    try {
      const config = await getConfigJsonAsync(force);
      return config;
    } catch (err) {
      console.error('[get-config] error:', err);
      return {};
    }
  });

  // Update config
  ipcMain.handle(IPC_CHANNELS.UPDATE_CONFIG, async (_event, newConfig: Record<string, unknown>) => {
    try {
      const config = await getConfigJsonAsync();
      console.log('[update-config] current config:', config);
      console.log('[update-config] merging with:', newConfig);
      const mergedConfig = {
        ...config,
        ...newConfig,
      };
      global.app_config = mergedConfig;

      // Also update groups config if the save directory changed
      if (newConfig.saveDirectory) {
        global.app_groupsConfig = await getGroupsConfigAsync(true);
        global.app_groupsConfigMap = undefined;
      }

      // Write config to file
      const configDir = app.getPath('documents');
      const configFilePath = path.join(configDir, 'cloudNote', 'config.json');
      await fs.mkdir(path.dirname(configFilePath), { recursive: true });
      await fs.writeFile(configFilePath, JSON.stringify(mergedConfig, null, 2), 'utf-8');
    } catch (error) {
      console.error('更新配置失败:', error);
      throw error;
    }
  });

  // Select save directory
  ipcMain.handle(IPC_CHANNELS.SELECT_SAVE_DIRECTORY, async (_event, defaultPath?: string) => {
    try {
      const result = await dialog.showOpenDialog({
        title: '选择存档文件夹',
        defaultPath,
        properties: ['openDirectory'],
      });

      if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
      }
      return null;
    } catch (error) {
      console.error('选择目录失败:', error);
      return null;
    }
  });
}
