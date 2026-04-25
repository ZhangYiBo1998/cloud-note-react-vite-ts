/** Ant Design 主题令牌 — 亮色/暗色模式配置，由 App.tsx 中 ConfigProvider 消费 */
import type { ThemeConfig } from 'antd';

// 亮色主题 — Apple 风格中性色板
export const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#0071e3',
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f5f7',
    colorTextBase: '#1d1d1f',
    colorTextSecondary: '#6e6e73',
    colorBorder: '#d2d2d7',
    borderRadius: 8,
    fontFamily: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif`,
    fontSize: 14,
    controlHeight: 36,
    colorBgElevated: '#ffffff',
  },
  components: {
    Menu: {
      itemBg: 'transparent',
      itemBorderRadius: 6,
      itemColor: '#1d1d1f',
      itemHoverBg: 'rgba(0,0,0,0.04)',
      itemSelectedBg: 'rgba(0,113,227,0.1)',
      itemSelectedColor: '#0071e3',
    },
    Button: {
      controlHeight: 32,
    },
    Card: {
      paddingLG: 20,
    },
  },
};

// 暗色主题 — Apple 风格暗色色板
export const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#4da6ff',
    colorBgBase: '#1c1c1e',
    colorBgContainer: '#2c2c2e',
    colorBgLayout: '#1c1c1e',
    colorTextBase: '#f5f5f7',
    colorTextSecondary: '#98989d',
    colorBorder: '#3a3a3c',
    borderRadius: 8,
    fontFamily: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif`,
    fontSize: 14,
    controlHeight: 36,
    colorBgElevated: '#2c2c2e',
  },
  components: {
    Menu: {
      itemBg: 'transparent',
      itemBorderRadius: 6,
      itemColor: '#f5f5f7',
      itemHoverBg: 'rgba(255,255,255,0.08)',
      itemSelectedBg: 'rgba(77,166,255,0.15)',
      itemSelectedColor: '#4da6ff',
    },
    Button: {
      controlHeight: 32,
    },
    Card: {
      paddingLG: 20,
    },
  },
};
