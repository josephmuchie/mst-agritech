import React from 'react';
import { Card, Table, Tag, Typography, Space, Button, Spin } from 'antd';
import { LockOutlined, PlusOutlined } from '@ant-design/icons';
import { useGetRolesQuery } from '../../app/apiSlice';
import { TABLE_SCROLL } from '../../utils/table';

const { Title } = Typography;

const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'red', FARMER: 'green', BUYER: 'blue', LOGISTICS: 'purple', ANALYST: 'cyan',
};

const RolesPage: React.FC = () => {
  const { data: roles, isLoading } = useGetRolesQuery();

  if (isLoading) {
    return <div className="page-root"><Spin size="large" /></div>;
  }

  return (
    <div className="page-root">
      <Card
        title={<Space><LockOutlined /><Title level={4} style={{ margin: 0 }}>Roles &amp; Permissions</Title></Space>}
        extra={<Button icon={<PlusOutlined />} type="primary" disabled>New Role</Button>}
      >
        <Table
          rowKey="id"
          dataSource={roles ?? []}
          pagination={false}
          size="middle"
          scroll={TABLE_SCROLL}
          className="responsive-table"
          columns={[
            { title: 'Role', dataIndex: 'name', key: 'name', render: (v) => <Tag color={ROLE_COLOR[v] ?? 'default'}>{v}</Tag> },
            { title: 'Description', dataIndex: 'description', key: 'description' },
            {
              title: 'Permissions', key: 'permissions',
              render: (_, r) => (r.permissions ?? []).map((p) => <Tag key={p} style={{ marginBottom: 4 }}>{p}</Tag>),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default RolesPage;
