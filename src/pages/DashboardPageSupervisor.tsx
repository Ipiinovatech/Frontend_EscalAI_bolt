import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ticketService } from '../services/ticketService';
import { TicketStatus, TicketPriority, TicketType } from '../types';
import { useTranslation } from 'react-i18next';
import { Card, Table, Select, Space, Statistic, Row, Col, message } from 'antd';

const { Option } = Select;

const DashboardPageSupervisor: React.FC = () => {
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

  const getStatistics = () => {
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === TicketStatus.OPEN).length;
    const inProgressTickets = tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length;
    const resolvedTickets = tickets.filter(t => t.status === TicketStatus.RESOLVED).length;
    const urgentTickets = tickets.filter(t => t.priority === TicketPriority.URGENT).length;

    return {
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      urgentTickets
    };
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
      title: t('tickets.client'),
      dataIndex: ['client', 'name'],
      key: 'client',
    },
    {
      title: t('tickets.assignedTo'),
      dataIndex: ['assignedUser', 'name'],
      key: 'assignedTo',
    },
    {
      title: t('tickets.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const stats = getStatistics();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{t('dashboard.supervisor.title')}</h1>
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

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('dashboard.stats.totalTickets')}
              value={stats.totalTickets}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('dashboard.stats.openTickets')}
              value={stats.openTickets}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('dashboard.stats.inProgressTickets')}
              value={stats.inProgressTickets}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('dashboard.stats.resolvedTickets')}
              value={stats.resolvedTickets}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('dashboard.stats.urgentTickets')}
              value={stats.urgentTickets}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

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

export default DashboardPageSupervisor; 