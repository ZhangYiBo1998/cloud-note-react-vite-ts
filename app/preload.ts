/**
 * Electron Preload 脚本
 *
 * 通过 contextBridge 向渲染进程安全暴露 IPC API。
 * 注意：sandbox 环境下不能 import 本地模块，所有常量（CHANNELS）必须内联于此文件。
 *
 * safeInvoke: 所有 invoke 调用统一包装。
 *            正常路径：handler 返回 IpcResult { success, data, error }，渲染端自行解包。
 *            异常路径：handler 若意外 throw，此处 .catch 后返回 undefined 作为最后安全网。
 */
import { contextBridge, ipcRenderer } from 'electron';

// 与 app/shared/ipc-channels.ts 保持同步的通道常量副本（sandbox 限制）
const CHANNELS = {
  WINDOW_HIDE: 'window-hide',
  WINDOW_MINIMIZE: 'window-minimize',
  WINDOW_CLOSE: 'window-close',
  SET_AUTO_LAUNCH: 'set-auto-launch',
  GET_AUTO_LAUNCH: 'get-auto-launch',
  GET_CONFIG: 'get-config-json-async',
  UPDATE_CONFIG: 'update-config-json-async',
  SELECT_SAVE_DIRECTORY: 'select-save-directory',
  CREATE_NOTE: 'create-note-async',
  READ_NOTE: 'read-note-async',
  WRITE_NOTE: 'write-note-async',
  GET_NOTE_GROUPS: 'get-note-groups-async',
  UPDATE_GROUPS_CONFIG: 'update-groups-config-async',
  DELETE_GROUP: 'delete-group-async',
  DELETE_NOTE_IN_GROUP: 'delete-note-in-group-async',
  RENAME_NOTE: 'rename-note-async',
  RENAME_GROUP: 'rename-group-async',
  UPDATE_NOTE_TAGS: 'update-note-tags-async',
  INIT_GITHUB: 'init-github',
  PUSH_TO_GITHUB: 'push-to-github',
  GET_GIT_URL: 'get-git-url',
  SEARCH_NOTES: 'search-notes-async',
  PERFORM_BACKUP: 'perform-backup',
  GET_BACKUP_STATUS: 'get-backup-status',
};

/**
 * 安全 IPC invoke 包装
 * 正常路径：handler 返回 IpcResult { success, data, error }
 * 异常路径：handler 若意外 throw，此处 catch 后返回 undefined
 */
function safeInvoke(channel: string, ...args: unknown[]): Promise<unknown> {
  return ipcRenderer.invoke(channel, ...args).catch((err: Error) => {
    console.error(`[preload] IPC invoke failed for "${channel}":`, err);
    return undefined;
  });
}

contextBridge.exposeInMainWorld('electronAPI', {
  // ---- 窗口控制（基于 ipcRenderer.send，无返回值） ----
  minimizeWindow: () => ipcRenderer.send(CHANNELS.WINDOW_MINIMIZE),
  closeWindow: () => ipcRenderer.send(CHANNELS.WINDOW_CLOSE),
  hideWindow: () => ipcRenderer.send(CHANNELS.WINDOW_HIDE),

  // ---- 开机自启 ----
  setAutoLaunch: (checked: boolean) => safeInvoke(CHANNELS.SET_AUTO_LAUNCH, checked),
  getAutoLaunch: () => safeInvoke(CHANNELS.GET_AUTO_LAUNCH),

  // ---- 应用配置 ----
  selectSaveDirectory: (defaultPath?: string) => safeInvoke(CHANNELS.SELECT_SAVE_DIRECTORY, defaultPath),
  getConfigJsonAsync: (force?: boolean) => safeInvoke(CHANNELS.GET_CONFIG, force),
  updateConfigJsonAsync: (newConfig: Record<string, unknown>) => safeInvoke(CHANNELS.UPDATE_CONFIG, newConfig),

  // ---- 笔记分组 ----
  getNoteGroupsAsync: (saveDir: string) => safeInvoke(CHANNELS.GET_NOTE_GROUPS, saveDir),
  updateGroupsConfigAsync: (newGroupsConfig: unknown) => safeInvoke(CHANNELS.UPDATE_GROUPS_CONFIG, newGroupsConfig),

  // ---- 笔记 CRUD ----
  createNoteAsync: (options: { paths: string[]; type: string; content?: string }) =>
    safeInvoke(CHANNELS.CREATE_NOTE, options),
  readNoteAsync: (noteKey: string) => safeInvoke(CHANNELS.READ_NOTE, noteKey),
  writeNoteAsync: (noteKey: string, content: string) => safeInvoke(CHANNELS.WRITE_NOTE, noteKey, content),

  // ---- 删除 ----
  deleteGroupAsync: (groupKey: string) => safeInvoke(CHANNELS.DELETE_GROUP, groupKey),
  deleteNoteInGroupAsync: (noteKey: string) => safeInvoke(CHANNELS.DELETE_NOTE_IN_GROUP, noteKey),

  // ---- 重命名 ----
  renameNoteAsync: (noteKey: string, newName: string) => safeInvoke(CHANNELS.RENAME_NOTE, noteKey, newName),
  renameGroupAsync: (groupKey: string, newName: string) => safeInvoke(CHANNELS.RENAME_GROUP, groupKey, newName),

  // ---- 标签 ----
  updateNoteTagsAsync: (noteKey: string, tags: string[]) => safeInvoke(CHANNELS.UPDATE_NOTE_TAGS, noteKey, tags),

  // ---- Git 同步 ----
  initGitHubAsync: (gitUrl: string) => safeInvoke(CHANNELS.INIT_GITHUB, gitUrl),
  pushToGitHubAsync: () => safeInvoke(CHANNELS.PUSH_TO_GITHUB),
  getGitRemoteUrlAsync: () => safeInvoke(CHANNELS.GET_GIT_URL),

  // ---- 全文搜索 ----
  searchNotesAsync: (query: string) => safeInvoke(CHANNELS.SEARCH_NOTES, query),

  // ---- 自动备份 ----
  performBackupAsync: () => safeInvoke(CHANNELS.PERFORM_BACKUP),
  getBackupStatusAsync: () => safeInvoke(CHANNELS.GET_BACKUP_STATUS),
});
