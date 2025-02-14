import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Upload, message, Avatar, Space, Typography } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { api, API_BASE_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { Text } = Typography;

const Profile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const { user: authUser, updateUser } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await api.getProfile(authUser.id);
      form.setFieldsValue({
        full_name: profile.full_name,
        email: profile.email,
        role: profile.role || '',
        status: profile.status || 'active',
      });
      setImageUrl(profile.avatar);
    } catch (error) {
      console.error('Error fetching profile:', error);
      message.error('Failed to load profile');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const updatedProfile = await api.updateProfile(authUser.id, values);
      updateUser({ ...authUser, ...updatedProfile });
      message.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
      }
      return isImage && isLt2M;
    },
    onChange: (info) => {
      if (info.file.status === 'done') {
        setImageUrl(info.file.response.url);
        updateUser({ ...authUser, avatar: info.file.response.url });
        message.success('Avatar uploaded successfully');
      }
    },
    action: `${API_BASE_URL}/upload`,
    headers: {
      authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  };
  console.log('form: ', form.getFieldsValue())

  return (
    <div className="p-6">
      <Card title="Profile Settings" className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <Space direction="vertical" size="large">
            <Avatar 
              size={100} 
              icon={<UserOutlined />} 
              src={imageUrl}
            />
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Change Avatar</Button>
            </Upload>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="full_name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
          >
            <Input disabled />
          </Form.Item>

          {/* <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" loading={loading}>
              Save Changes
            </Button>
          </Form.Item> */}
        </Form>
      </Card>
    </div>
  );
};

export default Profile; 