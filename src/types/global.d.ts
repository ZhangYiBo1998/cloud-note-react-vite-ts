export interface IElectronAPI {
    minimizeWindow(): void;
    closeWindow(): void;
    hideWindow(): void;
    setAutoLaunch(bool: boolean): void;
    getAutoLaunch(): Promise<boolean>;
    selectSaveDirectory(): Promise<string>;
    getConfigJsonAsync(): Promise<object>;
    updateConfigJsonAsync(): Promise<void>;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}