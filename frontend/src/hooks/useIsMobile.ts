import { Grid } from 'antd';

/** True when viewport is below Ant Design's `md` breakpoint (768px). */
export const useIsMobile = (): boolean => {
  const screens = Grid.useBreakpoint();
  return !screens.md;
};
