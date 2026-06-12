import React, { useState } from 'react';
import { Table, Tag, Button, Typography, Card, Popconfirm, message } from 'antd';
import { UserDeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useGetUsersQuery, useDeactivateUserMutation } from '../../app/apiSlice';
import type { UserResponse } from '../../app/apiSlice';

const { Title } = Typography;

const UsersPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const { data, isLoading, isFetching, refetch } = useGetUsersQuery({ page, size: 20 });
  const [deactivate, { isLoading: deactivating }] = useDeactivateUserMutation();

  const handleDeactivate = async (id: number) => {
    try {
      await deactivate(id).unwrap();
      message.success('User deactivated');
    } catch {
      message.error('Failed to deactivate user');
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
      title: 'Actions', key: 'actions', align: 'center',
      render: (_, r) => r.active && (
        <Popconfirm
          title="Deactivate this user?"
          description="They will lose access to the platform."
          onConfirm={() => handleDeactivate(r.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button size="small" danger icon={<UserDeleteOutlined />} loading={deactivating}>
            Deactivate
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card
      title={<Title level={4} style={{ margin: 0 }}>Users</Title>}
      extra={<Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching} />}
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.content ?? []}
        loading={isLoading || isFetching}
        pagination={{ current: page + 1, pageSize: 20, total: data?.totalElements ?? 0, onChange: (p) => setPage(p - 1), showTotal: (t) => `${t} users` }}
        size="middle"
      />
    </Card>
  );
};

export default UsersPage;
