import React from 'react';
import { ConfigProvider, theme } from 'antd';
import { useTheme } from '../context/ThemeContext';

const { defaultAlgorithm, darkAlgorithm } = theme;

const ThemeConfigProvider = ({ children }) => {
  const { theme } = useTheme();

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: 'IBM Plex Sans',
          colorPrimary: theme.primaryColor,
          borderRadius: theme.borderRadius,
        },
        algorithm: theme.algorithm || defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default ThemeConfigProvider; 