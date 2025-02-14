import React, { useState, useEffect } from 'react';
import { Card, Button, Tag, Typography, message, Space, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { api } from '../../services/api';
import DataGrid from '../../components/common/DataGrid';
import dayjs from 'dayjs';
import CouponForm from '../../components/marketing/CouponForm';

const { Title } = Typography;

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupons, setSelectedCoupons] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const data = await api.getCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      message.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    message.success('Coupon code copied to clipboard!');
  };

  const handleAdd = async (values) => {
    try {
      setFormLoading(true);
      await api.createCoupon(values);
      message.success('Coupon created successfully');
      setIsModalVisible(false);
      fetchCoupons();
    } catch (error) {
      console.error('Error creating coupon:', error);
      message.error('Failed to create coupon');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (values) => {
    try {
      setFormLoading(true);
      await api.updateCoupon(editingCoupon, values);
      message.success('Coupon updated successfully');
      setIsModalVisible(false);
      setEditingCoupon(null);
      fetchCoupons();
    } catch (error) {
      console.error('Error updating coupon:', error);
      message.error('Failed to update coupon');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteCoupon(id);
      message.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      message.error('Failed to delete coupon');
    }
  };

  const columns = [
    {
      field: 'code',
      header: 'Coupon Code',
      sortable: true,
      filterable: true,
      render: (code) => (
        <Space>
          <span>{code}</span>
          <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleCopyCode(code);
            }}
          />
        </Space>
      ),
    },
    {
      field: 'discount_type',
      header: 'Type',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Tag color={value === 'percentage' ? 'blue' : 'green'}>
          {value === 'percentage' ? 'Percentage' : 'Fixed Amount'}
        </Tag>
      ),
    },
    {
      field: 'discount_value',
      header: 'Value',
      sortable: true,
      render: (value, record) => 
        record.discount_type === 'percentage' ? `${value}%` : `$${value}`,
    },
    {
      field: 'usage_count',
      header: 'Usage',
      sortable: true,
      render: (value, record) => `${value}/${record.usage_limit}`,
    },
    {
      field: 'end_date',
      header: 'Expires',
      sortable: true,
      render: (value) => dayjs(value).format('YYYY-MM-DD'),
    },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      render: (value) => {
        const colors = {
          active: 'success',
          expired: 'error',
          used: 'default',
        };
        return (
          <Tag color={colors[value]}>
            {value.toUpperCase()}
          </Tag>
        );
      },
    },
  ];

  const actions = (
    <div className='flex gap-2 flex-wrap items-center justify-between mt-2'>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalVisible(true)}
      >
        Create Coupon
      </Button>
      {selectedCoupons.length > 0 && (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingCoupon(selectedCoupons[0]);
              setIsModalVisible(true);
            }}
            disabled={selectedCoupons.length !== 1}
          >
            Edit Selected
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Are you sure you want to delete the selected coupons?',
                content: 'This action cannot be undone.',
                onOk: () => Promise.all(selectedCoupons.map(c => handleDelete(c.id))),
              });
            }}
          >
            Delete Selected
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <Title level={2}>Coupon Management</Title>
      <Card>
        <DataGrid
          columns={columns}
          data={coupons}
          loading={loading}
          selectable
          onSelectionChange={setSelectedCoupons}
          actions={actions}
          searchable
        />
      </Card>

      <Modal
        title={editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingCoupon(null);
        }}
        footer={null}
        width={800}
      >
        <CouponForm
          initialValues={editingCoupon}
          onSubmit={editingCoupon ? handleEdit : handleAdd}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingCoupon(null);
          }}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default Coupons; 