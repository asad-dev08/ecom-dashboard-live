import React, { useState, useEffect } from 'react';
import { Layout, Drawer, Button, theme, Space, Dropdown, Avatar, Typography, Popover, Slider } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  FontSizeOutlined,
  UserOutlined,
  LogoutOutlined,
  KeyOutlined,
  SettingOutlined,
  ShopOutlined
} from '@ant-design/icons';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SettingsDrawer from '../settings/SettingsDrawer';

const { Header, Content, Sider, Footer } = Layout;
const { Text } = Typography;

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontScale, setFontScale] = useState(100);
  const [settingsVisible, setSettingsVisible] = useState(false);
  
  const { token } = theme.useToken();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setDrawerVisible(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Update document root font size
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}%`;
    // This will affect rem units throughout the app
  }, [fontScale]);

  // Font size control content
  const fontSizeContent = (
    <div style={{ width: '280px', padding: '10px' }}>
      <Text strong>Font Size</Text>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
        <Slider
          min={50}
          max={200}
          step={10}
          value={fontScale}
          onChange={(value) => setFontScale(value)}
          style={{ flex: 1 }}
          marks={{
            50: '50%',
            100: '100%',
            150: '150%',
            200: '200%'
          }}
        />
      </div>
      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          size="small" 
          onClick={() => setFontScale(100)}
        >
          Reset
        </Button>
        <Text type="secondary">{fontScale}%</Text>
      </div>
    </div>
  );

  // User menu items
  const userMenuItems = {
    items: [
      {
        key: 'profile',
        label: 'Profile',
        icon: <UserOutlined />,
        onClick: () => navigate('/settings/profile')
      },
      {
        key: 'changePassword',
        label: 'Change Password',
        icon: <KeyOutlined />,
        onClick: () => navigate('/settings/change-password')
      },
      {
        key: 'settings',
        label: 'Settings',
        icon: <SettingOutlined />,
        onClick: () => setSettingsVisible(true)
      },
      {
        type: 'divider'
      },
      {
        key: 'logout',
        label: 'Logout',
        icon: <LogoutOutlined />,
        onClick: logout
      }
    ],
    style: {
      boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
      padding: '4px',
      border: '1px solid #f0f0f0',
      borderRadius: '8px',
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar for desktop */}
      {!mobileView && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          theme="light"
          width={280}
          style={{
            position: 'fixed',
            height: '100vh',
            left: 0,
            top: 0,
            boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
            borderRight: `1px solid ${token.colorBorder}`,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              display: 'none'
            },
            scrollbarWidth: 'none',  /* Firefox */
            msOverflowStyle: 'none'  /* IE and Edge */
          }}
        >
          <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
            <Space>
              <ShopOutlined className="text-2xl text-primary" />
              {!collapsed && (
                <Text strong className="text-lg">
                  Admin Store
                </Text>
              )}
            </Space>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <Sidebar />
          </div>
        </Sider>
      )}

      {/* Drawer for mobile */}
      <Drawer
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
        bodyStyle={{ padding: 0 }}
      >
        <Sidebar />
      </Drawer>

      <Layout style={{ 
        marginLeft: !mobileView ? (collapsed ? '80px' : '280px') : 0,
        transition: 'margin-left 0.2s',
      }}>
        <Header style={{ 
          padding: '0 16px',
          background: token.colorBgContainer,
          boxShadow: '0 2px 8px 0 rgba(29,35,41,.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 999,
          width: '100%',
        }}>
          <Space>
            {mobileView ? (
              <Button 
                type="text"
                icon={drawerVisible ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setDrawerVisible(!drawerVisible)}
              />
            ) : (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
              />
            )}
          </Space>

          <Space size={16}>
            <Popover 
              content={fontSizeContent}
              title={null}
              trigger="click"
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<FontSizeOutlined />}
              />
            </Popover>
            <Button
              type="text"
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={toggleFullscreen}
            />
            <Dropdown 
              menu={userMenuItems}
              trigger={['click']}
              placement="bottomRight"
              style={{ height: '40px', padding: '0 16px' }}
            >
              <Space className="cursor-pointer border px-3 py-4 rounded-lg transition-colors" style={{ height: '40px' }}>
                <Avatar src={user?.avatar} icon={<UserOutlined />} />
                <Text>{user?.full_name}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ 
          margin: '24px 16px',
          // padding: 24,
          background: token.colorBgContainer,
          borderRadius: token.borderRadius,
          minHeight: 280,
        }}>
          {children}
        </Content>

        <Footer className="text-center border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Space>
              <ShopOutlined className="text-xl text-primary" />
              <Text strong>Admin Store</Text>
            </Space>
            <Text type="secondary">
              © {new Date().getFullYear()} | Asadullah Sarker's Admin Store. All rights reserved.
            </Text>
          </div>
        </Footer>
      </Layout>

      <SettingsDrawer 
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </Layout>
  );
};

export default DashboardLayout;
