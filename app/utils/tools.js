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
    const data = await fs.readFile(filePath, options);
    console.log('文件内容:', data);
    return data;
  } catch (err) {
    console.error('读取文件出错:', err);
    return null;
  }
}

const createFileAsync = async (filePath, fileData, options) => {
  try {
    // 提取文件所在目录
    const dirName = path.dirname(filePath);
    // 确保目录存在，如果不存在则递归创建
    await fs.mkdir(dirName, {recursive: true});

    await fs.writeFile(filePath, fileData, options);
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
const getConfigJsonAsync = async () => {
  const configFilePath = path.join(getAppDocumentsDir(), 'config.json');
  let configValue;
  // 判断 config.json 文件是否存在
  if (await isFileExistAsync(configFilePath)) {
    configValue = await readFileAsync(configFilePath) || '{}';
  } else {
    // 如果 config.json 文件不存在，则创建默认的 config.json 文件
    const defaultConfigValue = JSON.stringify({
      saveDirectory: path.join(getAppDocumentsDir(), 'save'),
    }, null, 2);
    await createFileAsync(configFilePath, defaultConfigValue)
    configValue = defaultConfigValue;
  }
  try {
    return JSON.parse(configValue);
  } catch (error) {
    console.error('JSON.parse(configValue) error', error);
    return {};
  }
}


module.exports = {
  showMainWindow,
  hideMainWindow,
  readFileAsync,
  createFileAsync,
  isFileExistAsync,
  getAppDocumentsDir,
  getConfigJsonAsync,
};