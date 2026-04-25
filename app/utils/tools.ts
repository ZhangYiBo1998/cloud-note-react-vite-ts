/**
 * 文件/配置工具模块
 *
 * 提供主进程核心工具函数：窗口控制、文件读写、配置/groups 管理。
 * 所有配置和笔记元数据缓存在 global.app_* 对象中，
 * 首次加载后通过 force 参数控制是否重新读取磁盘。
 */

import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';

// ============================== 类型定义 ==============================

/** 应用配置（对应 config.json） */
export interface AppConfig {
  saveDirectory?: string;
  closeType?: 'hide' | 'quit';
  theme?: 'light' | 'dark';
  backupDirectory?: string;
  backupIntervalMinutes?: number;
}

/** 单个笔记条目 */
export interface NoteItem {
  key: string;
  name: string;
  createTime: number;
  updateTime: number;
  tags: string[];
  parent?: string;
  type?: 'file';
}

/** 分组条目（含子笔记列表） */
export interface GroupItem {
  key: string;
  name: string;
  createTime: number;
  updateTime: number;
  children: NoteItem[];
  parent?: null;
  type?: 'group';
}

/** groups.json 顶层结构 */
export interface GroupsConfig {
  groups: GroupItem[];
}

/** 扁平化分组映射条目 —— key 为 groupKey 或 noteKey，O(1) 查找 */
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

// ============================== 全局类型扩展 ==============================

declare global {
  var app_config: AppConfig | undefined;
  var app_groupsConfig: GroupsConfig | undefined;
  var app_groupsConfigMap: GroupsMap | undefined;
}

// ============================== 窗口控制 ==============================

/** 显示窗口并聚焦 */
export function showMainWindow(win: Electron.BrowserWindow): void {
  win.show();
  win.setSkipTaskbar(false);
  win.focus();
}

/** 隐藏窗口（托盘模式） */
export function hideMainWindow(win: Electron.BrowserWindow): void {
  win.hide();
  win.setSkipTaskbar(true);
}

// ============================== 文件操作 ==============================

/** 异步读取文件，返回 UTF-8 字符串，失败返回 null */
export async function readFileAsync(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, { encoding: 'utf-8' });
  } catch (err) {
    console.error('读取文件出错:', err);
    return null;
  }
}

/** 异步写入文件，自动创建父目录 */
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

/** 检查文件是否存在 */
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

// ============================== 路径工具 ==============================

/** 获取应用文档目录（<userDocuments>/cloudNote） */
export function getAppDocumentsDir(): string {
  const documentsDir = app.getPath('documents');
  return path.join(documentsDir, 'cloudNote');
}

// ============================== 配置管理 ==============================

/**
 * 读取 config.json
 * 优先返回 global.app_config 缓存，force=true 时强制从磁盘重新读取
 * 配置文件不存在时自动创建，返回值始终与 defaultConfig 合并确保字段完整
 */
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

/** 获取当前存档目录路径 */
export async function getAppSaveDirectoryAsync(): Promise<string> {
  const config = await getConfigJsonAsync();
  return config.saveDirectory || '';
}

// ============================== 笔记分组管理 ==============================

/**
 * 读取 groups.json
 * 优先返回 global.app_groupsConfig 缓存，force=true 时强制重新读取
 * 文件不存在时自动创建默认分组
 */
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

/**
 * 更新 groups.json
 * 与现有配置合并后写入磁盘，同步刷新 global 缓存和 groupsMap
 */
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

/**
 * 将 groups 数组扁平化为 key → item 映射
 * groups 中每个分组和其子笔记都以 key 为索引，type 区分 group/file
 * parent 字段指向所属分组的 key（file 类型），或 null（group 类型）
 */
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
