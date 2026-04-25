/**
 * 全文搜索 IPC Handler
 *
 * 遍历 groupsConfigMap 中所有 .txt/.md/.html 笔记文件，
 * 大小写不敏感匹配内容，返回匹配项及前后各 30 字符片段。
 * 单个文件读取失败跳过，不影响整体搜索结果。
 */
import { ipcMain } from 'electron';
import path from 'path';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import { successResult, errorResult } from '../shared/ipc-result';
import { readFileAsync, getAppSaveDirectoryAsync } from '../utils/tools';

/** 搜索结果条目 */
export interface SearchResultItem {
  noteKey: string;
  fileName: string;
  groupName: string;
  snippet: string;
}

export function registerSearchHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SEARCH_NOTES, async (_event, query: string) => {
    if (!query?.trim()) {
      return successResult([]);
    }

    const groupsMap = global.app_groupsConfigMap || {};
    const saveDir = await getAppSaveDirectoryAsync();
    const lowerQuery = query.toLowerCase();
    const results: SearchResultItem[] = [];

    for (const [key, item] of Object.entries(groupsMap)) {
      if (item.type !== 'file') continue;
      if (!item.name || !item.parent) continue;

      const groupInfo = groupsMap[item.parent];
      if (!groupInfo) continue;

      const filePath = path.join(saveDir, groupInfo.name, item.name);

      try {
        const content = await readFileAsync(filePath);
        if (!content) continue;

        // HTML 文件先剥离标签再搜索
        const searchableContent = item.name.endsWith('.html')
          ? content.replace(/<[^>]*>/g, ' ')
          : content;

        const lowerContent = searchableContent.toLowerCase();
        const matchIndex = lowerContent.indexOf(lowerQuery);

        if (matchIndex !== -1) {
          // 截取匹配位置前后各 30 字符作为摘要
          const start = Math.max(0, matchIndex - 30);
          const end = Math.min(searchableContent.length, matchIndex + lowerQuery.length + 30);
          const snippet = (start > 0 ? '...' : '') +
            searchableContent.slice(start, end) +
            (end < searchableContent.length ? '...' : '');

          results.push({
            noteKey: key,
            fileName: item.name,
            groupName: groupInfo.name,
            snippet: snippet.replace(/\s+/g, ' ').trim(),
          });
        }
      } catch {
        // 单个文件读取失败跳过
        continue;
      }
    }

    return successResult(results);
  });
}
