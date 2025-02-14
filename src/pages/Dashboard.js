import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Spin, Button } from 'antd';
import { Area, Column } from '@ant-design/plots';
import { 
  ShoppingCartOutlined, 
  DollarOutlined, 
  UserOutlined, 
  ShoppingOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { api } from '../services/api';

const { Title } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardStats();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spin size="large" className="flex justify-center items-center min-h-[400px]" />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Title level={4} type="danger">{error}</Title>
          <Button onClick={fetchDashboardData} type="primary" className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Title level={4}>No data available</Title>
      </div>
    );
  }

  const { stats, recentOrders, topProducts, revenueData } = dashboardData;

  // Add default values for missing data
  const safeStats = {
    totalOrders: stats?.totalOrders || 0,
    totalRevenue: stats?.totalRevenue || 0,
    totalCustomers: stats?.totalCustomers || 0,
    totalProducts: stats?.totalProducts || 0,
  };

  const safeRevenueData = revenueData || [];
  const safeRecentOrders = recentOrders || [];
  const safeTopProducts = topProducts || [];

  // Revenue Chart Config
  const revenueChartConfig = {
    data: safeRevenueData,
    xField: 'date',
    yField: 'revenue',
    smooth: true,
    animation: {
      appear: false
    },
    areaStyle: {
      fill: 'l(270) 0:rgba(24,144,255,0.05) 0.5:rgba(24,144,255,0.2) 1:rgba(24,144,255,0.4)',
    },
    line: {
      color: '#1890ff',
    },
    yAxis: {
      label: {
        formatter: (v) => `$${Number(v).toLocaleString()}`,
      },
    },
    tooltip: {
      formatter: (data) => {
        return {
          name: 'Revenue',
          value: `$${Number(data.revenue).toLocaleString()}`,
        };
      },
    },
    padding: [20, 20, 50, 50],
  };

  // Orders Chart Config
  const ordersChartConfig = {
    data: safeRevenueData,
    xField: 'date',
    yField: 'orders',
    animation: {
      appear: false
    },
    columnStyle: {
      radius: [20, 20, 0, 0],
      fill: 'l(270) 0:#1890ff 1:#69c0ff',
    },
    tooltip: {
      formatter: (data) => {
        return {
          name: 'Orders',
          value: data.orders,
        };
      },
    },
    padding: [20, 20, 50, 50],
  };

  // Table Columns
  const orderColumns = [
    {
      title: 'Order Number',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (value) => value || 'N/A',
      // responsive: ['md'],
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      render: (value) => value || 'Unknown Customer',
      responsive: ['sm'],
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (value) => value ? `$${Number(value).toFixed(2)}` : '$0.00',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          !status ? 'bg-gray-100 text-gray-800' :
          status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
          status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
        </span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'N/A',
      responsive: ['lg'],
    },
  ];

  return (
    <div className="space-y-6">
      <Title level={2}>Dashboard</Title>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Orders"
              value={safeStats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Revenue"
              value={safeStats.totalRevenue}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Customers"
              value={safeStats.totalCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Products"
              value={safeStats.totalProducts}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card bordered={false} title="Revenue Overview">
            <Area {...revenueChartConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card bordered={false} title="Orders Trend">
            <Column {...ordersChartConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Tables */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            bordered={false} 
            title="Recent Orders"
            extra={<a href="/orders">View All</a>}
          >
            <Table 
              columns={orderColumns} 
              dataSource={safeRecentOrders}
              pagination={false}
              rowKey="id"
              scroll={{ x: 'max-content' }}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            bordered={false} 
            title="Top Selling Products"
            extra={<a href="/products">View All</a>}
          >
            <Table 
              columns={[
                {
                  title: 'Product',
                  dataIndex: 'name',
                  key: 'name',
                  render: (name) => name || 'Unnamed Product',
                },
                {
                  title: 'Price',
                  dataIndex: 'price',
                  key: 'price',
                  render: (price) => price ? `$${Number(price).toFixed(2)}` : '$0.00',
                  responsive: ['sm'],
                },
                {
                  title: 'Sales',
                  dataIndex: 'sales',
                  key: 'sales',
                  render: (sales) => sales || 0,
                  responsive: ['md'],
                },
                {
                  title: 'Stock',
                  dataIndex: 'stock',
                  key: 'stock',
                  render: (stock) => (
                    <span className={`${
                      !stock ? 'text-gray-500' : 
                      stock < 10 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {stock || 0}
                    </span>
                  ),
                  // responsive: ['lg'],
                },
              ]}
              dataSource={safeTopProducts}
              pagination={false}
              rowKey="id"
              scroll={{ x: 'max-content' }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 