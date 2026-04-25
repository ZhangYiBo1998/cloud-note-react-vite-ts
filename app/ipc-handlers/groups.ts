/**
 * 笔记分组管理 IPC Handler
 *
 * 处理 groups.json 的完整 CRUD：读取、更新、删除分组/笔记、重命名、标签管理。
 * groups.json 路径：<saveDirectory>/groups.json
 * 所有操作都会同步更新 global.app_groupsConfig 缓存。
 *
 * 所有 invoke handler 统一返回 IpcResult，不再 throw。
 */
import { ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import { successResult, errorResult } from '../shared/ipc-result';
import {
  readFileAsync,
  writeFileAsync,
  isFileExistAsync,
  getAppSaveDirectoryAsync,
  getGroupsConfigAsync,
  updateGroupsConfigAsync,
  groupsToMapAsync,
  GroupsConfig,
} from '../utils/tools';

export function registerGroupsHandlers(): void {
  /** 读取 groups.json 并返回笔记分组元数据 */
  ipcMain.handle(IPC_CHANNELS.GET_NOTE_GROUPS, async (_event, saveDir: string) => {
    try {
      const groupsConfigPath = path.join(saveDir, 'groups.json');
      if (await isFileExistAsync(groupsConfigPath)) {
        const groupsConfigValue = await readFileAsync(groupsConfigPath);
        const groupsConfig: GroupsConfig = JSON.parse(groupsConfigValue || 'null') || { groups: [] };
        return successResult(groupsConfig);
      }
      return successResult({ groups: [] });
    } catch (err) {
      return errorResult('读取分组配置失败');
    }
  });

  /** 更新 groups.json 并刷新 global 缓存 */
  ipcMain.handle(IPC_CHANNELS.UPDATE_GROUPS_CONFIG, async (_event, newGroupsConfig: GroupsConfig) => {
    try {
      await updateGroupsConfigAsync(newGroupsConfig);
      return successResult(undefined);
    } catch (err) {
      console.error('更新分组配置失败:', err);
      return errorResult('更新分组配置失败');
    }
  });

  /**
   * 删除分组
   * 1. 物理删除分组目录（含目录内所有笔记文件）
   * 2. 从 groups.json 移除该分组条目
   * 3. 刷新 global 缓存
   */
  ipcMain.handle(IPC_CHANNELS.DELETE_GROUP, async (_event, groupKey: string) => {
    try {
      const groupsMap = global.app_groupsConfigMap || {};
      const groupInfo = groupsMap[groupKey];
      if (!groupInfo) {
        return successResult(await getGroupsConfigAsync());
      }

      const saveDir = await getAppSaveDirectoryAsync();
      const groupPath = path.join(saveDir, groupInfo.name);
      await fs.rm(groupPath, { recursive: true, force: true });

      const groupsConfig = await getGroupsConfigAsync();
      const newGroups = (groupsConfig.groups || []).filter(g => g.key !== groupKey);
      const newGroupsConfig: GroupsConfig = { ...groupsConfig, groups: newGroups };
      await updateGroupsConfigAsync(newGroupsConfig);

      console.log('文件夹删除成功！');
      return successResult(newGroupsConfig);
    } catch (err) {
      console.error('删除失败：', err);
      return errorResult('删除分组失败');
    }
  });

  /**
   * 删除分组内的单个笔记
   * 1. 物理删除笔记文件
   * 2. 从 groups.json 对应分组的 children 中移除
   * 3. 刷新 global 缓存
   */
  ipcMain.handle(IPC_CHANNELS.DELETE_NOTE_IN_GROUP, async (_event, noteKey: string) => {
    try {
      const groupsMap = global.app_groupsConfigMap || {};
      const noteInfo = groupsMap[noteKey];
      if (!noteInfo || !noteInfo.parent) {
        return successResult(await getGroupsConfigAsync());
      }

      const targetGroup = groupsMap[noteInfo.parent];
      if (!targetGroup) {
        return successResult(await getGroupsConfigAsync());
      }

      const saveDir = await getAppSaveDirectoryAsync();
      const notePath = path.join(saveDir, targetGroup.name, noteInfo.name);
      await fs.unlink(notePath);

      const groupsConfig = await getGroupsConfigAsync();
      const newGroups = (groupsConfig.groups || []).map((group) => {
        if (group.key === noteInfo.parent) {
          group.children = group.children.filter((note) => note.key !== noteKey);
        }
        return group;
      });
      const newGroupsConfig: GroupsConfig = { ...groupsConfig, groups: newGroups };
      await updateGroupsConfigAsync(newGroupsConfig);

      console.log('笔记删除成功！');
      return successResult(newGroupsConfig);
    } catch (err) {
      console.error('删除失败：', err);
      return errorResult('删除笔记失败');
    }
  });

  /**
   * 重命名笔记
   * 1. 重命名磁盘上的笔记文件
   * 2. 更新 groups.json 中的 name 和 updateTime
   * 3. 刷新 global 缓存
   */
  ipcMain.handle(IPC_CHANNELS.RENAME_NOTE, async (_event, noteKey: string, newName: string) => {
    try {
      const groupsMap = global.app_groupsConfigMap || {};
      const noteInfo = groupsMap[noteKey];
      if (!noteInfo || !noteInfo.parent) {
        return errorResult('重命名失败：笔记不存在');
      }

      const targetGroup = groupsMap[noteInfo.parent];
      if (!targetGroup) {
        return errorResult('重命名失败：分组不存在');
      }

      const saveDir = await getAppSaveDirectoryAsync();
      const oldPath = path.join(saveDir, targetGroup.name, noteInfo.name);
      const newPath = path.join(saveDir, targetGroup.name, newName);

      await fs.rename(oldPath, newPath);
      const groupsConfig = await getGroupsConfigAsync();
      const newGroups = (groupsConfig.groups || []).map((group) => {
        if (group.key === noteInfo.parent) {
          group.children = group.children.map((note) => {
            if (note.key === noteKey) {
              return { ...note, name: newName, updateTime: Date.now() };
            }
            return note;
          });
        }
        return group;
      });
      const newGroupsConfig: GroupsConfig = { ...groupsConfig, groups: newGroups };
      await updateGroupsConfigAsync(newGroupsConfig);

      return successResult(newGroupsConfig);
    } catch (err) {
      console.error('重命名失败：', err);
      return errorResult('重命名笔记失败');
    }
  });

  /**
   * 重命名分组
   * 1. 重命名磁盘上的分组目录（目录内笔记不受影响）
   * 2. 更新 groups.json 中的 name 和 updateTime
   * 3. 重建 global.app_groupsConfigMap（因目录名变更影响笔记路径）
   */
  ipcMain.handle(IPC_CHANNELS.RENAME_GROUP, async (_event, groupKey: string, newName: string) => {
    try {
      const groupsMap = global.app_groupsConfigMap || {};
      const groupInfo = groupsMap[groupKey];
      if (!groupInfo) {
        return errorResult('重命名失败：分组不存在');
      }

      const saveDir = await getAppSaveDirectoryAsync();
      const oldPath = path.join(saveDir, groupInfo.name);
      const newPath = path.join(saveDir, newName);

      await fs.rename(oldPath, newPath);
      const groupsConfig = await getGroupsConfigAsync();
      const newGroups = (groupsConfig.groups || []).map((group) => {
        if (group.key === groupKey) {
          return { ...group, name: newName, updateTime: Date.now() };
        }
        return group;
      });
      const newGroupsConfig: GroupsConfig = { ...groupsConfig, groups: newGroups };
      await updateGroupsConfigAsync(newGroupsConfig);

      // 目录名变更后重建 map，确保后续笔记路径解析正确
      global.app_groupsConfigMap = await groupsToMapAsync();

      return successResult(newGroupsConfig);
    } catch (err) {
      console.error('分组重命名失败：', err);
      return errorResult('重命名分组失败');
    }
  });

  /**
   * 更新笔记标签
   * 修改 groups.json 中笔记的 tags 数组并更新 updateTime
   */
  ipcMain.handle(IPC_CHANNELS.UPDATE_NOTE_TAGS, async (_event, noteKey: string, tags: string[]) => {
    try {
      const groupsMap = global.app_groupsConfigMap || {};
      const noteInfo = groupsMap[noteKey];
      if (!noteInfo || !noteInfo.parent) {
        return errorResult('更新标签失败：笔记不存在');
      }

      const groupsConfig = await getGroupsConfigAsync();
      const newGroups = (groupsConfig.groups || []).map((group) => {
        if (group.key === noteInfo.parent) {
          group.children = group.children.map((note) => {
            if (note.key === noteKey) {
              return { ...note, tags, updateTime: Date.now() };
            }
            return note;
          });
        }
        return group;
      });
      const newGroupsConfig: GroupsConfig = { ...groupsConfig, groups: newGroups };
      await updateGroupsConfigAsync(newGroupsConfig);

      return successResult(undefined);
    } catch (err) {
      console.error('更新标签失败：', err);
      return errorResult('更新标签失败');
    }
  });
}
