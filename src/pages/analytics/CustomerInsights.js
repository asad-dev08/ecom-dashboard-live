import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Table, Statistic, Spin } from 'antd';
import { UserOutlined, ShoppingOutlined, DollarOutlined } from '@ant-design/icons';
import { Bar } from '@ant-design/plots';
import { api } from '../../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;

const CustomerInsights = () => {
  const [loading, setLoading] = useState(true);
  const [customerStats, setCustomerStats] = useState({
    totalCustomers: 0,
    avgOrderValue: 0,
    customerLifetimeValue: 0,
    segments: [],
    retention: []
  });

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const { customers, orders } = await api.getCustomerAnalytics();

      // Calculate customer metrics
      const totalCustomers = customers.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const avgOrderValue = totalRevenue / orders.length;
      const customerLifetimeValue = totalRevenue / totalCustomers;

      // Calculate segments
      const segments = customers.reduce((acc, customer) => {
        customer.segments.forEach(segment => {
          const existingSegment = acc.find(s => s.segment === segment);
          if (existingSegment) {
            existingSegment.count++;
            existingSegment.revenue += customer.total_spent;
          } else {
            acc.push({
              segment,
              count: 1,
              revenue: customer.total_spent,
              avgOrderValue: customer.total_spent / customer.total_orders
            });
          }
        });
        return acc;
      }, []);

      setCustomerStats({
        totalCustomers,
        avgOrderValue,
        customerLifetimeValue,
        segments,
        retention: calculateRetention(customers, orders)
      });
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRetention = (customers, orders) => {
    // Group orders by month and calculate retention
    const monthlyOrders = orders.reduce((acc, order) => {
      const month = dayjs(order.created_at).format('MMM');
      acc[month] = (acc[month] || new Set()).add(order.user_id);
      return acc;
    }, {});

    return Object.entries(monthlyOrders).map(([month, customers]) => ({
      month,
      retention: (customers.size / customers.totalCustomers) * 100
    }));
  };

  const columns = [
    {
      title: 'Segment',
      dataIndex: 'segment',
      key: 'segment',
    },
    {
      title: 'Customers',
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => a.count - b.count,
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value) => `$${value.toLocaleString()}`,
      sorter: (a, b) => a.revenue - b.revenue,
    },
    {
      title: 'Avg Order Value',
      dataIndex: 'avgOrderValue',
      key: 'avgOrderValue',
      render: (value) => `$${value.toLocaleString()}`,
      sorter: (a, b) => a.avgOrderValue - b.avgOrderValue,
    },
  ];

  const retentionData = [
    { month: 'Jan', retention: 85 },
    { month: 'Feb', retention: 82 },
    { month: 'Mar', retention: 78 },
    { month: 'Apr', retention: 80 },
    { month: 'May', retention: 85 },
  ];

  const config = {
    data: retentionData,
    xField: 'month',
    yField: 'retention',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      retention: {
        alias: 'Retention Rate (%)',
      },
    },
  };

  return (
    <div className="p-6">
      <Title level={2}>Customer Insights</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Total Customers"
              value={customerStats && customerStats.totalCustomers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Average Order Value"
              value={customerStats.avgOrderValue.toLocaleString()}
              className='break-all'
              precision={2}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Customer Lifetime Value"
              value={customerStats.customerLifetimeValue.toLocaleString()}
              precision={2}
              className='break-all'
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} md={24} lg={12}>
          <Card title="Customer Segments">
            <Table 
              columns={columns} 
              dataSource={customerStats.segments}
              rowKey="segment"
              pagination={false}
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={24} lg={12}>
          <Card title="Customer Retention">
            <Bar {...config} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerInsights; 