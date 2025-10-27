import type {
    IConfigContextValue,
    IGroupsContextValue,
    IGroupsConfig,
    ICreateNoteOptions,
    INoteInfoMap,
} from "./index";

export interface IElectronAPI {
    minimizeWindow(): void;

    closeWindow(): void;

    hideWindow(): void;

    setAutoLaunch(bool: boolean): void;

    getAutoLaunch(): Promise<boolean>;

    selectSaveDirectory(defaultPath: string | undefined): Promise<string>;

    getConfigJsonAsync(): Promise<IConfigContextValue>;

    // 更新配置文件
    updateConfigJsonAsync(config: IConfigContextValue): Promise<void>;

    // 获取笔记列表
    getNoteGroupsAsync(saveDir: string): Promise<IGroupsContextValue['groupsConfig']>;

    // 更新groups.json文件
    updateGroupsConfigAsync(newGroupsConfig: IGroupsConfig): Promise<void>;
    createNoteAsync(options: ICreateNoteOptions): Promise<void>;
    readNoteAsync(noteKey: string): Promise<INoteInfoMap>;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}