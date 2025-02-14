import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Table, Select, Spin } from 'antd';
import { Pie } from '@ant-design/plots';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { api } from '../../services/api';

const { Title } = Typography;
const { Option } = Select;

const ProductPerformance = () => {
  const [loading, setLoading] = useState(true);
  const [productStats, setProductStats] = useState({
    topProducts: [],
    categoryDistribution: []
  });
  const [timeframe, setTimeframe] = useState(30);

  useEffect(() => {
    fetchProductData();
  }, [timeframe]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const { products, orders, orderItems, categories } = await api.getProductAnalytics();

      // Calculate product performance
      const productPerformance = calculateProductPerformance(products, orderItems, orders);
      const categoryStats = calculateCategoryDistribution(products, categories, orderItems);

      setProductStats({
        topProducts: productPerformance,
        categoryDistribution: categoryStats
      });
    } catch (error) {
      console.error('Error fetching product data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProductPerformance = (products, orderItems, orders) => {
    // Group order items by product and calculate metrics
    const productStats = orderItems.reduce((acc, item) => {
      if (!acc[item.product_id]) {
        acc[item.product_id] = {
          sales: 0,
          revenue: 0,
          previousRevenue: 0
        };
      }
      acc[item.product_id].sales += item.quantity;
      acc[item.product_id].revenue += item.quantity * item.unit_price;
      return acc;
    }, {});

    return products
      .map(product => {
        const stats = productStats[product.id] || { sales: 0, revenue: 0 };
        const previousStats = calculatePreviousStats(product.id, orderItems, orders);
        const growth = previousStats ? 
          ((stats.revenue - previousStats) / previousStats) * 100 : 0;

        return {
          name: product.name,
          sales: stats.sales,
          revenue: stats.revenue,
          growth
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const calculatePreviousStats = (productId, orderItems, orders) => {
    // Get the start date for previous period
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(currentPeriodStart.getDate() - timeframe);
    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - timeframe);

    // Filter orders for previous period
    const previousPeriodOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= previousPeriodStart && orderDate < currentPeriodStart;
    });

    // Calculate previous period revenue
    const previousRevenue = orderItems
      .filter(item => 
        item.product_id === productId && 
        previousPeriodOrders.some(order => order.id === item.order_id)
      )
      .reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    return previousRevenue;
  };

  const calculateCategoryDistribution = (products, categories, orderItems) => {
    // Create a map of product IDs to their categories
    const productCategories = products.reduce((acc, product) => {
      const category = categories.find(c => c.id === product.category_id);
      acc[product.id] = category ? category.name : 'Uncategorized';
      return acc;
    }, {});

    // Calculate sales by category
    const categorySales = orderItems.reduce((acc, item) => {
      const categoryName = productCategories[item.product_id];
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += item.quantity;
      return acc;
    }, {});

    // Convert to format required by Pie chart
    return Object.entries(categorySales)
      .map(([type, value]) => ({ type, value }))
      .sort((a, b) => b.value - a.value);
  };

  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      key: 'sales',
      sorter: (a, b) => a.sales - b.sales,
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value) => `$${value.toLocaleString()}`,
      sorter: (a, b) => a.revenue - b.revenue,
    },
    {
      title: 'Growth',
      dataIndex: 'growth',
      key: 'growth',
      render: (value) => (
        <span style={{ color: value >= 0 ? '#3f8600' : '#cf1322' }}>
          {value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(value)}%
        </span>
      ),
    },
  ];

  const pieData = [
    { type: 'Electronics', value: 35 },
    { type: 'Clothing', value: 25 },
    { type: 'Books', value: 20 },
    { type: 'Home & Kitchen', value: 15 },
    { type: 'Others', value: 5 },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Product Performance</Title>
        <Select 
          defaultValue="30" 
          style={{ width: 120 }}
          onChange={(value) => setTimeframe(parseInt(value))}
        >
          <Option value="7">Last 7 days</Option>
          <Option value="30">Last 30 days</Option>
          <Option value="90">Last 90 days</Option>
        </Select>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={24} lg={12}>
          <Card title="Top Performing Products">
            {loading ? (
              <div className="flex justify-center p-10">
                <Spin size="large" />
              </div>
            ) : (
              <Table 
                columns={columns} 
                dataSource={productStats.topProducts}
                rowKey="name"
                pagination={false}
                scroll={{ x: 'max-content' }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} md={24} lg={12}>
          <Card title="Sales by Category">
            {loading ? (
              <div className="flex justify-center p-10">
                <Spin size="large" />
              </div>
            ) : (
              <Pie
                data={productStats.categoryDistribution}
                angleField="value"
                colorField="type"
                radius={0.8}
                label={{
                  type: 'outer',
                  content: '{name} {percentage}',
                }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProductPerformance; 