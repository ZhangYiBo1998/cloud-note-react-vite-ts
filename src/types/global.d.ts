import type {
    IConfigContext
} from "./index";

export interface IElectronAPI {
    minimizeWindow(): void;
    closeWindow(): void;
    hideWindow(): void;
    setAutoLaunch(bool: boolean): void;
    getAutoLaunch(): Promise<boolean>;
    selectSaveDirectory(defaultPath: string): Promise<string>;
    getConfigJsonAsync(): Promise<IConfigContext>;
    updateConfigJsonAsync(config: IConfigContext): Promise<void>;
    // 获取笔记列表
    getNoteGroupsAsync(saveDir: string): Promise<string>;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}