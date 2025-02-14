import React, { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Button, Space, Spin } from 'antd';
import dayjs from 'dayjs';
import { api } from '../../services/api';
import { message } from 'antd';

const { Option } = Select;

const DiscountForm = ({ onSubmit, onCancel, initialValues, loading }) => {
  const [form] = Form.useForm();
  const [formLoading, setFormLoading] = useState(loading);

  useEffect(() => {
    if (initialValues) {
      setFormLoading(true);
      api.getDiscount(initialValues)
        .then(discount => {
          form.setFieldsValue({
            ...discount,
            start_date: dayjs(discount.start_date),
            end_date: dayjs(discount.end_date),
          });
        })
        .catch(error => {
          message.error('Failed to load discount details');
          console.error('Error loading discount:', error);
        })
        .finally(() => {
          setFormLoading(false);
        });
    } else {
      form.setFieldsValue({
        status: 'active',
        type: 'percentage',
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
          <Spin tip="Loading discount data..." />
        </div>
      )}

      <Form.Item
        name="name"
        label="Discount Name"
        rules={[{ required: true, message: 'Please enter discount name' }]}
      >
        <Input placeholder="Enter discount name" />
      </Form.Item>

      <Form.Item
        name="type"
        label="Discount Type"
        rules={[{ required: true }]}
      >
        <Select>
          <Option value="percentage">Percentage</Option>
          <Option value="fixed_amount">Fixed Amount</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="value"
        label="Discount Value"
        rules={[{ required: true, message: 'Please enter discount value' }]}
      >
        <InputNumber
          min={0}
          max={100}
          formatter={value => `${value}${form.getFieldValue('type') === 'percentage' ? '%' : '$'}`}
          parser={value => value.replace(/[%$]/g, '')}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="min_purchase_amount"
        label="Minimum Purchase Amount"
      >
        <InputNumber
          min={0}
          formatter={value => `$ ${value}`}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          style={{ width: '100%' }}
        />
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
        name="usage_limit"
        label="Usage Limit"
      >
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true }]}
      >
        <Select>
          <Option value="active">Active</Option>
          <Option value="scheduled">Scheduled</Option>
          <Option value="disabled">Disabled</Option>
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
            {(loading || formLoading) ? 'Saving...' : initialValues ? 'Update Discount' : 'Create Discount'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default DiscountForm; 