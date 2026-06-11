import type { ThemeConfig } from 'antd';

const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#0891B2',
    colorInfo: '#0891B2',
    colorSuccess: '#16A34A',
    colorWarning: '#D97706',
    colorError: '#DC2626',
    colorBgLayout: '#F0F9FF',
    colorBgContainer: '#FFFFFF',
    colorBorder: '#BAE6FD',
    colorText: '#0F172A',
    colorTextSecondary: '#475569',
    borderRadius: 6,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    sizeStep: 4,
    wireframe: false,
  },
  components: {
    Layout: {
      siderBg: '#0C4A6E',
      triggerBg: '#075985',
      triggerColor: '#E0F2FE',
    },
    Menu: {
      darkItemBg: '#0C4A6E',
      darkSubMenuItemBg: '#075985',
      darkItemSelectedBg: '#0891B2',
      darkItemColor: '#BAE6FD',
      darkItemHoverColor: '#FFFFFF',
      darkItemSelectedColor: '#FFFFFF',
    },
    Button: {
      primaryShadow: '0 2px 8px rgba(8,145,178,0.35)',
    },
    Card: {
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    Table: {
      headerBg: '#E0F2FE',
      headerColor: '#0C4A6E',
    },
  },
};

export default themeConfig;
