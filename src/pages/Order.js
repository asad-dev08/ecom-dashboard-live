import React, { useState, useEffect } from 'react';
import { Button, Tag, Typography, message, Modal, Descriptions, Space, Select } from 'antd';
import { EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import DataGrid from '../components/common/DataGrid';
import dayjs from 'dayjs';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { ORDER_STATUS } from '../constants/orderStatus';

const { Title } = Typography;
const { Option } = Select;

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (record) => {
    try {
      setLoading(true);
      const orderData = await api.getOrder(record.id);
      setSelectedOrder(orderData);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      message.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      message.success('Order status updated successfully');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        const updatedOrder = await api.getOrder(orderId);
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Failed to update order status');
    }
  };

  const handleDownloadInvoice = async (order) => {
    try {
      const orderDetails = await api.getOrder(order.id);
      await generateInvoicePDF(orderDetails);
      message.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      message.error('Failed to download invoice');
    }
  };

  const columns = [
    {
      field: 'id',
      header: 'Order ID',
      sortable: true,
      filterable: true,
      width: 200,
      render: (value) => <span className="font-mono">{value}</span>,
    },
    {
      field: 'customer_name',
      header: 'Customer',
      sortable: true,
      filterable: true,
      width: 200,
    },
    {
      field: 'total_amount',
      header: 'Total Amount',
      sortable: true,
      width: 150,
      render: (value) => `$${value.toFixed(2)}`,
    },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      width: 200,
      render: (value, record) => (
        <Space>
          <Tag color={ORDER_STATUS[value]?.color}>
            {value.toUpperCase()}
          </Tag>
          <Select
            defaultValue={value}
            style={{ width: 120 }}
            onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
            onClick={(e) => e.stopPropagation()}
          >
            {Object.entries(ORDER_STATUS).map(([status, { label }]) => (
              <Option key={status} value={status}>
                {label}
              </Option>
            ))}
          </Select>
        </Space>
      ),
    },
    {
      field: 'created_at',
      header: 'Order Date',
      sortable: true,
      width: 200,
      render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      field: 'actions',
      header: 'Actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleView(record);
            }}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<FileTextOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadInvoice(record);
            }}
          >
            Invoice
          </Button>
        </Space>
      ),
    },
  ];

  const OrderDetailsModal = ({ order, visible, onClose }) => {
    if (!order) return null;

    return (
      <Modal
        title={`Order Details - ${order.id}`}
        open={visible}
        onCancel={onClose}
        width={1000}
        footer={null}
      >
        <Descriptions bordered column={2} className="mb-4">
          <Descriptions.Item label="Order ID">{order.id}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={order.status === 'delivered' ? 'success' : 'processing'}>
              {order.status.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Customer">{order.customer_name}</Descriptions.Item>
          <Descriptions.Item label="Order Date">
            {dayjs(order.created_at).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="Total Amount">
            ${order.total_amount.toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {dayjs(order.updated_at).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
        </Descriptions>

        <Title level={5}>Order Items</Title>
        <DataGrid
          columns={[
            {
              field: 'product_name',
              header: 'Product',
              width: 300,
              sortable: true,
              filterable: true,
            },
            {
              field: 'quantity',
              header: 'Quantity',
              width: 100,
            },
            {
              field: 'unit_price',
              header: 'Unit Price',
              width: 150,
              render: (value) => `$${value.toFixed(2)}`,
            },
            {
              field: 'total',
              header: 'Total',
              width: 150,
              render: (_, record) => `$${(record.quantity * record.unit_price).toFixed(2)}`,
            },
          ]}
          data={order.items || []}
          searchable={false}
        />
      </Modal>
    );
  };

  return (
    <div className="p-6">
      <Title level={2}>Orders</Title>
      <DataGrid
        columns={columns}
        data={orders}
        loading={loading}
        onRowClick={handleView}
        searchable
      />

      <OrderDetailsModal
        order={selectedOrder}
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
};

export default Order; 