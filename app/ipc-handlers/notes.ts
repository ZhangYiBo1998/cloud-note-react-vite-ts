/**
 * 笔记读写 IPC Handler
 *
 * 处理笔记文件和分组目录的创建、读取、写入。
 * 笔记存储路径：<saveDirectory>/<groupName>/<noteName>.<ext>
 * 依赖 global.app_groupsConfigMap 解析 noteKey → 文件路径
 *
 * 所有 invoke handler 统一返回 IpcResult，不再 throw。
 */
import { ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import { successResult, errorResult } from '../shared/ipc-result';
import {
  writeFileAsync,
  readFileAsync,
  getAppSaveDirectoryAsync,
} from '../utils/tools';

interface CreateNoteOptions {
  paths?: string[];
  content?: string;
  type?: 'file' | 'group';
}

export function registerNotesHandlers(): void {
  /**
   * 创建笔记文件或分组目录
   * type === 'group' → 创建目录
   * type === 'file'  → 创建文件并写入初始内容
   */
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
      return successResult(undefined);
    } catch (err) {
      console.error('创建笔记失败:', err);
      return errorResult('创建笔记失败');
    }
  });

  /**
   * 读取笔记文件内容
   * 通过 groupsMap[noteKey] 查找文件路径，返回 UTF-8 文本
   */
  ipcMain.handle(IPC_CHANNELS.READ_NOTE, async (_event, noteKey: string) => {
    try {
      const groupsMap = global.app_groupsConfigMap || {};
      const noteInfo = groupsMap[noteKey];

      if (!noteInfo || !noteInfo.key || !noteInfo.parent || noteInfo.type !== 'file') {
        return errorResult('读取笔记异常：笔记不存在');
      }

      const groupInfo = groupsMap[noteInfo.parent];
      if (!groupInfo) {
        return errorResult('读取笔记异常：分组不存在');
      }

      const saveDir = await getAppSaveDirectoryAsync();
      const notePath = path.join(saveDir, groupInfo.name, noteInfo.name);
      const content = await readFileAsync(notePath);
      return successResult(content);
    } catch (err) {
      console.error('读取笔记失败:', err);
      return errorResult('读取笔记失败');
    }
  });

  /**
   * 将内容写回笔记文件
   * 同样通过 groupsMap 解析路径，覆盖写入
   */
  ipcMain.handle(IPC_CHANNELS.WRITE_NOTE, async (_event, noteKey: string, content: string) => {
    try {
      const groupsMap = global.app_groupsConfigMap || {};
      const noteInfo = groupsMap[noteKey];

      if (!noteInfo || !noteInfo.key || !noteInfo.parent || noteInfo.type !== 'file') {
        return errorResult('修改笔记异常：笔记不存在');
      }

      const groupInfo = groupsMap[noteInfo.parent];
      if (!groupInfo) {
        return errorResult('修改笔记异常：分组不存在');
      }

      const saveDir = await getAppSaveDirectoryAsync();
      const notePath = path.join(saveDir, groupInfo.name, noteInfo.name);
      await writeFileAsync(notePath, content);
      return successResult(undefined);
    } catch (err) {
      console.error('写入笔记失败:', err);
      return errorResult('写入笔记失败');
    }
  });
}
