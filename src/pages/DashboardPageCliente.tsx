import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ticketService } from '../services/ticketService';
import { TicketStatus, TicketPriority, TicketType } from '../types';
import { useTranslation } from 'react-i18next';
import { Button, Card, Table, Modal, Form, Input, Select, Upload, message } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

const { TextArea } = Input;
const { Option } = Select;

const DashboardPageCliente: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const data = await ticketService.getTickets();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      message.error(t('errors.fetchTickets'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (values: any) => {
    try {
      const ticketData = {
        ...values,
        files: fileList.map(file => file.originFileObj)
      };
      
      await ticketService.createTicket(ticketData);
      message.success(t('success.ticketCreated'));
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      message.error(t('errors.createTicket'));
    }
  };

  const columns = [
    {
      title: t('tickets.title'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('tickets.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: TicketStatus) => (
        <span className={`status-badge status-${status.toLowerCase()}`}>
          {t(`tickets.status.${status.toLowerCase()}`)}
        </span>
      ),
    },
    {
      title: t('tickets.priority'),
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: TicketPriority) => (
        <span className={`priority-badge priority-${priority.toLowerCase()}`}>
          {t(`tickets.priority.${priority.toLowerCase()}`)}
        </span>
      ),
    },
    {
      title: t('tickets.type'),
      dataIndex: 'type',
      key: 'type',
      render: (type: TicketType) => t(`tickets.type.${type.toLowerCase()}`),
    },
    {
      title: t('tickets.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{t('dashboard.client.title')}</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          {t('tickets.create')}
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={tickets}
          loading={loading}
          rowKey="id"
        />
      </Card>

      <Modal
        title={t('tickets.create')}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTicket}
        >
          <Form.Item
            name="title"
            label={t('tickets.title')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label={t('tickets.description')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="type"
            label={t('tickets.type')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Select>
              <Option value={TicketType.INCIDENT}>{t('tickets.type.incident')}</Option>
              <Option value={TicketType.REQUEST}>{t('tickets.type.request')}</Option>
              <Option value={TicketType.QUESTION}>{t('tickets.type.question')}</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label={t('tickets.priority')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Select>
              <Option value={TicketPriority.LOW}>{t('tickets.priority.low')}</Option>
              <Option value={TicketPriority.MEDIUM}>{t('tickets.priority.medium')}</Option>
              <Option value={TicketPriority.HIGH}>{t('tickets.priority.high')}</Option>
              <Option value={TicketPriority.URGENT}>{t('tickets.priority.urgent')}</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="category"
            label={t('tickets.category')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="subcategory"
            label={t('tickets.subcategory')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={t('tickets.attachments')}
          >
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              multiple
            >
              <Button icon={<UploadOutlined />}>{t('tickets.upload')}</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t('common.submit')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DashboardPageCliente; 