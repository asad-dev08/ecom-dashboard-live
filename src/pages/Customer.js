import React, { useState, useEffect } from 'react';
import { Button, Tag, Typography, message, Modal, Descriptions, Avatar, Space, Popconfirm } from 'antd';
import { EyeOutlined, EditOutlined, UserAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import DataGrid from '../components/common/DataGrid';
import CustomerForm from '../components/customers/CustomerForm';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title } = Typography;

const Customer = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await api.getUsers({ role: 'customer' });
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      message.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (record) => {
    try {
      setLoading(true);
      const customerData = await api.getUser(record.id);
      setSelectedCustomer(customerData);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      message.error('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (record) => {
    try {
      setLoading(true);
      const customerData = await api.getUser(record.id);
      setEditingCustomer(customerData);
      setIsEditModalVisible(true);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      message.error('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id => api.deleteUser(id)));
      await fetchCustomers();
      setSelectedCustomers([]);
      message.success('Customers deleted successfully');
    } catch (error) {
      console.error('Error deleting customers:', error);
      message.error('Failed to delete customers');
    }
  };

  const handleAdd = async (values) => {
    setFormLoading(true);
    try {
      await api.createUser(values);
      message.success('Customer added successfully');
      setIsAddModalVisible(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error adding customer:', error);
      message.error('Failed to add customer');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (values) => {
    setFormLoading(true);
    try {
      await api.updateUser(editingCustomer.id, values);
      message.success('Customer updated successfully');
      setIsEditModalVisible(false);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      message.error('Failed to update customer');
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewDetails = (record) => {
    navigate(`/customers/${record.id}`);
  };

  const columns = [
    {
      field: 'avatar',
      header: 'Avatar',
      width: 80,
      render: (_, record) => (
        <Avatar src={record.avatar} alt={record.full_name}>
          {record.full_name?.charAt(0)}
        </Avatar>
      ),
    },
    {
      field: 'full_name',
      header: 'Name',
      sortable: true,
      filterable: true,
      width: 200,
    },
    {
      field: 'email',
      header: 'Email',
      sortable: true,
      filterable: true,
      width: 250,
    },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      width: 120,
      render: (value) => {
        const colors = {
          active: 'success',
          inactive: 'error',
          pending: 'warning',
        };
        return (
          <Tag color={colors[value]}>
            {value.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      field: 'created_at',
      header: 'Created At',
      sortable: true,
      width: 180,
      render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm'),
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
              handleViewDetails(record);
            }}
          >
            View Details
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  const CustomerDetailsModal = ({ customer, visible, onClose }) => {
    if (!customer) return null;

    return (
      <Modal
        title="Customer Details"
        open={visible}
        onCancel={onClose}
        width={800}
        footer={null}
      >
        <div className="flex items-center mb-6">
          <Avatar 
            size={64} 
            src={customer.avatar}
            alt={customer.full_name}
          >
            {customer.full_name?.charAt(0)}
          </Avatar>
          <div className="ml-4">
            <h2 className="text-xl font-semibold">{customer.full_name}</h2>
            <p className="text-gray-500">{customer.email}</p>
          </div>
        </div>

        <Descriptions bordered column={2}>
          <Descriptions.Item label="ID">{customer.id}</Descriptions.Item>
          <Descriptions.Item label="Role">
            <Tag color={customer.role === 'admin' ? 'blue' : 'green'}>
              {customer.role.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={customer.status === 'active' ? 'success' : 'error'}>
              {customer.status.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {dayjs(customer.created_at).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated" span={2}>
            {dayjs(customer.updated_at).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    );
  };

  const actions = (
    <div className='flex gap-2 flex-wrap items-center justify-between mt-2'>
      <Button
        type="primary"
        icon={<UserAddOutlined />}
        onClick={() => setIsAddModalVisible(true)}
      >
        Add Customer
      </Button>
      {selectedCustomers.length > 0 && (
         <Popconfirm
         title="Delete selected products"
         description="Are you sure you want to delete the selected products?"
         onConfirm={() => handleDelete(selectedCustomers)}
         okText="Yes"
         cancelText="No"
       >
         <Button
           danger
           icon={<DeleteOutlined />}
         >
           Delete Selected
         </Button>
       </Popconfirm>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <Title level={2}>Customers</Title>
      <DataGrid
        columns={columns}
        data={customers}
        loading={loading}
        selectable
        onSelectionChange={setSelectedCustomers}
        onRowClick={handleViewDetails}
        actions={actions}
        searchable
      />

      <CustomerDetailsModal
        customer={selectedCustomer}
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedCustomer(null);
        }}
      />

      <Modal
        title="Add New Customer"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
        width={800}
      >
        <CustomerForm
          onSubmit={handleAdd}
          onCancel={() => setIsAddModalVisible(false)}
          loading={formLoading}
        />
      </Modal>

      <Modal
        title="Edit Customer"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingCustomer(null);
        }}
        footer={null}
        width={800}
      >
        <CustomerForm
          initialValues={editingCustomer}
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditModalVisible(false);
            setEditingCustomer(null);
          }}
          loading={formLoading}
          isEdit
        />
      </Modal>
    </div>
  );
};

export default Customer; 