import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ticketService } from '../services/ticketService';
import { TicketStatus, TicketPriority, TicketType } from '../types';
import { useTranslation } from 'react-i18next';
import { Button, Card, Table, Select, Space, message } from 'antd';

const { Option } = Select;

const DashboardPageAgente: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter]);

  const fetchTickets = async () => {
    try {
      const data = await ticketService.getTickets();
      let filteredData = data;

      if (statusFilter !== 'all') {
        filteredData = filteredData.filter(ticket => ticket.status === statusFilter);
      }

      if (priorityFilter !== 'all') {
        filteredData = filteredData.filter(ticket => ticket.priority === priorityFilter);
      }

      setTickets(filteredData);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      message.error(t('errors.fetchTickets'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      await ticketService.updateTicket(ticketId, { status: newStatus });
      message.success(t('success.ticketUpdated'));
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
      message.error(t('errors.updateTicket'));
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
      render: (status: TicketStatus, record: any) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: 120 }}
        >
          <Option value={TicketStatus.OPEN}>{t('tickets.status.open')}</Option>
          <Option value={TicketStatus.IN_PROGRESS}>{t('tickets.status.in_progress')}</Option>
          <Option value={TicketStatus.WAITING}>{t('tickets.status.waiting')}</Option>
          <Option value={TicketStatus.RESOLVED}>{t('tickets.status.resolved')}</Option>
          <Option value={TicketStatus.CLOSED}>{t('tickets.status.closed')}</Option>
        </Select>
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
      title: t('tickets.client'),
      dataIndex: ['client', 'name'],
      key: 'client',
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
        <h1>{t('dashboard.agent.title')}</h1>
        <Space>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
          >
            <Option value="all">{t('filters.all')}</Option>
            <Option value={TicketStatus.OPEN}>{t('tickets.status.open')}</Option>
            <Option value={TicketStatus.IN_PROGRESS}>{t('tickets.status.in_progress')}</Option>
            <Option value={TicketStatus.WAITING}>{t('tickets.status.waiting')}</Option>
            <Option value={TicketStatus.RESOLVED}>{t('tickets.status.resolved')}</Option>
            <Option value={TicketStatus.CLOSED}>{t('tickets.status.closed')}</Option>
          </Select>

          <Select
            value={priorityFilter}
            onChange={setPriorityFilter}
            style={{ width: 120 }}
          >
            <Option value="all">{t('filters.all')}</Option>
            <Option value={TicketPriority.LOW}>{t('tickets.priority.low')}</Option>
            <Option value={TicketPriority.MEDIUM}>{t('tickets.priority.medium')}</Option>
            <Option value={TicketPriority.HIGH}>{t('tickets.priority.high')}</Option>
            <Option value={TicketPriority.URGENT}>{t('tickets.priority.urgent')}</Option>
          </Select>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={tickets}
          loading={loading}
          rowKey="id"
        />
      </Card>
    </div>
  );
};

export default DashboardPageAgente; 