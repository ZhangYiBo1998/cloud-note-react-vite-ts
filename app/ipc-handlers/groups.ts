import { ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import {
  readFileAsync,
  writeFileAsync,
  isFileExistAsync,
  getAppSaveDirectoryAsync,
  getConfigJsonAsync,
  getGroupsConfigAsync,
  updateGroupsConfigAsync,
  groupsToMapAsync,
  GroupsConfig,
  GroupItem,
  NoteItem,
} from '../utils/tools';

export function registerGroupsHandlers(): void {
  // Get note groups (metadata from groups.json)
  ipcMain.handle(IPC_CHANNELS.GET_NOTE_GROUPS, async (_event, saveDir: string) => {
    try {
      const groupsConfigPath = path.join(saveDir, 'groups.json');
      if (await isFileExistAsync(groupsConfigPath)) {
        const groupsConfigValue = await readFileAsync(groupsConfigPath);
        const groupsConfig: GroupsConfig = JSON.parse(groupsConfigValue || 'null') || { groups: [] };
        return groupsConfig;
      }
      return { groups: [] };
    } catch {
      return { groups: [] };
    }
  });

  // Update groups config
  ipcMain.handle(IPC_CHANNELS.UPDATE_GROUPS_CONFIG, async (_event, newGroupsConfig: GroupsConfig) => {
    try {
      await updateGroupsConfigAsync(newGroupsConfig);
    } catch (error) {
      throw error;
    }
  });

  // Delete group
  ipcMain.handle(IPC_CHANNELS.DELETE_GROUP, async (_event, groupKey: string) => {
    const groupsMap = global.app_groupsConfigMap || {};
    const groupInfo = groupsMap[groupKey];
    if (!groupInfo) {
      return await getGroupsConfigAsync();
    }

    const saveDir = await getAppSaveDirectoryAsync();
    const groupPath = path.join(saveDir, groupInfo.name);
    try {
      await fs.rm(groupPath, { recursive: true, force: true });
      const groupsConfig = await getGroupsConfigAsync();
      const newGroups = (groupsConfig.groups || []).filter(g => g.key !== groupKey);
      const newGroupsConfig: GroupsConfig = {
        ...groupsConfig,
        groups: newGroups,
      };
      await updateGroupsConfigAsync(newGroupsConfig);
      console.log('文件夹删除成功！');
      return newGroupsConfig;
    } catch (err) {
      console.error('删除失败：', err);
      return await getGroupsConfigAsync();
    }
  });

  // Delete note in group
  ipcMain.handle(IPC_CHANNELS.DELETE_NOTE_IN_GROUP, async (_event, noteKey: string) => {
    const groupsMap = global.app_groupsConfigMap || {};
    const noteInfo = groupsMap[noteKey];
    if (!noteInfo || !noteInfo.parent) {
      return await getGroupsConfigAsync();
    }

    const targetGroup = groupsMap[noteInfo.parent];
    if (!targetGroup) {
      return await getGroupsConfigAsync();
    }

    const saveDir = await getAppSaveDirectoryAsync();
    const notePath = path.join(saveDir, targetGroup.name, noteInfo.name);
    try {
      await fs.unlink(notePath);
      const groupsConfig = await getGroupsConfigAsync();
      const newGroups = (groupsConfig.groups || []).map((group) => {
        if (group.key === noteInfo.parent) {
          group.children = group.children.filter((note) => note.key !== noteKey);
        }
        return group;
      });
      const newGroupsConfig: GroupsConfig = {
        ...groupsConfig,
        groups: newGroups,
      };
      await updateGroupsConfigAsync(newGroupsConfig);
      console.log('笔记删除成功！');
      return newGroupsConfig;
    } catch (err) {
      console.error('删除失败：', err);
      return await getGroupsConfigAsync();
    }
  });

  // Rename note
  ipcMain.handle(IPC_CHANNELS.RENAME_NOTE, async (_event, noteKey: string, newName: string) => {
    const groupsMap = global.app_groupsConfigMap || {};
    const noteInfo = groupsMap[noteKey];
    if (!noteInfo || !noteInfo.parent) {
      throw new Error('重命名失败：笔记不存在');
    }

    const targetGroup = groupsMap[noteInfo.parent];
    if (!targetGroup) {
      throw new Error('重命名失败：分组不存在');
    }

    const saveDir = await getAppSaveDirectoryAsync();
    const oldPath = path.join(saveDir, targetGroup.name, noteInfo.name);
    const newPath = path.join(saveDir, targetGroup.name, newName);

    try {
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
      return newGroupsConfig;
    } catch (err) {
      console.error('重命名失败：', err);
      throw err;
    }
  });

  // Rename group
  ipcMain.handle(IPC_CHANNELS.RENAME_GROUP, async (_event, groupKey: string, newName: string) => {
    const groupsMap = global.app_groupsConfigMap || {};
    const groupInfo = groupsMap[groupKey];
    if (!groupInfo) {
      throw new Error('重命名失败：分组不存在');
    }

    const saveDir = await getAppSaveDirectoryAsync();
    const oldPath = path.join(saveDir, groupInfo.name);
    const newPath = path.join(saveDir, newName);

    try {
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

      // Update global map after rename
      global.app_groupsConfigMap = await groupsToMapAsync();
      return newGroupsConfig;
    } catch (err) {
      console.error('分组重命名失败：', err);
      throw err;
    }
  });

  // Update note tags
  ipcMain.handle(IPC_CHANNELS.UPDATE_NOTE_TAGS, async (_event, noteKey: string, tags: string[]) => {
    const groupsMap = global.app_groupsConfigMap || {};
    const noteInfo = groupsMap[noteKey];
    if (!noteInfo || !noteInfo.parent) {
      throw new Error('更新标签失败：笔记不存在');
    }

    try {
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
    } catch (err) {
      console.error('更新标签失败：', err);
      throw err;
    }
  });
}
