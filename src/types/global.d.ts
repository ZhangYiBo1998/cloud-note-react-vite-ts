export interface IElectronAPI {
    minimizeWindow(): void;
    closeWindow(): void;
    hideWindow(): void;
    setAutoLaunch(bool: boolean): void;
    getAutoLaunch(): Promise<boolean>;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}