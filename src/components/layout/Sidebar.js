import React, { useState } from 'react';
import { Menu } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  DollarOutlined,
  LineChartOutlined,
  PieChartOutlined,
  StockOutlined,
  GiftOutlined,
  TagOutlined,
  NotificationOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const getLevelKeys = (items) => {
  const key = {};
  const func = (items, level = 1) => {
    items.forEach((item) => {
      if (item.key) {
        key[item.key] = level;
      }
      if (item.children) {
        func(item.children, level + 1);
      }
    });
  };
  func(items);
  return key;
};

const Sidebar = ({ collapsed }) => {
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState([]);

  // Get the current selected key based on the path
  const getSelectedKey = (pathname) => {
    const paths = pathname.split('/').filter(Boolean);
    
    if (paths[0] === 'analytics') {
      return `${paths[0]}-${paths[1]}`; // For analytics routes: 'analytics-sales', 'analytics-revenue', etc.
    } else if (paths[0] === 'products') {
      return paths.length > 1 ? 'add-product' : 'product-list'; // For products routes
    } else if (paths[0] === 'marketing') {
      return `${paths[0]}-${paths[1]}`; // For marketing routes: 'marketing-discounts', 'marketing-campaigns', etc.
    }
    return paths[0]; // For other routes: 'dashboard', 'orders', 'customers'
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: 'products',
      icon: <ShoppingOutlined />,
      label: 'Products',
      children: [
        {
          key: 'product-list',
          label: <Link to="/products">Product List</Link>,
        },
        {
          key: 'add-product',
          label: <Link to="/products/new">Add Product</Link>,
        },
      ],
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/orders">Orders</Link>,
    },
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: <Link to="/customers">Customers</Link>,
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
      children: [
        {
          key: 'analytics-sales',
          icon: <LineChartOutlined />,
          label: <Link to="/analytics/sales">Sales Analytics</Link>,
        },
        {
          key: 'analytics-revenue',
          icon: <DollarOutlined />,
          label: <Link to="/analytics/revenue">Revenue Metrics</Link>,
        },
        {
          key: 'analytics-products',
          icon: <PieChartOutlined />,
          label: <Link to="/analytics/products">Product Performance</Link>,
        },
        {
          key: 'analytics-customers',
          icon: <UserOutlined />,
          label: <Link to="/analytics/customers">Customer Insights</Link>,
        },
        {
          key: 'analytics-inventory',
          icon: <StockOutlined />,
          label: <Link to="/analytics/inventory">Inventory Reports</Link>,
        },
      ],
    },
    {
      key: 'marketing',
      icon: <GiftOutlined />,
      label: 'Marketing',
      children: [
        {
          key: 'marketing-discounts',
          icon: <TagOutlined />,
          label: <Link to="/marketing/discounts">Discounts</Link>,
        },
        {
          key: 'marketing-campaigns',
          icon: <NotificationOutlined />,
          label: <Link to="/marketing/campaigns">Campaigns</Link>,
        },
        {
          key: 'marketing-coupons',
          icon: <GiftOutlined />,
          label: <Link to="/marketing/coupons">Coupons</Link>,
        },
        {
          key: 'marketing-email',
          icon: <MailOutlined />,
          label: <Link to="/marketing/email">Email Marketing</Link>,
        },
      ],
    },
  ];

  // Update openKeys when location changes
  React.useEffect(() => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths[0] === 'analytics' || paths[0] === 'products' || paths[0] === 'marketing') {
      setOpenKeys([paths[0]]);
    }
  }, [location.pathname]);

  const levelKeys = getLevelKeys(menuItems);

  const onOpenChange = (keys) => {
    const currentOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    
    if (currentOpenKey !== undefined) {
      const repeatIndex = keys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);

      setOpenKeys(
        keys
          .filter((_, index) => index !== repeatIndex)
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey])
      );
    } else {
      setOpenKeys(keys);
    }
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={[getSelectedKey(location.pathname)]}
      openKeys={openKeys}
      onOpenChange={onOpenChange}
      items={menuItems}
      style={{
        height: 'calc(100vh - 64px)',
        borderRight: 0,
        overflow: 'auto',
      }}
    />
  );
};

export default Sidebar; 