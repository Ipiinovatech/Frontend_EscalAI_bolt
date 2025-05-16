import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';

interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  description: string;
  created_at: string;
}

const TicketCategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('categories');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ticket_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      message.error('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ticket_subcategories')
        .select('*, ticket_categories(name)')
        .order('name');

      if (error) throw error;
      setSubcategories(data || []);
    } catch (error) {
      message.error('Error al cargar las subcategorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const handleCategorySubmit = async (values: { name: string; description: string }) => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from('ticket_categories')
          .update(values)
          .eq('id', editingId);

        if (error) throw error;
        message.success('Categoría actualizada exitosamente');
      } else {
        const { error } = await supabase
          .from('ticket_categories')
          .insert([values]);

        if (error) throw error;
        message.success('Categoría creada exitosamente');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      message.error('Error al guardar la categoría');
    }
  };

  const handleSubcategorySubmit = async (values: { category_id: number; name: string; description: string }) => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from('ticket_subcategories')
          .update(values)
          .eq('id', editingId);

        if (error) throw error;
        message.success('Subcategoría actualizada exitosamente');
      } else {
        const { error } = await supabase
          .from('ticket_subcategories')
          .insert([values]);

        if (error) throw error;
        message.success('Subcategoría creada exitosamente');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      fetchSubcategories();
    } catch (error) {
      message.error('Error al guardar la subcategoría');
    }
  };

  const handleCategoryDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('ticket_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      message.success('Categoría eliminada exitosamente');
      fetchCategories();
      fetchSubcategories();
    } catch (error) {
      message.error('Error al eliminar la categoría');
    }
  };

  const handleSubcategoryDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('ticket_subcategories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      message.success('Subcategoría eliminada exitosamente');
      fetchSubcategories();
    } catch (error) {
      message.error('Error al eliminar la subcategoría');
    }
  };

  const categoryColumns = [
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
      render: (_: any, record: Category) => (
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
            title="¿Estás seguro de eliminar esta categoría?"
            onConfirm={() => handleCategoryDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const subcategoryColumns = [
    {
      title: 'Categoría',
      dataIndex: ['ticket_categories', 'name'],
      key: 'category_name',
    },
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
      render: (_: any, record: Subcategory) => (
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
            title="¿Estás seguro de eliminar esta subcategoría?"
            onConfirm={() => handleSubcategoryDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const items = [
    {
      key: 'categories',
      label: 'Categorías',
      children: (
        <>
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
            Nueva Categoría
          </Button>
          <Table
            columns={categoryColumns}
            dataSource={categories}
            rowKey="id"
            loading={loading}
          />
        </>
      ),
    },
    {
      key: 'subcategories',
      label: 'Subcategorías',
      children: (
        <>
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
            Nueva Subcategoría
          </Button>
          <Table
            columns={subcategoryColumns}
            dataSource={subcategories}
            rowKey="id"
            loading={loading}
          />
        </>
      ),
    },
  ];

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
      />

      <Modal
        title={
          activeTab === 'categories'
            ? (editingId ? 'Editar Categoría' : 'Nueva Categoría')
            : (editingId ? 'Editar Subcategoría' : 'Nueva Subcategoría')
        }
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
          onFinish={activeTab === 'categories' ? handleCategorySubmit : handleSubcategorySubmit}
          layout="vertical"
        >
          {activeTab === 'subcategories' && (
            <Form.Item
              name="category_id"
              label="Categoría"
              rules={[{ required: true, message: 'Por favor seleccione una categoría' }]}
            >
              <Input.Select>
                {categories.map(category => (
                  <Input.Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Input.Select.Option>
                ))}
              </Input.Select>
            </Form.Item>
          )}
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

export default TicketCategoryManager; 