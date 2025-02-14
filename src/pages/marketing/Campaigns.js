import React, { useState, useEffect } from 'react';
import { Card, Button, Tag, Typography, message, Space, Progress, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '../../services/api';
import DataGrid from '../../components/common/DataGrid';
import CampaignForm from '../../components/marketing/CampaignForm';
import dayjs from 'dayjs';

const { Title } = Typography;

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await api.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      message.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      field: 'name',
      header: 'Campaign Name',
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
          value === 'seasonal' ? 'green' :
          value === 'holiday' ? 'blue' :
          value === 'flash_sale' ? 'orange' :
          'purple'
        }>
          {value.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      field: 'start_date',
      header: 'Start Date',
      sortable: true,
      render: (value) => dayjs(value).format('YYYY-MM-DD'),
    },
    {
      field: 'end_date',
      header: 'End Date',
      sortable: true,
      render: (value) => dayjs(value).format('YYYY-MM-DD'),
    },
    {
      field: 'metrics',
      header: 'Performance',
      render: (metrics) => (
        <Space direction="vertical" size="small">
          <div>Clicks: {metrics.clicks}</div>
          <Progress 
            percent={((metrics.conversions / metrics.clicks) * 100).toFixed(1)} 
            size="small"
          />
        </Space>
      ),
    },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      render: (value) => {
        const colors = {
          draft: 'default',
          active: 'success',
          scheduled: 'processing',
          completed: 'blue',
          cancelled: 'error',
        };
        return (
          <Tag color={colors[value]}>
            {value.toUpperCase()}
          </Tag>
        );
      },
    },
  ];

  const handleAdd = async (values) => {
    try {
      setFormLoading(true);
      await api.createCampaign(values);
      message.success('Campaign created successfully');
      setIsModalVisible(false);
      fetchCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      message.error('Failed to create campaign');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (values) => {
    try {
      setFormLoading(true);
      await api.updateCampaign(editingCampaign, values);
      message.success('Campaign updated successfully');
      setIsModalVisible(false);
      setEditingCampaign(null);
      fetchCampaigns();
    } catch (error) {
      console.error('Error updating campaign:', error);
      message.error('Failed to update campaign');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteCampaign(id);
      message.success('Campaign deleted successfully');
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      message.error('Failed to delete campaign');
    }
  };

  const actions = (
    <div className='flex gap-2 flex-wrap items-center justify-between mt-2'>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalVisible(true)}
      >
        Create Campaign
      </Button>
      {selectedCampaigns.length > 0 && (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingCampaign(selectedCampaigns[0]);
              setIsModalVisible(true);
            }}
            disabled={selectedCampaigns.length !== 1}
          >
            Edit Selected
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Are you sure you want to delete the selected campaigns?',
                content: 'This action cannot be undone.',
                onOk: () => Promise.all(selectedCampaigns.map(c => handleDelete(c.id))),
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
      <Title level={2}>Campaign Management</Title>
      <Card>
        <DataGrid
          columns={columns}
          data={campaigns}
          loading={loading}
          selectable
          onSelectionChange={setSelectedCampaigns}
          actions={actions}
          searchable
        />
      </Card>

      <Modal
        title={editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingCampaign(null);
        }}
        footer={null}
        width={800}
      >
        <CampaignForm
          initialValues={editingCampaign}
          onSubmit={editingCampaign ? handleEdit : handleAdd}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingCampaign(null);
          }}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default Campaigns; 