import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'mst-sider-width';
const DEFAULT_WIDTH = 240;
const MIN_WIDTH = 200;
const MAX_WIDTH = 420;
const COLLAPSED_WIDTH = 80;

const loadWidth = (): number => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const parsed = stored ? Number(stored) : DEFAULT_WIDTH;
  if (Number.isNaN(parsed)) return DEFAULT_WIDTH;
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, parsed));
};

export const useResizableSider = (collapsed: boolean) => {
  const [siderWidth, setSiderWidth] = useState(loadWidth);
  const isResizing = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(siderWidth));
  }, [siderWidth]);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    if (collapsed) return;
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing.current) return;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, moveEvent.clientX));
      setSiderWidth(next);
    };

    const onMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [collapsed]);

  return {
    siderWidth: collapsed ? COLLAPSED_WIDTH : siderWidth,
    onResizeStart,
    minWidth: MIN_WIDTH,
    maxWidth: MAX_WIDTH,
  };
};
