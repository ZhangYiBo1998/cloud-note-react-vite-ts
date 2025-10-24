const path = require('path');
const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  globalShortcut,
  Tray,
  Menu,
  MenuItem,
  nativeTheme,
} = require('electron');
const {nativeImage} = require('electron/common')

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

// 最小化到托盘
ipcMain.on('window-hide', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  hideMainWindow(win);
})

// 处理窗口控制操作的IPC监听器
ipcMain.on('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win.minimize()
})
ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win.close()
})