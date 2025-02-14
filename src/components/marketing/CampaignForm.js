import React, { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Button, Space, Spin } from 'antd';
import dayjs from 'dayjs';
import { api } from '../../services/api';
import { message } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

const CampaignForm = ({ onSubmit, onCancel, initialValues, loading }) => {
  const [form] = Form.useForm();
  const [formLoading, setFormLoading] = useState(loading);

  useEffect(() => {
    if (initialValues) {
      setFormLoading(true);
      api.getCampaign(initialValues)
        .then(campaign => {
          form.setFieldsValue({
            ...campaign,
            start_date: dayjs(campaign.start_date),
            end_date: dayjs(campaign.end_date),
            target_audience: campaign.target_audience || [],
          });
        })
        .catch(error => {
          message.error('Failed to load campaign details');
          console.error('Error loading campaign:', error);
        })
        .finally(() => {
          setFormLoading(false);
        });
    } else {
      form.setFieldsValue({
        status: 'draft',
        type: 'seasonal',
        target_audience: [],
        start_date: null,
        end_date: null,
      });
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    await onSubmit({
      ...values,
      id: initialValues?.id,
      start_date: values.start_date.toISOString(),
      end_date: values.end_date.toISOString(),
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
          <Spin tip="Loading campaign data..." />
        </div>
      )}

      <Form.Item
        name="name"
        label="Campaign Name"
        rules={[{ required: true, message: 'Please enter campaign name' }]}
      >
        <Input placeholder="Enter campaign name" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true }]}
      >
        <TextArea rows={4} placeholder="Enter campaign description" />
      </Form.Item>

      <Form.Item
        name="type"
        label="Campaign Type"
        rules={[{ required: true }]}
      >
        <Select>
          <Option value="seasonal">Seasonal</Option>
          <Option value="holiday">Holiday</Option>
          <Option value="flash_sale">Flash Sale</Option>
          <Option value="clearance">Clearance</Option>
        </Select>
      </Form.Item>

      <Space size={16} style={{ width: '100%' }}>
        <Form.Item
          name="start_date"
          label="Start Date"
          rules={[{ required: true }]}
          style={{ width: '100%' }}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="end_date"
          label="End Date"
          rules={[{ required: true }]}
          style={{ width: '100%' }}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Space>

      <Form.Item
        name="target_audience"
        label="Target Audience"
        rules={[{ required: true }]}
      >
        <Select mode="multiple">
          <Option value="new_customers">New Customers</Option>
          <Option value="existing_customers">Existing Customers</Option>
          <Option value="vip">VIP Customers</Option>
          <Option value="all">All Customers</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="budget"
        label="Budget"
        rules={[{ required: true }]}
      >
        <InputNumber
          min={0}
          formatter={value => `$ ${value}`}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          style={{ width: '100%' }}
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
          <Option value="scheduled">Scheduled</Option>
          <Option value="completed">Completed</Option>
          <Option value="cancelled">Cancelled</Option>
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
            {(loading || formLoading) ? 'Saving...' : initialValues ? 'Update Campaign' : 'Create Campaign'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CampaignForm; 