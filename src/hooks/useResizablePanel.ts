/**
 * 可拖拽调整宽度 / 折叠面板 Hook
 *
 * 提供侧边栏宽度拖拽（180-500px）、折叠/展开切换，
 * 宽度持久化到 localStorage，刷新保持。
 */
import { useState, useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'sidebar-width';
const DEFAULT_WIDTH = 240;
const MIN_WIDTH = 180;
const MAX_WIDTH = 500;

interface UseResizablePanelReturn {
  width: number;
  collapsed: boolean;
  isResizing: boolean;
  toggleCollapse: () => void;
  onDragStart: (e: React.MouseEvent) => void;
}

export function useResizablePanel(): UseResizablePanelReturn {
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Number(saved) : DEFAULT_WIDTH;
  });
  const [collapsed, setCollapsed] = useState(() => width < 100);
  const [isResizing, setIsResizing] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number }>({ startX: 0, startWidth: 0 });

  /** 宽度持久化到 localStorage */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(width));
  }, [width]);

  /** 拖拽过程中监听全局 mousemove/mouseup */
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - dragRef.current.startX;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragRef.current.startWidth + delta));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  /** 开始拖拽 */
  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startWidth: width };
    setIsResizing(true);
  }, [width]);

  /** 折叠/展开切换 */
  const toggleCollapse = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  return { width, collapsed, isResizing, toggleCollapse, onDragStart };
}
