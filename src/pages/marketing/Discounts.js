import React, { useState, useEffect } from 'react';
import { Card, Button, Tag, Typography, message, Space, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '../../services/api';
import DataGrid from '../../components/common/DataGrid';
import DiscountForm from '../../components/marketing/DiscountForm';
import dayjs from 'dayjs';

const { Title } = Typography;

const Discounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const data = await api.getDiscounts();
      setDiscounts(data);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      message.error('Failed to fetch discounts');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      field: 'name',
      header: 'Name',
      sortable: true,
      filterable: true,
    },
    {
      field: 'type',
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
      field: 'value',
      header: 'Value',
      sortable: true,
      render: (value, record) => 
        record.type === 'percentage' ? `${value}%` : `$${value}`,
    },
    {
      field: 'start_date',
      header: 'Start Date',
      sortable: true,
      render: (value) => dayjs(value).format('YYYY-MM-DD'),
    },
    {
      field: 'end_date',
      header: 'End Date',
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
          scheduled: 'processing',
          expired: 'error',
          disabled: 'default',
        };
        return (
          <Tag color={colors[value]}>
            {value.toUpperCase()}
          </Tag>
        );
      },
    },
  ];

  const handleAdd = async (values) => {
    try {
      setFormLoading(true);
      await api.createDiscount(values);
      message.success('Discount created successfully');
      setIsModalVisible(false);
      fetchDiscounts();
    } catch (error) {
      console.error('Error creating discount:', error);
      message.error('Failed to create discount');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (values) => {
    try {
      setFormLoading(true);
      await api.updateDiscount(editingDiscount, values);
      message.success('Discount updated successfully');
      setIsModalVisible(false);
      setEditingDiscount(null);
      fetchDiscounts();
    } catch (error) {
      console.error('Error updating discount:', error);
      message.error('Failed to update discount');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteDiscount(id);
      message.success('Discount deleted successfully');
      fetchDiscounts();
    } catch (error) {
      console.error('Error deleting discount:', error);
      message.error('Failed to delete discount');
    }
  };

  const actions = (
    <div className='flex gap-2 flex-wrap items-center justify-between mt-2'>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalVisible(true)}
      >
        Add Discount
      </Button>
      {selectedDiscounts.length > 0 && (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingDiscount(selectedDiscounts[0]);
              setIsModalVisible(true);
            }}
            disabled={selectedDiscounts.length !== 1}
          >
            Edit Selected
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Are you sure you want to delete the selected discounts?',
                content: 'This action cannot be undone.',
                onOk: () => Promise.all(selectedDiscounts.map(d => handleDelete(d.id))),
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
      <Title level={2}>Discount Management</Title>
      <Card>
        <DataGrid
          columns={columns}
          data={discounts}
          loading={loading}
          selectable
          onSelectionChange={setSelectedDiscounts}
          actions={actions}
          searchable
        />
      </Card>

      <Modal
        title={editingDiscount ? 'Edit Discount' : 'Create Discount'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingDiscount(null);
        }}
        footer={null}
        width={800}
      >
        <DiscountForm
          initialValues={editingDiscount}
          onSubmit={editingDiscount ? handleEdit : handleAdd}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingDiscount(null);
          }}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default Discounts; 