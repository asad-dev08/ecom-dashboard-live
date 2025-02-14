import React from 'react';
import { Drawer, Form, Switch, Select, Slider, Radio, Space, Button, Divider, Typography, ColorPicker } from 'antd';
import { theme as antTheme } from 'antd';
import { useTheme } from '../../context/ThemeContext';

const { Title } = Typography;
const { Option } = Select;
const { defaultAlgorithm, darkAlgorithm } = antTheme;

const SettingsDrawer = ({ visible, onClose }) => {
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
        algorithm: values.colorMode === 'dark' ? darkAlgorithm : defaultAlgorithm,
      });
      setFontSize(values.fontSize);
      setColorMode(values.colorMode);
      setNavigationStyle(values.navigationStyle);
      onClose();
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  return (
    <Drawer
      title="Theme Settings"
      placement="right"
      width={420}
      onClose={onClose}
      open={visible}
    >
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
        <Title level={5}>Theme</Title>
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

        <Divider />

        {/* Layout Settings */}
        <Title level={5}>Layout</Title>
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

        <Divider />

        {/* Typography Settings */}
        <Title level={5}>Typography</Title>
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

        <Divider />

        {/* Other Settings */}
        <Title level={5}>Other</Title>
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

        <div className="absolute bottom-0 bg-white dark:bg-gray-800 left-0 right-0 px-6 mt-6 py-2 border-t">
          <Space className="flex justify-end">
            <Button onClick={() => {
              form.resetFields();
              onClose();
            }}>
              Cancel
            </Button>
            <Button type="primary" onClick={form.submit}>
              Save Changes
            </Button>
          </Space>
        </div>
      </Form>
    </Drawer>
  );
};

export default SettingsDrawer; 