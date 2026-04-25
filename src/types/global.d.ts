/**
 * 全局类型扩展：向 window 注入的 Electron API（通过 preload 暴露）
 */
import type {
  IConfigData,
  IGroupsContextValue,
  IGroupsConfig,
  ICreateNoteOptions,
} from "./index";

export interface IGitResult {
  success: boolean;
  output?: string;
  error?: string;
}

export interface IElectronAPI {
  /** 将应用窗口最小化到任务栏 */
  minimizeWindow(): void;

  /** 关闭主窗口 */
  closeWindow(): void;

  /** 隐藏窗口（托盘模式） */
  hideWindow(): void;

  /** 设置应用开机自启状态 */
  setAutoLaunch(bool: boolean): void;

  /** 获取当前开机自启配置 */
  getAutoLaunch(): Promise<boolean>;

  /** 打开选择保存目录的对话框 */
  selectSaveDirectory(defaultPath?: string): Promise<string | null>;

  /** 读取应用配置（config.json） */
  getConfigJsonAsync(force?: boolean): Promise<IConfigData>;

  /** 更新并持久化应用配置 */
  updateConfigJsonAsync(config: Record<string, unknown>): Promise<void>;

  /** 获取指定保存目录下的笔记分组信息 */
  getNoteGroupsAsync(saveDir: string): Promise<IGroupsContextValue['groupsConfig']>;

  /** 更新 groups.json 文件 */
  updateGroupsConfigAsync(newGroupsConfig: IGroupsConfig): Promise<void>;

  /** 创建新笔记文件或分组目录 */
  createNoteAsync(options: ICreateNoteOptions): Promise<void>;

  /** 读取指定笔记的文本内容 */
  readNoteAsync(noteKey: string): Promise<string | null>;

  /** 将内容写回指定笔记 */
  writeNoteAsync(noteKey: string, content: string): Promise<void>;

  /** 删除分组 */
  deleteGroupAsync(groupKey: string): Promise<IGroupsConfig>;

  /** 删除分组中的笔记 */
  deleteNoteInGroupAsync(noteKey: string): Promise<IGroupsConfig>;

  /** 重命名笔记 */
  renameNoteAsync(noteKey: string, newName: string): Promise<IGroupsConfig>;

  /** 重命名分组 */
  renameGroupAsync(groupKey: string, newName: string): Promise<IGroupsConfig>;

  /** 更新笔记标签 */
  updateNoteTagsAsync(noteKey: string, tags: string[]): Promise<void>;

  /** 初始化 GitHub 仓库 */
  initGitHubAsync(gitUrl: string): Promise<IGitResult>;

  /** 推送到 GitHub */
  pushToGitHubAsync(): Promise<IGitResult>;

  /** 从 git remote 获取当前仓库地址 */
  getGitRemoteUrlAsync(): Promise<string>;
}

declare global {
  interface Window {
    /**
     * 通过 preload 暴露给渲染进程的 Electron API
     */
    electronAPI: IElectronAPI;
  }
}
