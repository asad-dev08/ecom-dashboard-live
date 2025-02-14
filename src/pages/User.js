import React, { useState, useEffect } from 'react';
import { Button, Tag, Typography, message, Modal, Descriptions, Avatar, Space, Popconfirm } from 'antd';
import { EyeOutlined, EditOutlined, UserAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import DataGrid from '../components/common/DataGrid';
import CustomerForm from '../components/customers/CustomerForm';
import dayjs from 'dayjs';

const { Title } = Typography;

const User = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      // Filter out customers
      const filteredUsers = data.filter(user => user.role !== 'customer');
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (record) => {
    try {
      setLoading(true);
      const userData = await api.getUser(record.id);
      setSelectedUser(userData);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      message.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (record) => {
    try {
      setLoading(true);
      const userData = await api.getUser(record.id);
      setEditingUser(userData);
      setIsEditModalVisible(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      message.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id => api.deleteUser(id)));
      await fetchUsers();
      setSelectedUsers([]);
      message.success('Users deleted successfully');
    } catch (error) {
      console.error('Error deleting users:', error);
      message.error('Failed to delete users');
    }
  };

  const handleAdd = async (values) => {
    setFormLoading(true);
    try {
      await api.createUser(values);
      message.success('User added successfully');
      setIsAddModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      message.error('Failed to add user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (values) => {
    setFormLoading(true);
    try {
      await api.updateUser(editingUser.id, values);
      message.success('User updated successfully');
      setIsEditModalVisible(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      message.error('Failed to update user');
    } finally {
      setFormLoading(false);
    }
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
      field: 'role',
      header: 'Role',
      sortable: true,
      filterable: true,
      width: 120,
      render: (value) => (
        <Tag color={value === 'admin' ? 'blue' : 'purple'}>
          {value.toUpperCase()}
        </Tag>
      ),
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
      width: 150,
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

  const UserDetailsModal = ({ user, visible, onClose }) => {
    if (!user) return null;

    return (
      <Modal
        title="User Details"
        open={visible}
        onCancel={onClose}
        width={800}
        footer={null}
      >
        <div className="flex items-center mb-6">
          <Avatar 
            size={64} 
            src={user.avatar}
            alt={user.full_name}
          >
            {user.full_name?.charAt(0)}
          </Avatar>
          <div className="ml-4">
            <h2 className="text-xl font-semibold">{user.full_name}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        <Descriptions bordered column={2}>
          <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
          <Descriptions.Item label="Role">
            <Tag color={user.role === 'admin' ? 'blue' : 'purple'}>
              {user.role.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={user.status === 'active' ? 'success' : 'error'}>
              {user.status.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {dayjs(user.created_at).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated" span={2}>
            {dayjs(user.updated_at).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    );
  };

  const actions = (
    <>
      <Button
        type="primary"
        icon={<UserAddOutlined />}
        onClick={() => setIsAddModalVisible(true)}
      >
        Add User
      </Button>
      {selectedUsers.length > 0 && (
        <Popconfirm
          title="Delete selected users"
          description="Are you sure you want to delete the selected users?"
          onConfirm={() => handleDelete(selectedUsers)}
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
    </>
  );

  return (
    <div className="p-6">
      <Title level={2}>System Users</Title>
      <DataGrid
        columns={columns}
        data={users}
        loading={loading}
        selectable
        onSelectionChange={setSelectedUsers}
        onRowClick={handleView}
        actions={actions}
        searchable
      />

      <UserDetailsModal
        user={selectedUser}
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedUser(null);
        }}
      />

      <Modal
        title="Add New User"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
        width={800}
      >
        <CustomerForm
          onSubmit={handleAdd}
          onCancel={() => setIsAddModalVisible(false)}
          loading={formLoading}
          isSystemUser
        />
      </Modal>

      <Modal
        title="Edit User"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingUser(null);
        }}
        footer={null}
        width={800}
      >
        <CustomerForm
          initialValues={editingUser}
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditModalVisible(false);
            setEditingUser(null);
          }}
          loading={formLoading}
          isEdit
          isSystemUser
        />
      </Modal>
    </div>
  );
};

export default User; 