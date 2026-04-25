/**
 * IPC 通道常量定义 —— 主进程和 preload 双向引用
 *
 * 命名约定：
 * - *_ASYNC 后缀 → invoke/handle 双向通信（渲染进程等待主进程响应）
 * - 无后缀     → send/on 单向通知（渲染进程发，主进程收，不等待响应）
 *
 * 注意：此文件被 main process 和 preload 引用，preload 中因 sandbox 限制
 * 需内联一份副本（无法 import），两处需手动保持同步。
 */

export const IPC_CHANNELS = {
  // ---- 窗口控制（send/on 单向） ----
  WINDOW_HIDE: 'window-hide',
  WINDOW_MINIMIZE: 'window-minimize',
  WINDOW_CLOSE: 'window-close',
  WINDOW_TOGGLE_ALWAYS_ON_TOP: 'window-toggle-always-on-top',
  WINDOW_ALWAYS_ON_TOP_CHANGED: 'window-always-on-top-changed',

  // ---- 开机自启 ----
  SET_AUTO_LAUNCH: 'set-auto-launch',
  GET_AUTO_LAUNCH: 'get-auto-launch',

  // ---- 应用配置 ----
  GET_CONFIG: 'get-config-json-async',
  UPDATE_CONFIG: 'update-config-json-async',
  SELECT_SAVE_DIRECTORY: 'select-save-directory',

  // ---- 笔记读写 ----
  CREATE_NOTE: 'create-note-async',
  READ_NOTE: 'read-note-async',
  WRITE_NOTE: 'write-note-async',

  // ---- 笔记分组 ----
  GET_NOTE_GROUPS: 'get-note-groups-async',
  UPDATE_GROUPS_CONFIG: 'update-groups-config-async',
  DELETE_GROUP: 'delete-group-async',
  DELETE_NOTE_IN_GROUP: 'delete-note-in-group-async',
  RENAME_NOTE: 'rename-note-async',
  RENAME_GROUP: 'rename-group-async',
  UPDATE_NOTE_TAGS: 'update-note-tags-async',

  // ---- Git 同步 ----
  INIT_GITHUB: 'init-github',
  PUSH_TO_GITHUB: 'push-to-github',
  GET_GIT_URL: 'get-git-url',

  // ---- 备份（待实现） ----
  PERFORM_BACKUP: 'perform-backup',
  GET_BACKUP_STATUS: 'get-backup-status',

  // ---- 全文搜索 ----
  SEARCH_NOTES: 'search-notes-async',

  // ---- 主进程 → 渲染进程导航指令（send/on 单向） ----
  NAVIGATE_TO: 'navigate-to',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
