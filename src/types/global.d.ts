export interface IElectronAPI {
    minimizeWindow(): void;
    closeWindow(): void;
    hideWindow(): void;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}