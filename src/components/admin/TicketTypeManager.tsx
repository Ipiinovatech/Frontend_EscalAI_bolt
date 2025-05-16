import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';

interface TicketType {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

const TicketTypeManager: React.FC = () => {
  const { t } = useTranslation();
  const [types, setTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setTypes(data || []);
    } catch (error) {
      message.error(t('errors.loadTicketTypes'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleSubmit = async (values: { name: string; description: string }) => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from('ticket_types')
          .update(values)
          .eq('id', editingId);

        if (error) throw error;
        message.success(t('success.ticketTypeUpdated'));
      } else {
        const { error } = await supabase
          .from('ticket_types')
          .insert([values]);

        if (error) throw error;
        message.success(t('success.ticketTypeCreated'));
      }

      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      fetchTypes();
    } catch (error) {
      message.error(t('errors.saveTicketType'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('ticket_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
      message.success(t('success.ticketTypeDeleted'));
      fetchTypes();
    } catch (error) {
      message.error(t('errors.deleteTicketType'));
    }
  };

  const columns = [
    {
      title: t('ticketTypes.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('ticketTypes.description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: any, record: TicketType) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingId(record.id);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title={t('confirmations.deleteTicketType')}
            onConfirm={() => handleDelete(record.id)}
            okText={t('common.yes')}
            cancelText={t('common.no')}
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          setEditingId(null);
          form.resetFields();
          setModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        {t('ticketTypes.create')}
      </Button>

      <Table
        columns={columns}
        dataSource={types}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingId ? t('ticketTypes.edit') : t('ticketTypes.create')}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label={t('ticketTypes.name')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={t('ticketTypes.description')}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingId ? t('common.update') : t('common.create')}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setEditingId(null);
              }}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TicketTypeManager; 