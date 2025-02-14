import React, { useState, useEffect } from "react";
import {
  Tabs,
  Card,
  Typography,
  Tag,
  Timeline,
  Table,
  Button,
  message,
  Descriptions,
  Space,
} from "antd";
import {
  UserOutlined,
  HistoryOutlined,
  MessageOutlined,
  UsergroupAddOutlined,
  MailOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { api } from "../services/api";
import { useParams, useNavigate, Link } from "react-router-dom";
import dayjs from "dayjs";

const { Title } = Typography;
const { TabPane } = Tabs;

const CustomerDetails = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [communications, setCommunications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const customerData = await api.getUser(id);
      const customerOrders = await api.getCustomerOrders(id);
      const customerComms = await api.getCustomerCommunications(id);

      setCustomer(customerData);
      setOrders(customerOrders);
      setCommunications(customerComms);
    } catch (error) {
      message.error("Failed to load customer data");
    } finally {
      setLoading(false);
    }
  };

  const orderColumns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <a>{text.slice(0, 8)}</a>,
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => dayjs(date).format("YYYY-MM-DD"),
    },
    {
      title: "Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (amount) => `$${amount.toFixed(2)}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "delivered"
              ? "success"
              : status === "pending"
              ? "warning"
              : "processing"
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Link
      variant="link"
        to={"/customers"}
        className="mr-4"

      >
       <ArrowLeftOutlined /> Back to Customers
      </Link>
      <div className="flex items-center my-4">
        <Title level={2} className="mb-0">
          Customer Profile
        </Title>
      </div>

      <Card loading={loading}>
        <Tabs defaultActiveKey="profile">
          <TabPane
            tab={
              <span>
                <UserOutlined />
                Profile
              </span>
            }
            key="profile"
          >
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Full Name">
                {customer?.full_name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {customer?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {customer?.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={customer?.status === "active" ? "success" : "error"}
                >
                  {customer?.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                {customer?.address}
              </Descriptions.Item>
              <Descriptions.Item label="Join Date">
                {dayjs(customer?.created_at).format("YYYY-MM-DD")}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane
            tab={
              <span>
                <HistoryOutlined />
                Purchase History
              </span>
            }
            key="purchases"
          >
            <Table
              columns={orderColumns}
              dataSource={orders}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <MessageOutlined />
                Communication Log
              </span>
            }
            key="communications"
          >
            <Timeline>
              {communications.map((comm) => (
                <Timeline.Item key={comm.id}>
                  <p>
                    <strong>
                      {dayjs(comm.date).format("YYYY-MM-DD HH:mm")}
                    </strong>
                  </p>
                  <p>
                    <Tag>{comm.type}</Tag>
                  </p>
                  <p>{comm.message}</p>
                </Timeline.Item>
              ))}
            </Timeline>

            <Button
              type="primary"
              icon={<MailOutlined />}
              onClick={() => message.info("Email feature coming soon!")}
            >
              Send Email
            </Button>
          </TabPane>

          <TabPane
            tab={
              <span>
                <UsergroupAddOutlined />
                Segmentation
              </span>
            }
            key="segmentation"
          >
            <Space direction="vertical" className="w-full">
              <Card title="Customer Segments" size="small">
                {customer?.segments?.map((segment) => (
                  <Tag key={segment} color="blue">
                    {segment}
                  </Tag>
                )) || "No segments assigned"}
              </Card>

              <Card title="Customer Metrics" size="small">
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Total Orders">
                    {orders.length}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Spent">
                    $
                    {orders
                      .reduce((sum, order) => sum + order.total_amount, 0)
                      .toFixed(2)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Average Order Value">
                    $
                    {(
                      orders.reduce(
                        (sum, order) => sum + order.total_amount,
                        0
                      ) / (orders.length || 1)
                    ).toFixed(2)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Purchase">
                    {orders.length
                      ? dayjs(orders[0].created_at).format("YYYY-MM-DD")
                      : "Never"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Space>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default CustomerDetails;
