/**
 * 窗口控制 IPC Handler
 *
 * 全部使用 ipcMain.on（send/on 单向模式），渲染进程不等待响应。
 * 从 event.sender 反查 BrowserWindow 实例执行操作。
 */
import { ipcMain, BrowserWindow } from 'electron';
import { hideMainWindow } from '../utils/tools';
import { IPC_CHANNELS } from '../shared/ipc-channels';

export function registerWindowHandlers(): void {
  /** 隐藏窗口到系统托盘（不关闭） */
  ipcMain.on(IPC_CHANNELS.WINDOW_HIDE, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      hideMainWindow(win);
    }
  });

  /** 最小化窗口到任务栏 */
  ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.minimize();
    }
  });

  /** 关闭窗口 */
  ipcMain.on(IPC_CHANNELS.WINDOW_CLOSE, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.close();
    }
  });

  /** 切换窗口置顶状态 */
  ipcMain.on(IPC_CHANNELS.WINDOW_TOGGLE_ALWAYS_ON_TOP, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      const newState = !win.isAlwaysOnTop();
      win.setAlwaysOnTop(newState);
      event.sender.send(IPC_CHANNELS.WINDOW_ALWAYS_ON_TOP_CHANGED, newState);
    }
  });

  /** 切换 Chrome DevTools */
  ipcMain.on(IPC_CHANNELS.TOGGLE_DEVTOOLS, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.webContents.toggleDevTools();
    }
  });
}
