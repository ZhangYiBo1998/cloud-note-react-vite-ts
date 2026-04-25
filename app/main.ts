/**
 * Electron 主进程入口
 *
 * 职责：窗口生命周期管理、系统托盘、全局快捷键、IPC handler 注册、
 * 配置/笔记数据初始化、退出时自动 Git 同步。
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  globalShortcut,
  Tray,
  Menu,
  MenuItem,
  nativeTheme,
  nativeImage,
} from 'electron';
import {
  showMainWindow,
  hideMainWindow,
  getConfigJsonAsync,
  getGroupsConfigAsync,
  groupsToMapAsync,
} from './utils/tools';
import { pushToGitHubAsync } from './upload/github';
import { registerAllHandlers } from './ipc-handlers/index';
import { startBackupScheduler, stopBackupScheduler } from './backup/backup';

// Windows 安装程序 squirrel 启动事件处理
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
if (require('electron-squirrel-startup')) {
  app.quit();
}

const isDev = process.env.IS_DEV === 'true';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

/** 解析资源路径：开发模式指向 src/，打包模式指向 resources/ */
function resolveAsset(relativePath: string): string {
  if (isDev) {
    // 开发模式：__dirname = dist/main/，回退到项目根目录
    return path.join(__dirname, '..', '..', relativePath);
  }
  // 打包模式：资源在 resources/ 目录下
  return path.join(process.resourcesPath, relativePath);
}

/**
 * 创建主窗口
 * - 无框窗口（自定义标题栏）
 * - preload 脚本注入，contextIsolation 开启，nodeIntegration 关闭
 * - 注册 Alt+Space 全局快捷键切换显示/隐藏
 * - 开发模式加载 Vite dev server，否则加载打包后的 renderer
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  createSystemMenu();

  // Alt+Space 切换窗口可见性
  const DEFAULT_KEY_BINDING = 'Alt+Space';
  globalShortcut.register(DEFAULT_KEY_BINDING, () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      hideMainWindow(mainWindow);
    } else {
      showMainWindow(mainWindow);
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  }

  // 开机自启时以隐藏模式启动
  const shouldHideWindow = process.argv.includes('--hidden');
  if (shouldHideWindow) {
    hideMainWindow(mainWindow);
  }
}

/**
 * 创建系统托盘和右键菜单
 * - 托盘图标根据系统主题自动切换亮/暗色版本
 * - 菜单项：显示、设置、退出（全部功能完整）
 * - 双击托盘图标切换窗口可见性
 */
function createSystemMenu(): void {
  const iconPath = resolveAsset('src/assets/logo.png');
  const iconWhitePath = resolveAsset('src/assets/logo-white.png');

  const trayIcon = nativeImage.createFromPath(
    nativeTheme.shouldUseDarkColors ? iconWhitePath : iconPath
  ).resize({ width: 16, height: 16 });

  tray = new Tray(trayIcon);
  tray.setToolTip('Cloud Note');

  const menu = new Menu();

  menu.append(new MenuItem({
    label: '显示',
    click: () => {
      if (mainWindow) showMainWindow(mainWindow);
    },
  }));

  menu.append(new MenuItem({
    label: '设置',
    click: () => {
      if (mainWindow) {
        showMainWindow(mainWindow);
        // 通知渲染进程导航到设置页
        mainWindow.webContents.send('navigate-to', '/setting');
      }
    },
  }));

  menu.append(new MenuItem({ label: '退出', role: 'quit' }));

  tray.setContextMenu(menu);

  tray.on('double-click', () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      hideMainWindow(mainWindow);
    } else {
      showMainWindow(mainWindow);
    }
  });
}

/**
 * 初始化全局缓存：加载配置文件和笔记分组数据到 global 对象
 * 后续所有 handler 通过 global.app_* 读取，避免反复读写磁盘
 * 若配置了备份目录和间隔，自动启动备份调度器
 */
async function initAsync(): Promise<void> {
  global.app_config = await getConfigJsonAsync();
  global.app_groupsConfig = await getGroupsConfigAsync() || { groups: [] };
  global.app_groupsConfigMap = await groupsToMapAsync();

  // 根据配置启动备份调度器
  const config = global.app_config;
  if (config.backupIntervalMinutes && config.backupIntervalMinutes > 0 && config.backupDirectory) {
    startBackupScheduler(config.backupIntervalMinutes);
  }
}

// ---- 单实例锁：重复打开应用时聚焦已有窗口 ----
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      showMainWindow(mainWindow);
    }
  });
}

// ---- 应用生命周期 ----

app.whenReady().then(async () => {
  // 先注册所有 IPC handler，再初始化数据，最后创建窗口
  registerAllHandlers();
  await initAsync();
  createWindow();

  // macOS dock 点击重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 退出前停止备份调度，尝试推送到 GitHub
app.on('will-quit', async () => {
  globalShortcut.unregisterAll();
  stopBackupScheduler();
  try {
    await pushToGitHubAsync();
  } catch (err) {
    console.error('退出时同步失败:', err);
  }
});
