export interface IElectronAPI {
    minimizeWindow(): void;
    closeWindow(): void;
    hideWindow(): void;
    setAutoLaunch(bool: boolean): void;
    getAutoLaunch(): Promise<boolean>;
    findFiles(value: string, type: string): Promise<any[]>;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}