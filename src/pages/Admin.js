import React, { useState, useEffect } from 'react';
import { Button, Tag, Typography, message, Modal, Descriptions, Avatar } from 'antd';
import { EyeOutlined, UserAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import DataGrid from '../components/common/DataGrid';
import dayjs from 'dayjs';

const { Title } = Typography;

const Admin = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAdmins, setSelectedAdmins] = useState([]);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      // Only fetch admin users
      const data = await api.getUsers({ role: 'admin' });
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      message.error('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the code similar to User.js ...

  return (
    <div className="p-6">
      <Title level={2}>System Administrators</Title>
      <DataGrid
        columns={columns}
        data={admins}
        loading={loading}
        selectable
        onSelectionChange={setSelectedAdmins}
        onRowClick={handleView}
        actions={actions}
        searchable
      />

      <AdminDetailsModal
        admin={selectedAdmin}
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedAdmin(null);
        }}
      />
    </div>
  );
};

export default Admin; 