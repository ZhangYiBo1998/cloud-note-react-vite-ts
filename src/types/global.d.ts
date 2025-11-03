/**
 * 全局类型扩展：向 window 注入的 Electron API（通过 preload 暴露）
 *
 * 说明：
 * - 该接口定义了渲染进程可调用的所有 Electron 原生功能的封装方法。
 * - 所有异步方法均返回 Promise，以便在渲染进程中使用 async/await。
 */
import type {
    IConfigContextValue,
    IGroupsContextValue,
    IGroupsConfig,
    ICreateNoteOptions,
} from "./index";

export interface IElectronAPI {
    /**
     * 将应用窗口最小化到任务栏（或窗口管理器）
     */
    minimizeWindow(): void;

    /**
     * 关闭主窗口（通常会触发应用退出或最小化到托盘，取决于主进程实现）
     */
    closeWindow(): void;

    /**
     * 隐藏窗口（常用于托盘模式：隐藏主窗口但不退出应用）
     */
    hideWindow(): void;

    /**
     * 设置应用开机自启状态
     * @param bool - true 表示开启自启，false 表示关闭
     */
    setAutoLaunch(bool: boolean): void;

    /**
     * 获取当前开机自启配置
     * @returns Promise<boolean> - 当前是否开启自启
     */
    getAutoLaunch(): Promise<boolean>;

    /**
     * 打开选择保存目录的对话框并返回用户选择的目录路径
     * @param defaultPath - 可选的默认初始路径
     * @returns Promise<string> - 用户选择的目录绝对路径（若用户取消可能返回空字符串或空值，具体行为由主进程实现）
     */
    selectSaveDirectory(defaultPath: string | undefined): Promise<string>;

    /**
     * 读取应用配置（config.json）并返回解析后的对象
     * @returns Promise<IConfigContextValue>
     */
    getConfigJsonAsync(): Promise<IConfigContextValue>;

    /**
     * 更新并持久化应用配置（写回 config.json）
     * @param config - 要保存的配置对象
     * @returns Promise<void>
     */
    updateConfigJsonAsync(config: IConfigContextValue): Promise<void>;

    /**
     * 获取指定保存目录下的笔记分组/列表信息（groups.json）
     * @param saveDir - 笔记保存根目录的绝对路径
     * @returns Promise<IGroupsContextValue['groupsConfig']> - groups 配置对象
     */
    getNoteGroupsAsync(saveDir: string): Promise<IGroupsContextValue['groupsConfig']>;

    /**
     * 更新 groups.json 文件并持久化分组结构
     * @param newGroupsConfig - 新的 groups 配置对象
     */
    updateGroupsConfigAsync(newGroupsConfig: IGroupsConfig): Promise<void>;

    /**
     * 创建新笔记文件（会在磁盘上创建文件/目录并更新分组元信息）
     * @param options - 创建笔记所需的选项（参见 ICreateNoteOptions 定义）
     */
    createNoteAsync(options: ICreateNoteOptions): Promise<void>;

    /**
     * 读取指定笔记的文本内容
     * @param noteKey - 笔记的唯一标识键
     * @returns Promise<string> - 笔记正文文本
     */
    readNoteAsync(noteKey: string): Promise<string>;

    /**
     * 将内容写回到指定笔记（覆盖写入）
     * @param noteKey - 笔记的唯一标识键
     * @param content - 要写入的文本内容
     */
    writeNoteAsync(noteKey: string, content: string): Promise<void>;

    /**
     * 删除分组（以及该分组下的所有子分组和文件），并更新 groups.json
     * @param groupKey - 要删除的分组 key
     */
    deleteGroupAsync(groupKey: string): Promise<IGroupsConfig>;

    /**
     * 删除分组笔记，并更新 groups.json
     * @param noteKey - 要删除的分组 key
     */
    deleteNoteInGroupAsync(noteKey: string): Promise<IGroupsConfig>;
}

declare global {
    interface Window {
        /**
         * 通过 preload 暴露给渲染进程的 Electron API 对象
         */
        electronAPI: IElectronAPI;
    }
}