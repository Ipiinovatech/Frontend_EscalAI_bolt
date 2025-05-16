import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ticketService } from '../services/ticketService';
import { User, UserRoleType, UserRoleAssignment, ProfileStatus, TicketStatus, TicketPriority, TicketType, UserRole } from '../types';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Table, 
  Select, 
  Space, 
  Statistic, 
  Row, 
  Col, 
  message, 
  Button, 
  Modal, 
  Form, 
  Input,
  Tabs 
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, UserAddOutlined, LinkOutlined, DeleteOutlined } from '@ant-design/icons';
import TicketSettingsManager from '../components/admin/TicketSettingsManager';
import { supabase, supabaseAdmin } from '../lib/supabase';

const { Option } = Select;
const { useForm } = Form;
const { TabPane } = Tabs;

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: ProfileStatus;
  client_id: string | null;
  avatar_url: string | null;
  language: string;
}

const DashboardPageAdmin: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = useForm();
  const [clients, setClients] = useState<any[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsModalOpen, setClientsModalOpen] = useState(false);
  const [createClientModalOpen, setCreateClientModalOpen] = useState(false);
  const [clientForm] = useForm();
  const [assignClientModalOpen, setAssignClientModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [assignClientForm] = useForm();
  const [userRoles, setUserRoles] = useState<UserRoleType[]>([]);
  const [userRoleModalVisible, setUserRoleModalVisible] = useState(false);
  const [editingUserRole, setEditingUserRole] = useState<UserRoleType | null>(null);
  const [userRoleForm] = useForm();
  const [editUserModalVisible, setEditUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editUserForm] = useForm();

  useEffect(() => {
    fetchData();
    fetchClients();
    fetchUserRoles();
  }, [statusFilter, priorityFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketsData, usersData] = await Promise.all([
        ticketService.getTickets(),
        supabaseAdmin
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      let filteredTickets = ticketsData || [];

      if (statusFilter !== 'all') {
        filteredTickets = filteredTickets.filter(ticket => ticket.status === statusFilter);
      }

      if (priorityFilter !== 'all') {
        filteredTickets = filteredTickets.filter(ticket => ticket.priority === priorityFilter);
      }

      // Obtener los roles y clientes por separado
      const users = usersData.data || [];
      const usersWithRelations = await Promise.all(
        users.map(async (user) => {
          // Obtener el rol
          const { data: roleData } = await supabaseAdmin
            .from('user_role_assignments')
            .select('user_roles(name)')
            .eq('user_id', user.id)
            .single();

          // Obtener el cliente
          const { data: clientData } = await supabaseAdmin
            .from('clients')
            .select('*')
            .eq('id', user.client_id)
            .single();

          return {
            ...user,
            role: roleData?.user_roles?.name || user.role,
            client: clientData || null
          };
        })
      );

      setTickets(filteredTickets);
      setUsers(usersWithRelations);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error(t('errors.fetchData'));
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    setClientsLoading(true);
    const { data, error } = await supabase.from('clients').select('*');
    if (!error) setClients(data || []);
    setClientsLoading(false);
  };

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name');

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      message.error('Error al cargar los roles de usuario');
    }
  };

  const handleCreateUser = async (values: any) => {
    try {
      // Primero verificar que el rol existe
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .eq('id', values.role_id)
        .single();

      if (roleError) throw roleError;
      if (!roleData) throw new Error('Role not found');

      // Create auth user using regular client
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
            role_id: values.role_id
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user data returned');

      // Create profile with role name from user_roles using admin client
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          name: values.name,
          role: roleData.name, // Usar el nombre del rol de la tabla user_roles
          avatar_url: values.avatar_url || null,
          language: values.language || 'es',
          client_id: null,
          status: 'active' as ProfileStatus
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw profileError;
      }

      // Create role assignment using admin client
      const { error: assignmentError } = await supabaseAdmin
        .from('user_role_assignments')
        .insert({
          user_id: authData.user.id,
          role_id: values.role_id
        });

      if (assignmentError) {
        console.error('Error creating role assignment:', assignmentError);
        // Si falla la asignación de rol, intentamos eliminar el perfil
        await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', authData.user.id);
        throw assignmentError;
      }

      message.success(t('success.userCreated'));
      setIsModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error('Error creating user:', error);
      message.error(error instanceof Error ? error.message : t('errors.createUser'));
    }
  };

  const handleAssignClient = async (values: any) => {
    try {
      // Get role data from user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('id', values.role_id)
        .single();

      if (roleError) throw roleError;
      if (!roleData) throw new Error('Role not found');

      // Update profile with new client and role name
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          client_id: values.clientId,
          role: roleData.name // Use the role name from user_roles
        })
        .eq('id', selectedUserId);

      if (profileError) throw profileError;

      // Update role assignment
      const { error: assignmentError } = await supabase
        .from('user_role_assignments')
        .upsert([{
          user_id: selectedUserId,
          role_id: values.role_id
        }]);

      if (assignmentError) throw assignmentError;

      message.success('Cliente y rol asignados correctamente');
      setAssignClientModalOpen(false);
      assignClientForm.resetFields();
      fetchData();
    } catch (error) {
      console.error('Error assigning client:', error);
      message.error('Error al asignar cliente');
    }
  };

  const handleStatusChange = async (userId: string, newStatus: ProfileStatus) => {
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      message.success('Estado actualizado correctamente');
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Error al actualizar estado');
    }
  };

  const handleCreateClient = async (values: any) => {
    const { error } = await supabase.from('clients').insert([
      {
        name: values.name,
        plan: values.plan,
        status: values.status,
      }
    ]);
    if (!error) {
      message.success('Cliente creado');
      setCreateClientModalOpen(false);
      clientForm.resetFields();
      fetchClients();
    } else {
      message.error('Error al crear cliente');
    }
  };

  const handleUserRoleSubmit = async (values: any) => {
    try {
      if (editingUserRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({
            name: values.name,
            description: values.description
          })
          .eq('id', editingUserRole.id);

        if (error) throw error;
        message.success('Rol actualizado correctamente');
      } else {
        // Create new role
        const { error } = await supabase
          .from('user_roles')
          .insert([{
            name: values.name,
            description: values.description
          }]);

        if (error) throw error;
        message.success('Rol creado correctamente');
      }

      setUserRoleModalVisible(false);
      userRoleForm.resetFields();
      fetchUserRoles();
    } catch (error) {
      console.error('Error saving user role:', error);
      message.error('Error al guardar el rol');
    }
  };

  const handleUserRoleDelete = async (id: string) => {
    try {
      // Check if role is assigned to any users using admin client
      const { data: assignments, error: checkError } = await supabaseAdmin
        .from('user_role_assignments')
        .select('id')
        .eq('role_id', id);

      if (checkError) throw checkError;

      if (assignments && assignments.length > 0) {
        message.error('No se puede eliminar un rol que está asignado a usuarios');
        return;
      }

      // Delete role using admin client
      const { error } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      message.success('Rol eliminado correctamente');
      fetchUserRoles();
    } catch (error) {
      console.error('Error deleting user role:', error);
      message.error('Error al eliminar el rol');
    }
  };

  const handleEditUser = async (values: any) => {
    try {
      if (!editingUser) return;

      // Get role data from user_roles table
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .eq('id', values.role_id)
        .single();

      if (roleError) throw roleError;
      if (!roleData) throw new Error('Role not found');

      // Update profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          name: values.name,
          role: roleData.name,
          status: values.status,
          avatar_url: values.avatar_url,
          language: values.language,
          client_id: values.client_id
        })
        .eq('id', editingUser.id);

      if (profileError) throw profileError;

      // Delete existing role assignments
      const { error: deleteError } = await supabaseAdmin
        .from('user_role_assignments')
        .delete()
        .eq('user_id', editingUser.id);

      if (deleteError) throw deleteError;

      // Create new role assignment
      const { error: assignmentError } = await supabaseAdmin
        .from('user_role_assignments')
        .insert([{
          user_id: editingUser.id,
          role_id: values.role_id
        }]);

      if (assignmentError) throw assignmentError;

      message.success('Usuario actualizado correctamente');
      setEditUserModalVisible(false);
      editUserForm.resetFields();
      fetchData();
    } catch (error) {
      console.error('Error updating user:', error);
      message.error('Error al actualizar usuario');
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
        <span className={`status-badge status-${status?.toLowerCase() || 'unknown'}`}>
          {t(`tickets.status.${status?.toLowerCase() || 'unknown'}`)}
        </span>
      ),
    },
    {
      title: t('tickets.priority'),
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: TicketPriority) => (
        <span className={`priority-badge priority-${priority?.toLowerCase() || 'unknown'}`}>
          {t(`tickets.priority.${priority?.toLowerCase() || 'unknown'}`)}
        </span>
      ),
    },
    {
      title: t('tickets.type'),
      dataIndex: 'type',
      key: 'type',
      render: (type: TicketType) => t(`tickets.type.${type?.toLowerCase() || 'unknown'}`),
    },
    {
      title: t('tickets.client'),
      dataIndex: ['client', 'name'],
      key: 'client',
      render: (text: string) => text || '-',
    },
    {
      title: t('tickets.assignedTo'),
      dataIndex: ['assignedUser', 'name'],
      key: 'assignedTo',
      render: (text: string) => text || '-',
    },
    {
      title: t('tickets.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
  ];

  const userColumns: ColumnsType<any> = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => t(`users.roles.${role}`),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProfileStatus, record: any) => (
        <Select
          value={status}
          style={{ width: 120 }}
          onChange={(value: ProfileStatus) => handleStatusChange(record.id, value)}
          options={[
            { value: 'active', label: 'Activo' },
            { value: 'inactive', label: 'Inactivo' },
            { value: 'suspended', label: 'Suspendido' }
          ]}
        />
      ),
    },
    {
      title: 'Cliente',
      dataIndex: ['client', 'name'],
      key: 'client',
      render: (text: string) => text || '-',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingUser(record);
              editUserForm.setFieldsValue({
                name: record.name,
                role_id: record.role_id,
                status: record.status,
                avatar_url: record.avatar_url,
                language: record.language,
                client_id: record.client_id
              });
              setEditUserModalVisible(true);
            }}
          >
            Editar
          </Button>
          <Button
            type="link"
            icon={<LinkOutlined />}
            onClick={() => {
              setSelectedUserId(record.id);
              setSelectedClientId(record.client?.id || null);
              setAssignClientModalOpen(true);
            }}
          >
            Asignar Cliente
          </Button>
        </Space>
      ),
    },
  ];

  const userRoleColumns: ColumnsType<UserRoleType> = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingUserRole(record);
              userRoleForm.setFieldsValue(record);
              setUserRoleModalVisible(true);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleUserRoleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const getStatistics = () => {
    return {
      totalTickets: tickets.length,
      openTickets: tickets.filter(t => t.status === TicketStatus.OPEN).length,
      inProgressTickets: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
      resolvedTickets: tickets.filter(t => t.status === TicketStatus.RESOLVED).length,
      urgentTickets: tickets.filter(t => t.priority === TicketPriority.HIGH).length,
      totalUsers: users.length,
      activeAgents: users.filter(u => u.role === 'agent').length,
    };
  };

  const stats = getStatistics();

  const renderUserRoleManagement = () => (
    <Card title="Gestión de Roles de Usuario" extra={
      <Button type="primary" onClick={() => {
        setEditingUserRole(null);
        userRoleForm.resetFields();
        setUserRoleModalVisible(true);
      }}>
        <PlusOutlined /> Nuevo Rol
      </Button>
    }>
      <Table
        dataSource={userRoles}
        columns={userRoleColumns}
        rowKey="id"
      />

      <Modal
        title={editingUserRole ? 'Editar Rol' : 'Nuevo Rol'}
        open={userRoleModalVisible}
        onCancel={() => setUserRoleModalVisible(false)}
        footer={null}
      >
        <Form
          form={userRoleForm}
          onFinish={handleUserRoleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre del rol' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Descripción"
            rules={[{ required: true, message: 'Por favor ingrese la descripción del rol' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingUserRole ? 'Actualizar' : 'Crear'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );

  const tabItems = [
    {
      key: '1',
      label: 'Dashboard',
      children: (
        <>
          <Card title="Usuarios" style={{ marginBottom: 24 }}>
            <Table
              columns={userColumns}
              dataSource={users}
              rowKey="id"
              loading={loading}
            />
          </Card>

          <Card>
            <Table
              columns={columns}
              dataSource={tickets}
              rowKey="id"
              loading={loading}
            />
          </Card>
        </>
      ),
    },
    {
      key: '2',
      label: 'Tipos de Ticket',
      children: (
        <Card>
          <TicketSettingsManager />
        </Card>
      ),
    },
    {
      key: '3',
      label: 'Roles de Usuario',
      children: renderUserRoleManagement(),
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{t('dashboard.admin.title')}</h1>
        <Space>
          <Button
            type="dashed"
            icon={<UserAddOutlined />}
            onClick={() => setCreateClientModalOpen(true)}
          >
            Crear Cliente
          </Button>
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => setClientsModalOpen(true)}
          >
            Gestionar Clientes
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            {t('users.create')}
          </Button>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            allowClear
            placeholder={t('filters.selectStatus')}
            options={[
              { value: 'all', label: t('filters.all') },
              { value: TicketStatus.OPEN, label: t('tickets.status.open') },
              { value: TicketStatus.IN_PROGRESS, label: t('tickets.status.in_progress') },
              { value: TicketStatus.RESOLVED, label: t('tickets.status.resolved') },
              { value: TicketStatus.CLOSED, label: t('tickets.status.closed') }
            ]}
          />

          <Select
            value={priorityFilter}
            onChange={setPriorityFilter}
            style={{ width: 120 }}
            allowClear
            placeholder={t('filters.selectPriority')}
            options={[
              { value: 'all', label: t('filters.all') },
              { value: TicketPriority.LOW, label: t('tickets.priority.low') },
              { value: TicketPriority.MEDIUM, label: t('tickets.priority.medium') },
              { value: TicketPriority.HIGH, label: t('tickets.priority.high') }
            ]}
          />
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { title: t('dashboard.stats.totalTickets'), value: stats.totalTickets, color: undefined },
          { title: t('dashboard.stats.openTickets'), value: stats.openTickets, color: '#cf1322' },
          { title: t('dashboard.stats.inProgressTickets'), value: stats.inProgressTickets, color: '#1890ff' },
          { title: t('dashboard.stats.resolvedTickets'), value: stats.resolvedTickets, color: '#3f8600' },
          { title: t('dashboard.stats.urgentTickets'), value: stats.urgentTickets, color: '#cf1322' },
          { title: t('dashboard.stats.totalUsers'), value: stats.totalUsers, color: undefined },
          { title: t('dashboard.stats.activeAgents'), value: stats.activeAgents, color: '#1890ff' }
        ].map((stat, index) => (
          <Col span={3} key={`stat-${index}`}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                valueStyle={stat.color ? { color: stat.color } : undefined}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Tabs defaultActiveKey="1" items={tabItems} />

      <Modal
        title={t('users.create')}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleCreateUser}
          layout="vertical"
          initialValues={{
            language: 'es'
          }}
        >
          <Form.Item
            name="name"
            label={t('users.name')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label={t('users.email')}
            rules={[
              { required: true, message: t('validation.required') },
              { type: 'email', message: t('validation.email') }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('users.password')}
            rules={[
              { required: true, message: t('validation.required') },
              { min: 6, message: t('validation.passwordLength') }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="role_id"
            label={t('users.role')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Select>
              {userRoles.map(role => (
                <Option key={role.id} value={role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="avatar_url"
            label={t('users.avatarUrl')}
          >
            <Input placeholder="https://example.com/avatar.jpg" />
          </Form.Item>
          <Form.Item
            name="language"
            label={t('users.language')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Select>
              <Option value="es">Español</Option>
              <Option value="en">English</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t('common.create')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Gestionar Clientes"
        open={clientsModalOpen}
        onCancel={() => setClientsModalOpen(false)}
        footer={null}
        width={700}
      >
        <Table
          dataSource={clients}
          loading={clientsLoading}
          rowKey="id"
          columns={[
            { title: 'ID', dataIndex: 'id', key: 'id' },
            { title: 'Nombre', dataIndex: 'name', key: 'name' },
            { title: 'Plan', dataIndex: 'plan', key: 'plan' },
            { 
              title: 'Estado', 
              dataIndex: 'status', 
              key: 'status',
              render: (status: string, record: any) => (
                <Select
                  value={status}
                  style={{ minWidth: 120 }}
                  onChange={(val: string) => handleStatusChange(record.id, val as 'active' | 'inactive' | 'suspended')}
                  options={[
                    { value: 'active', label: 'Activo' },
                    { value: 'inactive', label: 'Inactivo' },
                    { value: 'suspended', label: 'Suspendido' }
                  ]}
                />
              )
            },
            { 
              title: 'Creado', 
              dataIndex: 'created_at', 
              key: 'created_at', 
              render: (date: string) => date ? new Date(date).toLocaleDateString() : '-' 
            },
            { 
              title: 'Actualizado', 
              dataIndex: 'updated_at', 
              key: 'updated_at', 
              render: (date: string) => date ? new Date(date).toLocaleDateString() : '-' 
            },
          ]}
        />
      </Modal>

      <Modal
        title="Crear Cliente"
        open={createClientModalOpen}
        onCancel={() => setCreateClientModalOpen(false)}
        footer={null}
      >
        <Form
          form={clientForm}
          layout="vertical"
          onFinish={handleCreateClient}
        >
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: 'El nombre es obligatorio' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="plan"
            label="Plan"
            rules={[{ required: true, message: 'El plan es obligatorio' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="Estado"
            rules={[{ required: true, message: 'El estado es obligatorio' }]}
          >
            <Select
              options={[
                { value: 'active', label: 'Activo' },
                { value: 'inactive', label: 'Inactivo' },
                { value: 'suspended', label: 'Suspendido' }
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Crear</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Asignar Cliente"
        open={assignClientModalOpen}
        onCancel={() => setAssignClientModalOpen(false)}
        footer={null}
      >
        <Form
          form={assignClientForm}
          layout="vertical"
          onFinish={handleAssignClient}
          initialValues={{ 
            clientId: selectedClientId,
            role_id: users.find(u => u.id === selectedUserId)?.role
          }}
        >
          <Form.Item
            name="clientId"
            label="Cliente"
            rules={[{ required: true, message: 'Seleccione un cliente' }]}
          >
            <Select>
              {clients.map(client => (
                <Option key={client.id} value={client.id}>{client.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="role_id"
            label="Rol"
            rules={[{ required: true, message: 'Seleccione un rol' }]}
          >
            <Select>
              {userRoles.map(role => (
                <Option key={role.id} value={role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Asignar
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Editar Usuario"
        open={editUserModalVisible}
        onCancel={() => setEditUserModalVisible(false)}
        footer={null}
      >
        <Form
          form={editUserForm}
          onFinish={handleEditUser}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: 'El nombre es obligatorio' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="role_id"
            label="Rol"
            rules={[{ required: true, message: 'El rol es obligatorio' }]}
          >
            <Select>
              {userRoles.map(role => (
                <Option key={role.id} value={role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Estado"
            rules={[{ required: true, message: 'El estado es obligatorio' }]}
          >
            <Select>
              <Option value="active">Activo</Option>
              <Option value="inactive">Inactivo</Option>
              <Option value="suspended">Suspendido</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="client_id"
            label="Cliente"
          >
            <Select allowClear>
              {clients.map(client => (
                <Option key={client.id} value={client.id}>
                  {client.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="avatar_url"
            label="URL del Avatar"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="language"
            label="Idioma"
            rules={[{ required: true, message: 'El idioma es obligatorio' }]}
          >
            <Select>
              <Option value="es">Español</Option>
              <Option value="en">English</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Actualizar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DashboardPageAdmin;