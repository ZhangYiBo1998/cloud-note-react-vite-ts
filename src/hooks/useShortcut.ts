/**
 * 可配置快捷键 Hook
 *
 * 支持解析 "Ctrl+Shift+K", "Alt+Space", "Ctrl+K" 等格式的快捷键字符串。
 * 焦点在 INPUT/TEXTAREA/SELECT 时自动跳过。
 */
import { useEffect } from 'react';

/**
 * 注册一个可配置的键盘快捷键
 * @param shortcut - 快捷键字符串，如 "Ctrl+Shift+K", "Alt+Space"
 * @param callback - 快捷键触发时的回调
 */
export function useShortcut(shortcut: string | undefined, callback: () => void) {
  useEffect(() => {
    if (!shortcut) return;

    const parts = shortcut.toLowerCase().split('+');
    const key = parts.pop()!;

    const ctrlRequired = parts.includes('ctrl');
    const altRequired = parts.includes('alt');
    const shiftRequired = parts.includes('shift');

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      const ctrlMatches = ctrlRequired === (e.ctrlKey || e.metaKey);
      const altMatches = altRequired === e.altKey;
      const shiftMatches = shiftRequired === e.shiftKey;
      const keyMatches = e.key.toLowerCase() === key;

      if (ctrlMatches && altMatches && shiftMatches && keyMatches) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcut, callback]);
}
