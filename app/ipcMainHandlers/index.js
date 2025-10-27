const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
} = require('electron');
const fs = require('fs').promises;
const path = require('path');
const {
  hideMainWindow,
  readFileAsync,
  writeFileAsync,
  isFileExistAsync,
  getConfigJsonAsync,
  getAppDocumentsDir,
  getAppSaveDirectoryAsync,
  groupsToMapAsync,
} = require(path.join(__dirname, '../utils/tools.js'));
const {getGroupsConfigAsync} = require("../utils/tools");

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
  try {
    const settings = app.getLoginItemSettings({
      // 这与设置时的 args 保持一致
      args: ['--hidden']
    })
    return settings.openAtLogin
  } catch (error) {
    return false;
  }
})

// 读取配置文件
ipcMain.handle('get-config-json-async', async (event, force) => {
  try {
    return await getConfigJsonAsync(force);
  } catch (error) {
    return {};
  }
})

// 更新配置文件
ipcMain.handle('update-config-json-async', async (event, _config) => {
  try {
    const config = await getConfigJsonAsync();
    const newConfig = {
      ...config,
      ...(_config || {}),
    };
    global.app_config = newConfig;
    const configFilePath = path.join(getAppDocumentsDir(), 'config.json');
    writeFileAsync(configFilePath, JSON.stringify(newConfig, null, 2))
  } catch (error) {
    throw new Error(error);
  }
})

// 监听渲染进程选择文件夹的请求
ipcMain.handle('select-save-directory', async (event, defaultPath) => {
  try {
    const result = await dialog.showOpenDialog({
      title: '选择存档文件夹',
      defaultPath,
      // 指定为选择文件夹
      properties: ['openDirectory']
    });

    let saveDir = null;
    if (!result.canceled && result.filePaths.length > 0) {
      // 返回用户选择的文件夹路径
      saveDir = path.join(result.filePaths[0], 'save');
      // 确保目录存在，如果不存在则递归创建
      await fs.mkdir(saveDir, {recursive: true});
      return saveDir;
    } else {
      // 用户取消了选择
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
});

// 获取笔记列表
ipcMain.handle('get-note-groups-async', async (event, saveDir) => {
  try {
    const groupsConfigPath = path.join(saveDir, 'groups.json');
    if (await isFileExistAsync(groupsConfigPath)) {
      const groupsConfigValue = await readFileAsync(groupsConfigPath);
      const groupsConfig = JSON.parse(groupsConfigValue || null);
      return groupsConfig || {
        groups: [],
      };
    }
    return {
      groups: [],
    };
  } catch (error) {
    return {
      groups: [],
    };
  }
})

// 更新groups配置文件
ipcMain.handle('update-groups-config-async', async (event, _newGroupsConfig) => {
  try {
    const groupsConfig = await getGroupsConfigAsync();
    const newGroupsConfig = {
      ...groupsConfig,
      ...(_newGroupsConfig || {}),
    };
    global.app_groupsConfig = newGroupsConfig || {};
    global.app_groupsConfigMap = await groupsToMapAsync();
    const groupsConfigPath = path.join(await getAppSaveDirectoryAsync(), 'groups.json');
    writeFileAsync(groupsConfigPath, JSON.stringify(newGroupsConfig, null, 2))
  } catch (error) {
    throw new Error(error);
  }
})

ipcMain.handle('create-note-async', async (event, options) => {
  try {
    const {
      paths = [],
      content = "",
      type,
    } = options || {};
    const saveDir = await getAppSaveDirectoryAsync();
    const notePath = path.join(saveDir, ...paths);
    if (type === 'group') {
      await fs.mkdir(notePath, {recursive: true});
    } else {
      await writeFileAsync(notePath, content);
    }
  } catch (error) {
    throw new Error(error);
  }
})

ipcMain.handle('read-note-async', async (event, noteKey) => {
  const noteInfo = global.app_groupsConfigMap?.[noteKey] || {};
  if (!(noteInfo.key && noteInfo.parent && noteInfo.type === 'file')) {
    throw new Error('读取笔记异常');
  }

  const groupInfo = global.app_groupsConfigMap?.[noteInfo.parent] || {};
  const saveDir = await getAppSaveDirectoryAsync();
  const notePath = path.join(saveDir, groupInfo.name, noteInfo.name);
  return {
    ...noteInfo,
    content: await readFileAsync(notePath)
  };
})