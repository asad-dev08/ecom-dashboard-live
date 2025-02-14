import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Space, Spin } from 'antd';
import { api } from '../../services/api';
import { message } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

const EmailTemplateForm = ({ onSubmit, onCancel, initialValues, loading }) => {
  const [form] = Form.useForm();
  const [formLoading, setFormLoading] = useState(loading);

  useEffect(() => {
    if (initialValues) {
      setFormLoading(true);
      api.getEmailTemplate(initialValues)
        .then(template => {
          form.setFieldsValue(template);
        })
        .catch(error => {
          message.error('Failed to load template details');
          console.error('Error loading template:', error);
        })
        .finally(() => {
          setFormLoading(false);
        });
    } else {
      form.setFieldsValue({
        status: 'draft',
        type: 'welcome',
      });
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    await onSubmit({
      ...values,
      id: initialValues?.id,
    });
    form.resetFields();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      {formLoading && (
        <div className="flex justify-center my-4">
          <Spin tip="Loading template data..." />
        </div>
      )}

      <Form.Item
        name="name"
        label="Template Name"
        rules={[{ required: true, message: 'Please enter template name' }]}
      >
        <Input placeholder="Enter template name" />
      </Form.Item>

      <Form.Item
        name="subject"
        label="Email Subject"
        rules={[{ required: true, message: 'Please enter email subject' }]}
      >
        <Input placeholder="Enter email subject" />
      </Form.Item>

      <Form.Item
        name="type"
        label="Template Type"
        rules={[{ required: true }]}
      >
        <Select>
          <Option value="welcome">Welcome Email</Option>
          <Option value="promotional">Promotional</Option>
          <Option value="abandoned_cart">Abandoned Cart</Option>
          <Option value="order_confirmation">Order Confirmation</Option>
          <Option value="newsletter">Newsletter</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="content"
        label="Email Content"
        rules={[{ required: true, message: 'Please enter email content' }]}
      >
        <TextArea 
          rows={12} 
          placeholder="Enter email content (supports HTML)"
        />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true }]}
      >
        <Select>
          <Option value="draft">Draft</Option>
          <Option value="active">Active</Option>
          <Option value="archived">Archived</Option>
        </Select>
      </Form.Item>

      <Form.Item className="flex justify-end mb-0">
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading || formLoading}
            disabled={formLoading}
          >
            {(loading || formLoading) ? 'Saving...' : initialValues ? 'Update Template' : 'Create Template'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default EmailTemplateForm; 