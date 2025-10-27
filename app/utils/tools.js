const {app} = require("electron");
const fs = require('fs').promises;
const path = require('path');

// 显示主窗口
const showMainWindow = (win) => {
  win.show();
  win.setSkipTaskbar(false);
  win.focus();
}

// 隐藏主窗口
const hideMainWindow = (win) => {
  win.hide();
  win.setSkipTaskbar(true);
}

const readFileAsync = async (filePath, options) => {
  try {
    return await fs.readFile(filePath, {
      encoding: 'utf-8',
      ...(options || {})
    });
  } catch (err) {
    console.error('读取文件出错:', err);
    return null;
  }
}

const writeFileAsync = async (filePath, fileData, options) => {
  try {
    // 提取文件所在目录
    const dirName = path.dirname(filePath);
    // 确保目录存在，如果不存在则递归创建
    await fs.mkdir(dirName, {recursive: true});

    await fs.writeFile(filePath, fileData, {
      encoding: 'utf-8',
      ...(options || {})
    });
    console.log('file has been created!');
  } catch (err) {
    console.error('Error creating files:', err);
  }
}

// 判断文件是否存在
const isFileExistAsync = async (_path) => {
  try {
    await fs.access(_path)
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('文件不存在 (通过 promises.access)');
      return false;
    } else {
      // 处理其他错误（如权限问题）
      console.error('访问文件时出错：', error);
      throw error;
    }
  }
}

// 获取应用的 documents 目录
const getAppDocumentsDir = () => {
  const documentsDir = app.getPath('documents');
  return path.join(documentsDir, 'cloudNote')
}

// 获取 config.json 文件内容
const getConfigJsonAsync = async (force = false) => {
  if (global.app_config && !force) {
    return global.app_config;
  }
  const configFilePath = path.join(getAppDocumentsDir(), 'config.json');
  let configValue, config;
  // 判断 config.json 文件是否存在
  if (await isFileExistAsync(configFilePath)) {
    configValue = await readFileAsync(configFilePath) || '{}';
  } else {
    const saveDirectory = path.join(getAppDocumentsDir(), 'save')
    // 如果 config.json 文件不存在，则创建默认的 config.json 文件
    const defaultConfigValue = JSON.stringify({
      saveDirectory,
    }, null, 2);
    // 确保目录存在，如果不存在则递归创建
    await fs.mkdir(saveDirectory, {recursive: true});
    await writeFileAsync(configFilePath, defaultConfigValue)
    configValue = defaultConfigValue;
  }
  try {
    config = JSON.parse(configValue) || {};
    return config;
  } catch (error) {
    console.error('JSON.parse(configValue) error', error);
    return {};
  }
}

// 获取应用的保存目录
const getAppSaveDirectoryAsync = async () => {
  const config = await getConfigJsonAsync();
  return config.saveDirectory;
}

const getGroupsConfigAsync = async (force = false) => {
  if (global.app_groupsConfig && !force) {
    return global.app_groupsConfig;
  }
  const saveDirectory = await getAppSaveDirectoryAsync();
  const groupsPath = path.join(saveDirectory, 'groups.json');
  let groupsConfigValue, groupsConfig;
  // 判断 groups.json 文件是否存在
  if (await isFileExistAsync(groupsPath)) {
    groupsConfigValue = await readFileAsync(groupsPath) || '{}';
  } else {
    // 如果 groups.json 文件不存在，则创建默认的 groups.json 文件
    const now = Date.now();
    const defaultGroupsValue = JSON.stringify({
      groups: [
        {
          key: 'default',
          name: '默认分组',
          createTime: now,
          updateTime: now,
          children: [],
        }
      ],
    }, null, 2);
    await writeFileAsync(groupsPath, defaultGroupsValue)
    groupsConfigValue = defaultGroupsValue;
  }
  try {
    groupsConfig = JSON.parse(groupsConfigValue) || {};
    return groupsConfig;
  } catch (error) {
    console.error('JSON.parse(groupsConfigValue) error', error);
    return {};
  }
}

const groupsToMapAsync = async () => {
  const groupsConfig = await getGroupsConfigAsync() || {};
  return groupsConfig.groups?.reduce((obj, item) => {
    obj[item.key] = {
      ...item,
      type: 'group',
      parent: null,
    };
    if (Array.isArray(item.children)) {
      item.children.forEach((it) => {
        it.parent = item.key;
        it.type = 'file';
        obj[it.key] = it;
      })
    }
    return obj;
  }, {}) || {};
}


module.exports = {
  showMainWindow,
  hideMainWindow,
  readFileAsync,
  writeFileAsync,
  isFileExistAsync,
  getAppDocumentsDir,
  getConfigJsonAsync,
  getAppSaveDirectoryAsync,
  getGroupsConfigAsync,
  groupsToMapAsync,
};