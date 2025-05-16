import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, ColorPicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';

interface TicketPriority {
  id: number;
  name: string;
  description: string;
  color: string;
  created_at: string;
}

const TicketPriorityManager: React.FC = () => {
  const [priorities, setPriorities] = useState<TicketPriority[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchPriorities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ticket_priorities')
        .select('*')
        .order('name');

      if (error) throw error;
      setPriorities(data || []);
    } catch (error) {
      message.error('Error al cargar las prioridades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriorities();
  }, []);

  const handleSubmit = async (values: { name: string; description: string; color: string }) => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from('ticket_priorities')
          .update(values)
          .eq('id', editingId);

        if (error) throw error;
        message.success('Prioridad actualizada exitosamente');
      } else {
        const { error } = await supabase
          .from('ticket_priorities')
          .insert([values]);

        if (error) throw error;
        message.success('Prioridad creada exitosamente');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      fetchPriorities();
    } catch (error) {
      message.error('Error al guardar la prioridad');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('ticket_priorities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      message.success('Prioridad eliminada exitosamente');
      fetchPriorities();
    } catch (error) {
      message.error('Error al eliminar la prioridad');
    }
  };

  const columns = [
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
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => (
        <div style={{ 
          width: 20, 
          height: 20, 
          backgroundColor: color, 
          borderRadius: '50%',
          border: '1px solid #d9d9d9'
        }} />
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: TicketPriority) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingId(record.id);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="¿Estás seguro de eliminar esta prioridad?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger />
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
        Nueva Prioridad
      </Button>

      <Table
        columns={columns}
        dataSource={priorities}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingId ? 'Editar Prioridad' : 'Nueva Prioridad'}
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
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Descripción"
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="color"
            label="Color"
            rules={[{ required: true, message: 'Por favor seleccione un color' }]}
          >
            <ColorPicker />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Actualizar' : 'Crear'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setEditingId(null);
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TicketPriorityManager; 