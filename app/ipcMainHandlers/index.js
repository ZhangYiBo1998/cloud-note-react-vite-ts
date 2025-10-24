const {
  app,
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

// 最小化应用
ipcMain.on('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win.minimize()
})

// 退出应用
ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win.close()
})

// 设置开机自启
ipcMain.handle('set-auto-launch', async (event, enabled) => {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: app.getPath('exe'),
    // 根据需要设置参数
    args: enabled ? ['--hidden'] : []
  })
})
// 获取当前应用的开机自启状态
ipcMain.handle('get-auto-launch', async () => {
  const settings = app.getLoginItemSettings({
    // 这与设置时的 args 保持一致
    args: ['--hidden']
  })
  return settings.openAtLogin
})

// 根据搜索条件查找文件
ipcMain.handle('find-files', async (value, type) => {

  return []
})