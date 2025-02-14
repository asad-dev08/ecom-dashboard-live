import React, { useState, useEffect } from 'react';
import { Card, Button, Tag, Typography, message, Space, Row, Col, Statistic, Modal } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  MailOutlined,
  EyeOutlined 
} from '@ant-design/icons';
import { api } from '../../services/api';
import DataGrid from '../../components/common/DataGrid';
import EmailTemplateForm from '../../components/marketing/EmailTemplateForm';
import dayjs from 'dayjs';

const { Title } = Typography;

const EmailMarketing = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await api.getEmailTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      message.error('Failed to fetch email templates');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (values) => {
    try {
      setFormLoading(true);
      await api.createEmailTemplate(values);
      message.success('Template created successfully');
      setIsModalVisible(false);
      fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      message.error('Failed to create template');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (values) => {
    try {
      setFormLoading(true);
      await api.updateEmailTemplate(editingTemplate, values);
      message.success('Template updated successfully');
      setIsModalVisible(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      message.error('Failed to update template');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteEmailTemplate(id);
      message.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      message.error('Failed to delete template');
    }
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
    setPreviewVisible(true);
  };

  const handleSendTest = async (template) => {
    try {
      await api.sendTestEmail(template.id);
      message.success('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email:', error);
      message.error('Failed to send test email');
    }
  };

  const columns = [
    {
      field: 'name',
      header: 'Template Name',
      sortable: true,
      filterable: true,
    },
    {
      field: 'subject',
      header: 'Subject Line',
      sortable: true,
      filterable: true,
    },
    {
      field: 'type',
      header: 'Type',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Tag color={
          value === 'welcome' ? 'green' :
          value === 'promotional' ? 'blue' :
          value === 'abandoned_cart' ? 'orange' :
          value === 'order_confirmation' ? 'purple' :
          'default'
        }>
          {value.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      render: (value) => {
        const colors = {
          active: 'success',
          draft: 'default',
          archived: 'error',
        };
        return (
          <Tag color={colors[value]}>
            {value.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      field: 'actions',
      header: 'Actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          >
            Preview
          </Button>
          <Button 
            type="text" 
            icon={<MailOutlined />}
            onClick={() => handleSendTest(record)}
          >
            Send Test
          </Button>
        </Space>
      ),
    },
  ];

  const actions = (
    <div className='flex gap-2 flex-wrap items-center justify-between mt-2'>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalVisible(true)}
      >
        Create Template
      </Button>
      {selectedTemplates.length > 0 && (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingTemplate(selectedTemplates[0]);
              setIsModalVisible(true);
            }}
            disabled={selectedTemplates.length !== 1}
          >
            Edit Selected
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Are you sure you want to delete the selected templates?',
                content: 'This action cannot be undone.',
                onOk: () => Promise.all(selectedTemplates.map(t => handleDelete(t.id))),
              });
            }}
          >
            Delete Selected
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <Title level={2}>Email Marketing</Title>
      
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24}  md={8} lg={6}>
          <Card>
            <Statistic
              title="Total Subscribers"
              value={1234}
              prefix={<MailOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8} lg={6}>
          <Card>
            <Statistic
              title="Open Rate"
              value={45.2}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} md={8} lg={6}>
          <Card>
            <Statistic
              title="Click Rate"
              value={12.8}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} md={8} lg={6}>
          <Card>
            <Statistic
              title="Campaigns Sent"
              value={89}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Email Templates">
        <DataGrid
          columns={columns}
          data={templates}
          loading={loading}
          selectable
          onSelectionChange={setSelectedTemplates}
          actions={actions}
          searchable
        />
      </Card>

      <Modal
        title={editingTemplate ? 'Edit Template' : 'Create Template'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingTemplate(null);
        }}
        footer={null}
        width={800}
      >
        <EmailTemplateForm
          initialValues={editingTemplate}
          onSubmit={editingTemplate ? handleEdit : handleAdd}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingTemplate(null);
          }}
          loading={formLoading}
        />
      </Modal>

      <Modal
        title="Email Template Preview"
        open={previewVisible}
        onCancel={() => {
          setPreviewVisible(false);
          setPreviewTemplate(null);
        }}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>,
          <Button 
            key="test" 
            type="primary" 
            icon={<MailOutlined />}
            onClick={() => {
              handleSendTest(previewTemplate);
              setPreviewVisible(false);
            }}
          >
            Send Test Email
          </Button>
        ]}
        width={800}
      >
        {previewTemplate && (
          <div className="space-y-4">
            <div>
              <strong>Subject:</strong> {previewTemplate.subject}
            </div>
            <div className="border p-4 rounded bg-white">
              <div dangerouslySetInnerHTML={{ __html: previewTemplate.content }} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmailMarketing; 