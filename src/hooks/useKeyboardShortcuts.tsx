/** 全局键盘快捷键 Hook — 注册 mod+key 组合键，焦点在输入框内时自动跳过 */
import { useEffect } from 'react';

interface ShortcutMap {
  [key: string]: () => void;
}

/**
 * 全局键盘快捷键 Hook
 *
 * 注册 mod+key（Ctrl/Cmd）组合快捷键，焦点在输入框内时自动跳过。
 * 用法: useKeyboardShortcuts({ 'mod+n': () => openModal(), 'mod+s': () => save() })
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    /** 全局键盘事件处理器 */
    const handler = (e: KeyboardEvent) => {
      // 焦点在输入元素内时不触发快捷键
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      const key = e.key.toLowerCase();
      if (e.ctrlKey || e.metaKey) {
        const combo = `mod+${key}`;
        if (shortcuts[combo]) {
          e.preventDefault();
          shortcuts[combo]();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
