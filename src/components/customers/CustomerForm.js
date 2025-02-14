import React, { useEffect } from 'react';
import { Form, Input, Select, Button, Space } from 'antd';

const { Option } = Select;

const CustomerForm = ({ onSubmit, onCancel, loading, initialValues, isEdit, isSystemUser }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    try {
      await onSubmit({
        ...values,
        ...(isSystemUser ? {} : { role: 'customer' }),
        updated_at: new Date().toISOString(),
        ...(isEdit ? {} : { created_at: new Date().toISOString() }),
      });
      form.resetFields();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialValues || {
        status: 'active',
        ...(isSystemUser ? { role: 'staff' } : {}),
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          name="full_name"
          label="Full Name"
          rules={[{ required: true, message: 'Please enter full name' }]}
        >
          <Input placeholder="Enter full name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>
      </div>

      <Form.Item
        name="phone"
        label="Phone"
        rules={[{ required: true, message: 'Please enter phone number' }]}
      >
        <Input placeholder="Enter phone number" />
      </Form.Item>

      <Form.Item
        name="address"
        label="Address"
        rules={[{ required: true, message: 'Please enter address' }]}
      >
        <Input.TextArea rows={3} placeholder="Enter address" />
      </Form.Item>

      {isSystemUser && (
        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: 'Please select a role' }]}
        >
          <Select>
            <Option value="admin">Administrator</Option>
            <Option value="staff">Staff Member</Option>
            <Option value="manager">Manager</Option>
          </Select>
        </Form.Item>
      )}

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true }]}
      >
        <Select>
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
          <Option value="pending">Pending</Option>
        </Select>
      </Form.Item>

      <Form.Item className="flex justify-end mb-0">
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {loading ? 'Saving...' : isEdit 
              ? `Update ${isSystemUser ? 'User' : 'Customer'}`
              : `Save ${isSystemUser ? 'User' : 'Customer'}`
            }
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CustomerForm; 