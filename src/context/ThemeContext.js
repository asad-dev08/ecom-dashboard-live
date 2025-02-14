import React, { createContext, useContext, useState, useEffect } from 'react';
import { theme as antTheme } from 'antd';

const { defaultAlgorithm, darkAlgorithm } = antTheme;

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    primaryColor: '#1890ff',
    borderRadius: 6,
    algorithm: defaultAlgorithm,
  });
  const [fontSize, setFontSize] = useState(14);
  const [colorMode, setColorMode] = useState('light');
  const [navigationStyle, setNavigationStyle] = useState('sidebar');
  const [borderRadius, setBorderRadius] = useState(6);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setTheme(settings.theme);
      setFontSize(settings.fontSize);
      setColorMode(settings.colorMode);
      setNavigationStyle(settings.navigationStyle);
      setBorderRadius(settings.borderRadius);
    }
  }, []);

  useEffect(() => {
    // Apply dark mode
    if (colorMode === 'dark') {
      document.documentElement.classList.add('dark');
      setTheme(prev => ({
        ...prev,
        algorithm: darkAlgorithm,
      }));
    } else if (colorMode === 'light') {
      document.documentElement.classList.remove('dark');
      setTheme(prev => ({
        ...prev,
        algorithm: defaultAlgorithm,
      }));
    } else if (colorMode === 'system') {
      // Check system preference
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', isDarkMode);
      setTheme(prev => ({
        ...prev,
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
      }));
    }
  }, [colorMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      if (colorMode === 'system') {
        document.documentElement.classList.toggle('dark', e.matches);
        setTheme(prev => ({
          ...prev,
          algorithm: e.matches ? darkAlgorithm : defaultAlgorithm,
        }));
      }
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [colorMode]);

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    saveSettings({
      theme: newTheme,
      fontSize,
      colorMode,
      navigationStyle,
      borderRadius,
    });
  };

  const saveSettings = (settings) => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  };

  useEffect(() => {
    // Apply theme settings to document
    document.documentElement.style.fontSize = `${fontSize}px`;
    document.documentElement.setAttribute('data-theme', colorMode);
    
    // Apply CSS variables
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
    document.documentElement.style.setProperty('--border-radius', `${borderRadius}px`);
  }, [theme, fontSize, colorMode, borderRadius]);

  const value = {
    theme,
    updateTheme,
    fontSize,
    setFontSize,
    colorMode,
    setColorMode,
    navigationStyle,
    setNavigationStyle,
    borderRadius,
    setBorderRadius,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 