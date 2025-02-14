import React, { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Button, Space, Spin, Switch } from 'antd';
import dayjs from 'dayjs';
import { api } from '../../services/api';
import { message } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

const CouponForm = ({ onSubmit, onCancel, initialValues, loading }) => {
  const [form] = Form.useForm();
  const [formLoading, setFormLoading] = useState(loading);

  useEffect(() => {
    if (initialValues) {
      setFormLoading(true);
      api.getCoupon(initialValues)
        .then(coupon => {
          form.setFieldsValue({
            ...coupon,
            start_date: dayjs(coupon.start_date),
            end_date: dayjs(coupon.end_date),
          });
        })
        .catch(error => {
          message.error('Failed to load coupon details');
          console.error('Error loading coupon:', error);
        })
        .finally(() => {
          setFormLoading(false);
        });
    } else {
      form.setFieldsValue({
        status: 'active',
        discount_type: 'percentage',
        is_single_use: true,
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
          <Spin tip="Loading coupon data..." />
        </div>
      )}

      <Form.Item
        name="code"
        label="Coupon Code"
        rules={[{ required: true, message: 'Please enter coupon code' }]}
      >
        <Input placeholder="Enter coupon code" style={{ textTransform: 'uppercase' }} />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
      >
        <TextArea rows={4} placeholder="Enter coupon description" />
      </Form.Item>

      <Form.Item
        name="discount_type"
        label="Discount Type"
        rules={[{ required: true }]}
      >
        <Select>
          <Option value="percentage">Percentage</Option>
          <Option value="fixed_amount">Fixed Amount</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="discount_value"
        label="Discount Value"
        rules={[{ required: true }]}
      >
        <InputNumber
          min={0}
          max={form.getFieldValue('discount_type') === 'percentage' ? 100 : undefined}
          formatter={value => `${value}${form.getFieldValue('discount_type') === 'percentage' ? '%' : '$'}`}
          parser={value => value.replace(/[%$]/g, '')}
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
        name="minimum_purchase"
        label="Minimum Purchase Amount"
      >
        <InputNumber
          min={0}
          formatter={value => `$ ${value}`}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="usage_limit"
        label="Usage Limit"
        rules={[{ required: true }]}
      >
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="is_single_use"
        label="Single Use Only"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true }]}
      >
        <Select>
          <Option value="active">Active</Option>
          <Option value="expired">Expired</Option>
          <Option value="used">Used</Option>
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
            {(loading || formLoading) ? 'Saving...' : initialValues ? 'Update Coupon' : 'Create Coupon'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CouponForm; 