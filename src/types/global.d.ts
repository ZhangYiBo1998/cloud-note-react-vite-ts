import type {
    IConfigContextValue,
    IGroupsContextValue,
} from "./index";

export interface IElectronAPI {
    minimizeWindow(): void;
    closeWindow(): void;
    hideWindow(): void;
    setAutoLaunch(bool: boolean): void;
    getAutoLaunch(): Promise<boolean>;
    selectSaveDirectory(defaultPath: string | undefined): Promise<string>;
    getConfigJsonAsync(): Promise<IConfigContextValue>;
    updateConfigJsonAsync(config: IConfigContextValue): Promise<void>;
    // 获取笔记列表
    getNoteGroupsAsync(saveDir: string): Promise<IGroupsContextValue>;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}