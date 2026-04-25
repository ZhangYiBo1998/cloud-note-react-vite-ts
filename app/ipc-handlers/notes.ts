import { ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import {
  writeFileAsync,
  readFileAsync,
  getAppSaveDirectoryAsync,
  getConfigJsonAsync,
} from '../utils/tools';

interface CreateNoteOptions {
  paths?: string[];
  content?: string;
  type?: 'file' | 'group';
}

export function registerNotesHandlers(): void {
  // Create note or group directory
  ipcMain.handle(IPC_CHANNELS.CREATE_NOTE, async (_event, options: CreateNoteOptions) => {
    try {
      const { paths = [], content = '', type } = options || {};
      const saveDir = await getAppSaveDirectoryAsync();
      const notePath = path.join(saveDir, ...paths);

      if (type === 'group') {
        await fs.mkdir(notePath, { recursive: true });
      } else {
        await writeFileAsync(notePath, content);
      }
    } catch (error) {
      console.error('创建笔记失败:', error);
      throw error;
    }
  });

  // Read note content
  ipcMain.handle(IPC_CHANNELS.READ_NOTE, async (_event, noteKey: string) => {
    const groupsMap = global.app_groupsConfigMap || {};
    const noteInfo = groupsMap[noteKey];

    if (!noteInfo || !noteInfo.key || !noteInfo.parent || noteInfo.type !== 'file') {
      throw new Error('读取笔记异常：笔记不存在');
    }

    const groupInfo = groupsMap[noteInfo.parent];
    if (!groupInfo) {
      throw new Error('读取笔记异常：分组不存在');
    }

    const saveDir = await getAppSaveDirectoryAsync();
    const notePath = path.join(saveDir, groupInfo.name, noteInfo.name);
    return await readFileAsync(notePath);
  });

  // Write note content
  ipcMain.handle(IPC_CHANNELS.WRITE_NOTE, async (_event, noteKey: string, content: string) => {
    const groupsMap = global.app_groupsConfigMap || {};
    const noteInfo = groupsMap[noteKey];

    if (!noteInfo || !noteInfo.key || !noteInfo.parent || noteInfo.type !== 'file') {
      throw new Error('修改笔记异常：笔记不存在');
    }

    const groupInfo = groupsMap[noteInfo.parent];
    if (!groupInfo) {
      throw new Error('修改笔记异常：分组不存在');
    }

    const saveDir = await getAppSaveDirectoryAsync();
    const notePath = path.join(saveDir, groupInfo.name, noteInfo.name);
    await writeFileAsync(notePath, content);
  });
}
