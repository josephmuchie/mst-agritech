import React from 'react';
import { Card, Table, Tag, Typography, Space, Button } from 'antd';
import { LockOutlined, PlusOutlined } from '@ant-design/icons';
import { TABLE_SCROLL } from '../../utils/table';

const { Title } = Typography;

const ROLES = [
  { id: 1, name: 'ADMIN', description: 'Full system access', permissions: ['users:read', 'users:write', 'orders:all', 'reports:all', 'settings:all'] },
  { id: 2, name: 'FARMER', description: 'Manage own farm and view orders', permissions: ['farmers:write', 'orders:read', 'products:write'] },
  { id: 3, name: 'BUYER', description: 'Browse marketplace and place orders', permissions: ['marketplace:read', 'orders:write', 'payments:read'] },
  { id: 4, name: 'LOGISTICS', description: 'Update shipment and order status', permissions: ['shipments:write', 'orders:status'] },
  { id: 5, name: 'ANALYST', description: 'Read-only access to reports and analytics', permissions: ['reports:read', 'analytics:read', 'orders:read', 'farmers:read'] },
];

const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'red', FARMER: 'green', BUYER: 'blue', LOGISTICS: 'purple', ANALYST: 'cyan',
};

const RolesPage: React.FC = () => (
  <div className="page-root">
    <Card
      title={<Space><LockOutlined /><Title level={4} style={{ margin: 0 }}>Roles &amp; Permissions</Title></Space>}
      extra={<Button icon={<PlusOutlined />} type="primary" disabled>New Role</Button>}
    >
      <Table
        rowKey="id"
        dataSource={ROLES}
        pagination={false}
        size="middle"
        scroll={TABLE_SCROLL}
        className="responsive-table"
        columns={[
          { title: 'Role', dataIndex: 'name', key: 'name', render: (v) => <Tag color={ROLE_COLOR[v] ?? 'default'}>{v}</Tag> },
          { title: 'Description', dataIndex: 'description', key: 'description' },
          {
            title: 'Permissions', key: 'permissions',
            render: (_, r) => r.permissions.map((p) => <Tag key={p} style={{ marginBottom: 4 }}>{p}</Tag>),
          },
        ]}
      />
    </Card>
  </div>
);

export default RolesPage;
