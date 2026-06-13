import React, { useState } from 'react';
import {
  Table, Tag, Button, Typography, Card, Popconfirm, message, Modal, Form, Input, Select, Space, Switch,
} from 'antd';
import { UserDeleteOutlined, ReloadOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation,
  useDeactivateUserMutation, useReactivateUserMutation, useDeleteUserMutation,
  useGetRolesQuery,
  type UserResponse,
} from '../../app/apiSlice';
import { TABLE_SCROLL } from '../../utils/table';
import { getApiErrorMessage } from '../../utils/apiError';

const { Title } = Typography;

const ROLE_OPTIONS = ['ADMIN', 'FARMER', 'BUYER', 'LOGISTICS', 'ANALYST'];

const UsersPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading, isFetching, refetch } = useGetUsersQuery({ page, size: 20 });
  const { data: roles } = useGetRolesQuery();
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [deactivate, { isLoading: deactivating }] = useDeactivateUserMutation();
  const [reactivate, { isLoading: reactivating }] = useReactivateUserMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();

  const openCreate = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ roles: ['FARMER'] });
    setModalOpen(true);
  };

  const openEdit = (user: UserResponse) => {
    setEditingUser(user);
    form.setFieldsValue({
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
      active: user.active,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      if (editingUser) {
        await updateUser({
          id: editingUser.id,
          body: {
            fullName: values.fullName,
            roles: values.roles,
            active: values.active,
            password: values.password || undefined,
          },
        }).unwrap();
        message.success('User updated');
      } else {
        await createUser({
          email: values.email,
          fullName: values.fullName,
          password: values.password,
          roles: values.roles,
        }).unwrap();
        message.success('User created');
      }
      setModalOpen(false);
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Failed to save user'));
    }
  };

  const columns: ColumnsType<UserResponse> = [
    { title: 'Name', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Roles', key: 'roles',
      render: (_, r) => r.roles.map((role) => <Tag key={role} color="blue">{role}</Tag>),
    },
    {
      title: 'Status', key: 'active',
      render: (_, r) => r.active ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (v) => new Date(v).toLocaleDateString() },
    {
      title: 'Actions', key: 'actions', align: 'center', width: 200,
      render: (_, r) => (
        <Space size="small" wrap>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          {r.active ? (
            <Popconfirm title="Deactivate this user?" onConfirm={async () => {
              try {
                await deactivate(r.id).unwrap();
                message.success('User deactivated');
              } catch (err) {
                message.error(getApiErrorMessage(err, 'Failed to deactivate user'));
              }
            }}>
              <Button size="small" danger icon={<UserDeleteOutlined />} loading={deactivating} />
            </Popconfirm>
          ) : (
            <Button size="small" type="primary" ghost loading={reactivating}
              onClick={async () => {
                try {
                  await reactivate(r.id).unwrap();
                  message.success('User reactivated');
                } catch (err) {
                  message.error(getApiErrorMessage(err, 'Failed to reactivate user'));
                }
              }}>
              Reactivate
            </Button>
          )}
          <Popconfirm title="Permanently delete this user?" onConfirm={async () => {
            try {
              await deleteUser(r.id).unwrap();
              message.success('User deleted');
            } catch (err) {
              message.error(getApiErrorMessage(err, 'Failed to delete user'));
            }
          }}>
            <Button size="small" danger loading={deleting}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-root">
      <Card
        className="page-card"
        title={<Title level={4} style={{ margin: 0 }}>Users</Title>}
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add User</Button>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching} />
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data?.content ?? []}
          loading={isLoading || isFetching}
          pagination={{
            current: page + 1, pageSize: 20, total: data?.totalElements ?? 0,
            onChange: (p) => setPage(p - 1), showTotal: (t) => `${t} users`,
          }}
          size="middle"
          scroll={TABLE_SCROLL}
          className="responsive-table"
        />
      </Card>

      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSave()}
        confirmLoading={creating || updating}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="fullName" label="Full name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: !editingUser, type: 'email' }]}>
            <Input disabled={!!editingUser} />
          </Form.Item>
          <Form.Item
            name="password"
            label={editingUser ? 'New password (optional)' : 'Password'}
            rules={editingUser ? [] : [{ required: true, min: 8 }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="roles" label="Roles" rules={[{ required: true }]}>
            <Select mode="multiple" options={ROLE_OPTIONS.map((r) => ({ value: r, label: r }))} />
          </Form.Item>
          {editingUser && (
            <Form.Item name="active" label="Active account" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
          {roles && roles.length > 0 && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {roles.length} roles configured in the system
            </Typography.Text>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;
