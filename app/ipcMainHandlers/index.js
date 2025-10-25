const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
} = require('electron');
const path = require('path');
const {
  hideMainWindow,
  readFileAsync,
  createFileAsync,
  isFileExistAsync,
  getConfigJsonAsync,
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

// 读取配置文件
ipcMain.handle('get-config-json-async', getConfigJsonAsync)

// 更新配置文件
ipcMain.handle('update-config-json-async', async (event, _config) => {
  const config = getConfigJsonAsync(event);
  const newConfig = {
    ...config,
    ..._config,
  };
  const documentsDir = app.getPath('documents');
  const configFilePath = path.join(documentsDir, 'cloudNote', 'config.json');
  createFileAsync(configFilePath, JSON.stringify(newConfig))
})

// 监听渲染进程选择文件夹的请求
ipcMain.handle('select-save-directory', async (event, defaultPath) => {
  const result = await dialog.showOpenDialog({
    title: '选择存档文件夹',
    defaultPath,
    // 指定为选择文件夹
    properties: ['openDirectory']
  });

  let saveDir = null;
  if (!result.canceled && result.filePaths.length > 0) {
    // 返回用户选择的文件夹路径
    saveDir = result.filePaths[0];
    const configFilePath = path.join(saveDir, 'config.json');
    createFileAsync(configFilePath, JSON.stringify({
      saveDir: configFilePath,
    }))
  }

  // 用户取消了选择
  return saveDir;
});

// 创建笔记
ipcMain.handle('create-note-async', async (event, _paths, fileData, options) => {
  // const documentsDir = app.getPath('documents');
  // const saveDir = 'isDefaultPath?' ? documentsDir : 'D:\CloudNote'
  // const newPaths = path.join(saveDir, ..._paths);
  // createFileAsync(newPaths, fileData, options)
})