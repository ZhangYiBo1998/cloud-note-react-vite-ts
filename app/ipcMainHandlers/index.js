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
  getAppDocumentsDir,
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
  const configFilePath = path.join(getAppDocumentsDir(), 'config.json');
  createFileAsync(configFilePath, JSON.stringify(newConfig, null, 2))
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
    }, null, 2))
  }

  // 用户取消了选择
  return saveDir;
});

// 获取笔记列表
ipcMain.handle('get-note-groups-async', async (event, saveDir) => {
  const groupsConfigPath = path.join(saveDir, 'groups.json');
  let groupsConfigValue;
  if (await isFileExistAsync(groupsConfigPath)) {
    groupsConfigValue = await readFileAsync(groupsConfigPath) || '{}';
  } else {
    const defaultGroupsValue = JSON.stringify({
      groups: [
        {
          key: 'group-default',
          label: '默认分组',
          children: [
            {
              key: 'group-default-text',
              label: '默认文本',
              createTime: new Date().getTime(),
              updateTime: new Date().getTime(),
              tags: [],
            },
          ],
        },
      ],
    }, null, 2);
    await createFileAsync(groupsConfigPath, defaultGroupsValue);
    groupsConfigValue = defaultGroupsValue;
  }
  try {
    const groupsConfig = JSON.parse(groupsConfigValue);
    return groupsConfig || {};
  } catch (error) {
    return {};
  }
})