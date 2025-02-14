import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Table, Progress, Tag, Alert, Statistic, Spin } from 'antd';
import { StockOutlined, WarningOutlined } from '@ant-design/icons';
import { api } from '../../services/api';

const { Title } = Typography;

const InventoryReports = () => {
  const [loading, setLoading] = useState(true);
  const [inventoryStats, setInventoryStats] = useState({
    products: [],
    lowStockCount: 0,
    totalSKUs: 0,
    avgTurnoverRate: 0
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const { products, orderItems } = await api.getInventoryAnalytics();

      // Calculate inventory metrics
      const productStats = calculateInventoryMetrics(products, orderItems);
      const lowStockItems = productStats.filter(p => p.status === 'Low Stock');

      setInventoryStats({
        products: productStats,
        lowStockCount: lowStockItems.length,
        totalSKUs: products.length,
        avgTurnoverRate: calculateAverageTurnover(productStats)
      });
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateInventoryMetrics = (products, orderItems) => {
    return products.map(product => {
      const soldQuantity = orderItems
        .filter(item => item.product_id === product.id)
        .reduce((sum, item) => sum + item.quantity, 0);

      const turnoverRate = soldQuantity / (product.stock_quantity || 1);
      const status = product.stock_quantity < product.reorder_point ? 'Low Stock' : 'In Stock';

      return {
        product: product.name,
        sku: product.sku || `SKU${product.id.slice(0, 6)}`,
        inStock: product.stock_quantity,
        reorderPoint: product.reorder_point || Math.floor(product.stock_quantity * 0.2),
        status,
        turnoverRate
      };
    });
  };

  const calculateAverageTurnover = (products) => {
    const totalTurnover = products.reduce((sum, product) => sum + product.turnoverRate, 0);
    return totalTurnover / products.length;
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'In Stock',
      dataIndex: 'inStock',
      key: 'inStock',
      sorter: (a, b) => a.inStock - b.inStock,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'In Stock' ? 'success' : 'warning'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Stock Level',
      dataIndex: 'inStock',
      key: 'stockLevel',
      render: (inStock, record) => (
        <Progress 
          percent={Math.round((inStock / record.reorderPoint) * 50)} 
          status={inStock < record.reorderPoint ? 'exception' : 'active'}
        />
      ),
    },
    {
      title: 'Turnover Rate',
      dataIndex: 'turnoverRate',
      key: 'turnoverRate',
      render: (value) => `${value.toFixed(1)}x`,
      sorter: (a, b) => a.turnoverRate - b.turnoverRate,
    },
  ];

  return (
    <div className="p-6">
      <Title level={2}>Inventory Reports</Title>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Alert
            message="Low Stock Alert"
            description="5 products are below their reorder point. Please review the inventory levels."
            type="warning"
            showIcon
            icon={<WarningOutlined />}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Total SKUs"
              value={inventoryStats.totalSKUs}
              prefix={<StockOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Low Stock Items"
              value={inventoryStats.lowStockCount}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Average Turnover Rate"
              value={inventoryStats.avgTurnoverRate.toFixed(1)}
              precision={1}
              suffix="x"
            />
          </Card>
        </Col>
      </Row>

      <Card title="Inventory Status" className="mt-4">
        <Table 
          columns={columns} 
          dataSource={inventoryStats.products}
          rowKey="sku"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default InventoryReports; 