import React, { useState } from 'react';
import { Card, Form, Switch, Select, Slider, Radio, Space, Button, message, Divider, Typography } from 'antd';
import { useTheme } from '../../context/ThemeContext';
import { ColorPicker } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

const Settings = () => {
  const { 
    theme,
    updateTheme,
    fontSize,
    setFontSize,
    colorMode,
    setColorMode,
    borderRadius,
    setBorderRadius,
    navigationStyle,
    setNavigationStyle,
  } = useTheme();

  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    try {
      updateTheme({
        primaryColor: values.primaryColor.toHexString(),
        borderRadius: values.borderRadius,
      });
      setFontSize(values.fontSize);
      setColorMode(values.colorMode);
      setNavigationStyle(values.navigationStyle);
      message.success('Settings updated successfully');
    } catch (error) {
      message.error('Failed to update settings');
    }
  };

  return (
    <div className="p-6">
      <Card title="Application Settings" className="max-w-3xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            primaryColor: theme.primaryColor,
            fontSize,
            colorMode,
            borderRadius,
            navigationStyle,
          }}
        >
          {/* Theme Settings */}
          <Title level={4}>Theme Settings</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="primaryColor"
              label="Primary Color"
            >
              <ColorPicker />
            </Form.Item>

            <Form.Item
              name="colorMode"
              label="Color Mode"
            >
              <Radio.Group>
                <Radio.Button value="light">Light</Radio.Button>
                <Radio.Button value="dark">Dark</Radio.Button>
                <Radio.Button value="system">System</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </div>

          {/* Layout Settings */}
          <Divider />
          <Title level={4}>Layout Settings</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="navigationStyle"
              label="Navigation Style"
            >
              <Select>
                <Option value="sidebar">Sidebar</Option>
                <Option value="topbar">Top Bar</Option>
                <Option value="both">Both</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="borderRadius"
              label="Border Radius"
            >
              <Slider
                min={0}
                max={24}
                marks={{
                  0: '0px',
                  8: '8px',
                  16: '16px',
                  24: '24px'
                }}
              />
            </Form.Item>
          </div>

          {/* Typography Settings */}
          <Divider />
          <Title level={4}>Typography Settings</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="fontSize"
              label="Base Font Size"
            >
              <Slider
                min={12}
                max={20}
                marks={{
                  12: '12px',
                  14: '14px',
                  16: '16px',
                  18: '18px',
                  20: '20px'
                }}
              />
            </Form.Item>
          </div>

          {/* Other Settings */}
          <Divider />
          <Title level={4}>Other Settings</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="animations"
              label="Enable Animations"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="compactMode"
              label="Compact Mode"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </div>

          <Form.Item className="flex justify-end">
            <Space>
              <Button onClick={() => form.resetFields()}>
                Reset to Defaults
              </Button>
              <Button type="primary" htmlType="submit">
                Save Changes
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings; 