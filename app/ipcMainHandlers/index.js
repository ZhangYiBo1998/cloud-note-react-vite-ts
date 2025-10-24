const {
  BrowserWindow,
  ipcMain,
} = require('electron');
const path = require('path');
const {
  hideMainWindow,
} = require(path.join(__dirname, '../utils/tools.js'));

// 最小化到托盘
ipcMain.on('window-hide', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  hideMainWindow(win);
})

// 处理窗口控制操作的IPC监听器
ipcMain.on('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win.minimize()
})
ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win.close()
})