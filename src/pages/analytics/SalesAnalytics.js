import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Table, DatePicker, Spin } from 'antd';
import { Line } from '@ant-design/plots';
import { api } from '../../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const SalesAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchSalesData();
  }, [period]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const orders = await api.getOrderAnalytics(period);
      
      // Group orders by date
      const groupedData = orders.reduce((acc, order) => {
        const date = dayjs(order.created_at).format('YYYY-MM-DD');
        acc[date] = (acc[date] || 0) + order.total_amount;
        return acc;
      }, {});

      // Convert to array format for chart
      const chartData = Object.entries(groupedData).map(([date, sales]) => ({
        date,
        sales
      })).sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

      setSalesData(chartData);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Sales Analytics</Title>
        <RangePicker 
          onChange={(_, [start, end]) => {
            if (start && end) {
              setPeriod(dayjs(end).diff(dayjs(start), 'day'));
            }
          }}
        />
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center p-10">
            <Spin size="large" />
          </div>
        ) : (
          <Line
            data={salesData}
            xField="date"
            yField="sales"
            point={{ size: 5 }}
            label={{ style: { fill: '#aaa' } }}
          />
        )}
      </Card>
    </div>
  );
};

export default SalesAnalytics; 