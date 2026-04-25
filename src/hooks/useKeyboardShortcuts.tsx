/** 全局键盘快捷键 Hook — 注册 mod+key 组合键，焦点在输入框内时自动跳过 */
import { useEffect } from 'react';

interface ShortcutMap {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
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
