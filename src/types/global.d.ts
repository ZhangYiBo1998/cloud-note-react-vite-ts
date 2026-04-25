/**
 * 全局类型扩展：向 window 注入的 Electron API（通过 preload 暴露）
 *
 * IElectronAPI 中每个方法对应 preload.ts 中的一个 IPC 通道，
 * 渲染进程通过 window.electronAPI 调用，无需关心底层 invoke/send 细节。
 *
 * 所有异步方法统一返回 IpcResult<T>，渲染端必须先检查 result.success 再消费 data。
 */
import type {
  IConfigData,
  IGroupsContextValue,
  IGroupsConfig,
  ICreateNoteOptions,
} from "./index";

/** 统一 IPC 返回格式 — 与 app/shared/ipc-result.ts 保持一致 */
export interface IpcResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/** 全文搜索结果条目 */
export interface SearchResultItem {
  noteKey: string;
  fileName: string;
  groupName: string;
  snippet: string;
}

/** preload 暴露给渲染进程的 API 集合 */
export interface IElectronAPI {
  /** 将应用窗口最小化到任务栏 */
  minimizeWindow(): void;

  /** 关闭主窗口 */
  closeWindow(): void;

  /** 隐藏窗口（托盘模式） */
  hideWindow(): void;

  /** 切换窗口始终置顶 */
  toggleAlwaysOnTop(): void;

  /** 监听窗口置顶状态变化 */
  onAlwaysOnTopChanged(callback: (isOnTop: boolean) => void): void;

  /** 设置应用开机自启状态 */
  setAutoLaunch(bool: boolean): void;

  /** 获取当前开机自启配置 */
  getAutoLaunch(): Promise<IpcResult<boolean>>;

  /** 打开选择保存目录的对话框 */
  selectSaveDirectory(defaultPath?: string): Promise<IpcResult<string | null>>;

  /** 读取应用配置（config.json） */
  getConfigJsonAsync(force?: boolean): Promise<IpcResult<IConfigData>>;

  /** 更新并持久化应用配置 */
  updateConfigJsonAsync(config: Record<string, unknown>): Promise<IpcResult<void>>;

  /** 获取指定保存目录下的笔记分组信息 */
  getNoteGroupsAsync(saveDir: string): Promise<IpcResult<IGroupsContextValue['groupsConfig']>>;

  /** 更新 groups.json 文件 */
  updateGroupsConfigAsync(newGroupsConfig: IGroupsConfig): Promise<IpcResult<void>>;

  /** 创建新笔记文件或分组目录 */
  createNoteAsync(options: ICreateNoteOptions): Promise<IpcResult<void>>;

  /** 读取指定笔记的文本内容 */
  readNoteAsync(noteKey: string): Promise<IpcResult<string>>;

  /** 将内容写回指定笔记 */
  writeNoteAsync(noteKey: string, content: string): Promise<IpcResult<void>>;

  /** 删除分组 */
  deleteGroupAsync(groupKey: string): Promise<IpcResult<IGroupsConfig>>;

  /** 删除分组中的笔记 */
  deleteNoteInGroupAsync(noteKey: string): Promise<IpcResult<IGroupsConfig>>;

  /** 重命名笔记 */
  renameNoteAsync(noteKey: string, newName: string): Promise<IpcResult<IGroupsConfig>>;

  /** 重命名分组 */
  renameGroupAsync(groupKey: string, newName: string): Promise<IpcResult<IGroupsConfig>>;

  /** 更新笔记标签 */
  updateNoteTagsAsync(noteKey: string, tags: string[]): Promise<IpcResult<void>>;

  /** 初始化 GitHub 仓库 */
  initGitHubAsync(gitUrl: string): Promise<IpcResult<string>>;

  /** 推送到 GitHub */
  pushToGitHubAsync(): Promise<IpcResult<string>>;

  /** 从 git remote 获取当前仓库地址 */
  getGitRemoteUrlAsync(): Promise<IpcResult<string>>;

  /** 全文搜索笔记内容 */
  searchNotesAsync(query: string): Promise<IpcResult<SearchResultItem[]>>;

  /** 立即执行一次备份 */
  performBackupAsync(): Promise<IpcResult<void>>;

  /** 获取备份状态 */
  getBackupStatusAsync(): Promise<IpcResult<BackupState>>;

  /** 切换 Chrome DevTools */
  toggleDevTools(): void;

  /** 监听主进程导航指令（托盘菜单"设置"触发） */
  onNavigateTo(callback: (path: string) => void): void;
}

/** 备份状态 */
export interface BackupState {
  lastBackupTime: number | null;
  nextBackupTime: number | null;
  backupInProgress: boolean;
  backupCount: number;
}

declare global {
  interface Window {
    /**
     * 通过 preload 暴露给渲染进程的 Electron API
     */
    electronAPI: IElectronAPI;
  }
}
