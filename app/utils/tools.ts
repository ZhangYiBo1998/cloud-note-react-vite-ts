import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';

export interface AppConfig {
  saveDirectory?: string;
  closeType?: 'hide' | 'quit';
  theme?: 'light' | 'dark';
  backupDirectory?: string;
  backupIntervalMinutes?: number;
}

export interface NoteItem {
  key: string;
  name: string;
  createTime: number;
  updateTime: number;
  tags: string[];
  parent?: string;
  type?: 'file';
}

export interface GroupItem {
  key: string;
  name: string;
  createTime: number;
  updateTime: number;
  children: NoteItem[];
  parent?: null;
  type?: 'group';
}

export interface GroupsConfig {
  groups: GroupItem[];
}

export interface GroupsMapItem {
  key: string;
  name: string;
  createTime: number;
  updateTime: number;
  tags?: string[];
  children?: NoteItem[];
  parent: string | null;
  type: 'group' | 'file';
}

export interface GroupsMap {
  [key: string]: GroupsMapItem;
}

declare global {
  var app_config: AppConfig | undefined;
  var app_groupsConfig: GroupsConfig | undefined;
  var app_groupsConfigMap: GroupsMap | undefined;
}

// Show main window
export function showMainWindow(win: Electron.BrowserWindow): void {
  win.show();
  win.setSkipTaskbar(false);
  win.focus();
}

// Hide main window
export function hideMainWindow(win: Electron.BrowserWindow): void {
  win.hide();
  win.setSkipTaskbar(true);
}

// Read file asynchronously
export async function readFileAsync(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, { encoding: 'utf-8' });
  } catch (err) {
    console.error('读取文件出错:', err);
    return null;
  }
}

// Write file asynchronously, auto-creating directories
export async function writeFileAsync(filePath: string, fileData: string): Promise<void> {
  try {
    const dirName = path.dirname(filePath);
    await fs.mkdir(dirName, { recursive: true });
    await fs.writeFile(filePath, fileData, { encoding: 'utf-8' });
    console.log('file has been created!');
  } catch (err) {
    console.error('Error creating files:', err);
  }
}

// Check if file exists
export async function isFileExistAsync(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch (error: unknown) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      console.log('文件不存在 (通过 promises.access)');
      return false;
    }
    console.error('访问文件时出错：', error);
    throw error;
  }
}

// Get app documents directory
export function getAppDocumentsDir(): string {
  const documentsDir = app.getPath('documents');
  return path.join(documentsDir, 'cloudNote');
}

// Get config.json content
export async function getConfigJsonAsync(force = false): Promise<AppConfig> {
  if (global.app_config && !force) {
    return global.app_config;
  }
  const configFilePath = path.join(getAppDocumentsDir(), 'config.json');
  let configValue: string | null;
  const defaultConfig: AppConfig = {
    saveDirectory: path.join(getAppDocumentsDir(), 'save'),
    closeType: 'hide',
    theme: 'light',
  };

  if (await isFileExistAsync(configFilePath)) {
    configValue = await readFileAsync(configFilePath) || '{}';
  } else {
    await fs.mkdir(defaultConfig.saveDirectory!, { recursive: true });
    await writeFileAsync(configFilePath, JSON.stringify(defaultConfig, null, 2));
    configValue = JSON.stringify(defaultConfig);
  }
  try {
    const config: AppConfig = { ...defaultConfig, ...JSON.parse(configValue || '{}') };
    return config;
  } catch (error) {
    console.error('JSON.parse(configValue) error', error);
    return { ...defaultConfig };
  }
}

// Get app save directory
export async function getAppSaveDirectoryAsync(): Promise<string> {
  const config = await getConfigJsonAsync();
  return config.saveDirectory || '';
}

// Get groups config
export async function getGroupsConfigAsync(force = false): Promise<GroupsConfig> {
  if (global.app_groupsConfig && !force) {
    return global.app_groupsConfig;
  }
  const saveDirectory = await getAppSaveDirectoryAsync();
  const groupsPath = path.join(saveDirectory, 'groups.json');
  let groupsConfigValue: string | null;
  if (await isFileExistAsync(groupsPath)) {
    groupsConfigValue = await readFileAsync(groupsPath) || '{}';
  } else {
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
    await writeFileAsync(groupsPath, defaultGroupsValue);
    groupsConfigValue = defaultGroupsValue;
  }
  try {
    const groupsConfig: GroupsConfig = JSON.parse(groupsConfigValue || '{}');
    return groupsConfig;
  } catch (error) {
    console.error('JSON.parse(groupsConfigValue) error', error);
    return { groups: [] };
  }
}

// Update groups config
export async function updateGroupsConfigAsync(newGroupsConfig: GroupsConfig): Promise<void> {
  try {
    const groupsConfig = await getGroupsConfigAsync();
    const mergedConfig: GroupsConfig = {
      ...groupsConfig,
      ...(newGroupsConfig || {}),
    };
    global.app_groupsConfig = mergedConfig;
    global.app_groupsConfigMap = await groupsToMapAsync();
    const groupsConfigPath = path.join(await getAppSaveDirectoryAsync(), 'groups.json');
    await writeFileAsync(groupsConfigPath, JSON.stringify(mergedConfig, null, 2));
  } catch (error) {
    throw error;
  }
}

// Convert groups to flat map for O(1) lookup
export async function groupsToMapAsync(): Promise<GroupsMap> {
  const groupsConfig = await getGroupsConfigAsync();
  return groupsConfig.groups?.reduce<GroupsMap>((obj, item) => {
    obj[item.key] = {
      ...item,
      type: 'group',
      parent: null,
    };
    if (Array.isArray(item.children)) {
      item.children.forEach((it) => {
        obj[it.key] = {
          ...it,
          parent: item.key,
          type: 'file',
        };
      });
    }
    return obj;
  }, {}) || {};
}
