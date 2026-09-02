import React, { useState } from 'react';
import {
  Card, Table, Tag, Typography, Space, Button, Spin, Modal, Form, Input, Select, Popconfirm, message, Tooltip,
} from 'antd';
import { LockOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useGetRolesQuery, useGetPermissionsQuery,
  useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation,
  type RoleResponse,
} from '../../app/apiSlice';
import { TABLE_SCROLL } from '../../utils/table';
import { getApiErrorMessage } from '../../utils/apiError';

const { Title } = Typography;

const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'red', FARMER: 'green', BUYER: 'blue', LOGISTICS: 'purple', ANALYST: 'cyan',
};

// Mirrors RoleService.SYSTEM_ROLES on the backend — these names are referenced by literal
// string in @PreAuthorize checks, so they can't be deleted. Disabling it here up front avoids
// a round-trip just to show the same error the backend would return anyway.
const SYSTEM_ROLES = new Set(['ADMIN', 'FARMER', 'BUYER', 'LOGISTICS', 'ANALYST']);

const RolesPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [form] = Form.useForm();

  const { data: roles, isLoading } = useGetRolesQuery();
  const { data: permissions } = useGetPermissionsQuery();
  const [createRole, { isLoading: creating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation();

  const permissionOptions = (permissions ?? []).map((p) => ({
    value: `${p.resource}:${p.action}`,
    label: `${p.resource}:${p.action}`,
  }));

  const openCreate = () => {
    setEditingRole(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (role: RoleResponse) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      if (editingRole) {
        await updateRole({
          id: editingRole.id,
          body: { description: values.description, permissions: values.permissions ?? [] },
        }).unwrap();
        message.success('Role updated');
      } else {
        await createRole({
          name: values.name,
          description: values.description,
          permissions: values.permissions ?? [],
        }).unwrap();
        message.success('Role created');
      }
      setModalOpen(false);
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Failed to save role'));
    }
  };

  const handleDelete = async (role: RoleResponse) => {
    try {
      await deleteRole(role.id).unwrap();
      message.success('Role deleted');
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Failed to delete role'));
    }
  };

  const columns: ColumnsType<RoleResponse> = [
    { title: 'Role', dataIndex: 'name', key: 'name', render: (v) => <Tag color={ROLE_COLOR[v] ?? 'default'}>{v}</Tag> },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Permissions', key: 'permissions',
      render: (_, r) => (r.permissions ?? []).map((p) => <Tag key={p} style={{ marginBottom: 4 }}>{p}</Tag>),
    },
    {
      title: 'Actions', key: 'actions', align: 'center', width: 140,
      render: (_, r) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          {SYSTEM_ROLES.has(r.name) ? (
            <Tooltip title="Built-in role can't be deleted">
              <Button size="small" danger icon={<DeleteOutlined />} disabled />
            </Tooltip>
          ) : (
            <Popconfirm title="Delete this role?" onConfirm={() => handleDelete(r)}>
              <Button size="small" danger icon={<DeleteOutlined />} loading={deleting} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return <div className="page-root"><Spin size="large" /></div>;
  }

  return (
    <div className="page-root">
      <Card
        title={<Space><LockOutlined /><Title level={4} style={{ margin: 0 }}>Roles &amp; Permissions</Title></Space>}
        extra={<Button icon={<PlusOutlined />} type="primary" onClick={openCreate}>New Role</Button>}
      >
        <Table
          rowKey="id"
          dataSource={roles ?? []}
          pagination={false}
          size="middle"
          scroll={TABLE_SCROLL}
          className="responsive-table"
          columns={columns}
        />
      </Card>

      <Modal
        title={editingRole ? `Edit Role — ${editingRole.name}` : 'New Role'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSave()}
        confirmLoading={creating || updating}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true }]}
            extra={editingRole ? "A role's name can't be changed after it's created." : undefined}
          >
            <Input disabled={!!editingRole} placeholder="e.g. WAREHOUSE_MANAGER" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
          <Form.Item name="permissions" label="Permissions">
            <Select mode="multiple" options={permissionOptions} placeholder="Select permissions" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RolesPage;
