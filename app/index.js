const path = require('path');
const {
  app,
  BrowserWindow,
  globalShortcut,
  Tray,
  Menu,
  MenuItem,
  nativeTheme,
} = require('electron');
const {
  nativeImage,
} = require('electron/common');
const {
  showMainWindow,
} = require(path.join(__dirname, './utils/tools.js'));
require(path.join(__dirname, './ipcMainHandlers/index.js'));

// 主要用于处理 Windows 平台上 Electron 应用的安装、更新和卸载过程中的一些特殊事件，确保这些过程能顺畅进行。
if (require('electron-squirrel-startup')) {
  app.quit();
}

const isDev = process.env.IS_DEV === 'true';

// 创建主窗口
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // 完全隐藏标题栏和边框
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // 禁用Node.js集成更安全
      nodeIntegration: false,
      // 启用上下文隔离
      contextIsolation: true,
    }
  });
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist', 'index.html'));
  }

  const DEFAULT_KEY_BINDING = 'Alt+Space';

  // 注销快捷键
  // globalShortcut.unregister(DEFAULT_KEY_BINDING)

  // 监听快捷键
  globalShortcut.register(DEFAULT_KEY_BINDING, () => {
    // 显示主窗口
    showMainWindow(mainWindow)
  })
  // 创建系统底部托盘菜单
  createSystemMenu(mainWindow);
}

// 创建系统底部托盘菜单
const createSystemMenu = (win) => {
  const icon = nativeImage.createFromPath(path.join(__dirname, '../src/assets/icon.png'))
  const iconWhite = nativeImage.createFromPath(path.join(__dirname, '../src/assets/icon-white.png'))

  let tray = null;
  // 检查当前系统是否使用深色主题
  if (nativeTheme.shouldUseDarkColors) {
    tray = new Tray(icon);
  } else {
    tray = new Tray(iconWhite);
  }
  const menu = new Menu()
  menu.append(new MenuItem({
    label: '显示',
    click: () => {
      showMainWindow(win)
    }
  }))
  menu.append(new MenuItem({label: '设置'}))
  menu.append(new MenuItem({label: '退出', role: 'quit'}))
  Menu.setApplicationMenu(menu)
  tray.setContextMenu(menu)
}


app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

});
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});