import { ipcMain, BrowserWindow } from 'electron';
import { hideMainWindow } from '../utils/tools';
import { IPC_CHANNELS } from '../shared/ipc-channels';

export function registerWindowHandlers(): void {
  ipcMain.on(IPC_CHANNELS.WINDOW_HIDE, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      hideMainWindow(win);
    }
  });

  ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.minimize();
    }
  });

  ipcMain.on(IPC_CHANNELS.WINDOW_CLOSE, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.close();
    }
  });
}
