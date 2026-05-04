/**
 * 全局快捷键管理模块
 *
 * 独立模块避免 main.ts ↔ config.ts 循环依赖。
 * main.ts 调用 setAppMainWindow 注入窗口引用，
 * config.ts UPDATE_CONFIG handler 可调用 registerAppShortcut 动态重新注册。
 */
import { globalShortcut, BrowserWindow } from 'electron';
import { showMainWindow, hideMainWindow } from './utils/tools';

let _mainWindow: BrowserWindow | null = null;
let _currentAppShortcut = 'Alt+Space';

/** 注入主窗口引用（由 main.ts createWindow 后调用） */
export function setAppMainWindow(win: BrowserWindow | null): void {
  _mainWindow = win;
}

function toggleWindow(): void {
  if (!_mainWindow) return;
  if (_mainWindow.isVisible()) {
    if (_mainWindow.isFocused()) {
      hideMainWindow(_mainWindow);
    } else {
      _mainWindow.focus();
    }
  } else {
    showMainWindow(_mainWindow);
  }
}

/** 注册全局应用显示/隐藏快捷键 */
export function registerAppShortcut(shortcut: string): void {
  if (_currentAppShortcut) {
    globalShortcut.unregister(_currentAppShortcut);
  }

  _currentAppShortcut = shortcut || 'Alt+Space';
  globalShortcut.register(_currentAppShortcut, toggleWindow);
}

/** 注销当前快捷键 */
export function unregisterAppShortcut(): void {
  if (_currentAppShortcut) {
    globalShortcut.unregister(_currentAppShortcut);
    _currentAppShortcut = '';
  }
}

/** 获取当前注册的快捷键字符串 */
export function getCurrentAppShortcut(): string {
  return _currentAppShortcut;
}
