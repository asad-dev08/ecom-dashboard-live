import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { DollarOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Title } = Typography;

const RevenueMetrics = () => {
  return (
    <div className="p-6">
      <Title level={2}>Revenue Metrics</Title>
      
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={234567}
              precision={2}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        {/* Add more metric cards */}
      </Row>
    </div>
  );
};

export default RevenueMetrics; 