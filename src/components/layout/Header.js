import React from 'react';
import { Layout, Button, Space, Avatar, Dropdown, Menu } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LockOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;

const AppHeader = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();

  const menu = (
    <Menu
      items={[
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: 'Profile',
          onClick: () => navigate('/settings/profile'),
        },
        {
          key: 'change-password',
          icon: <LockOutlined />,
          label: 'Change Password',
          onClick: () => navigate('/settings/change-password'),
        },
        {
          type: 'divider',
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Logout',
          onClick: () => {
            // Add logout logic here
            message.success('Logged out successfully');
            navigate('/login');
          },
        },
      ]}
    />
  );

  return (
    <Header className="bg-white px-4 flex justify-between items-center">
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
      />
      <Space>
        <Dropdown overlay={menu} placement="bottomRight">
          <Avatar 
            icon={<UserOutlined />} 
            className="cursor-pointer"
          />
        </Dropdown>
      </Space>
    </Header>
  );
};

export default AppHeader; 