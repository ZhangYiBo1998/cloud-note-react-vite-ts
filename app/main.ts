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

// Handle squirrel startup events for Windows installer
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
if (require('electron-squirrel-startup')) {
  app.quit();
}

const isDev = process.env.IS_DEV === 'true';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// Create the main application window
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

  const shouldHideWindow = process.argv.includes('--hidden');
  if (shouldHideWindow) {
    hideMainWindow(mainWindow);
  }
}

// Create system tray
function createSystemMenu(): void {
  const iconPath = path.join(__dirname, '../src/assets/logo.png');
  const iconWhitePath = path.join(__dirname, '../src/assets/logo-white.png');

  const icon = nativeImage.createFromPath(
    nativeTheme.shouldUseDarkColors ? iconPath : iconWhitePath
  );

  tray = new Tray(icon);
  const menu = new Menu();

  menu.append(new MenuItem({
    label: '显示',
    click: () => {
      if (mainWindow) showMainWindow(mainWindow);
    },
  }));
  menu.append(new MenuItem({ label: '设置' }));
  menu.append(new MenuItem({ label: '退出', role: 'quit' }));

  Menu.setApplicationMenu(menu);
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

// Load config and groups into global cache
async function initAsync(): Promise<void> {
  global.app_config = await getConfigJsonAsync();
  global.app_groupsConfig = await getGroupsConfigAsync() || { groups: [] };
  global.app_groupsConfigMap = await groupsToMapAsync();
}

// App lifecycle
app.whenReady().then(async () => {
  registerAllHandlers();
  await initAsync();
  createWindow();

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

app.on('will-quit', async () => {
  globalShortcut.unregisterAll();
  try {
    await pushToGitHubAsync();
  } catch (err) {
    console.error('退出时同步失败:', err);
  }
});
