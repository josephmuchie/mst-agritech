import React, { useState } from 'react';
import { Table, Tag, Typography, Card, Button, Space } from 'antd';
import { ReloadOutlined, AuditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useGetAuditLogsQuery } from '../../app/apiSlice';
import type { AuditLogResponse } from '../../app/apiSlice';

const { Title } = Typography;

const STATUS_COLOR: Record<number, string> = { 200: 'green', 201: 'green', 400: 'orange', 401: 'red', 403: 'red', 404: 'gold', 500: 'volcano' };

const AuditLogsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const { data, isLoading, isFetching, refetch } = useGetAuditLogsQuery({ page, size: 50 });

  const columns: ColumnsType<AuditLogResponse> = [
    { title: 'Action', dataIndex: 'action', key: 'action', render: (v) => <Tag>{v}</Tag> },
    { title: 'Entity', dataIndex: 'entityType', key: 'entityType' },
    { title: 'Entity ID', dataIndex: 'entityId', key: 'entityId', render: (v) => v ?? '—' },
    { title: 'User ID', dataIndex: 'userId', key: 'userId', render: (v) => v ?? '—' },
    { title: 'IP Address', dataIndex: 'ipAddress', key: 'ipAddress', render: (v) => <code>{v}</code> },
    {
      title: 'Status', dataIndex: 'responseStatus', key: 'responseStatus',
      render: (v) => v != null ? <Tag color={STATUS_COLOR[v] ?? 'default'}>{v}</Tag> : '—',
    },
    { title: 'Timestamp', dataIndex: 'createdAt', key: 'createdAt', render: (v) => new Date(v).toLocaleString() },
  ];

  return (
    <Card
      title={<Space><AuditOutlined /><Title level={4} style={{ margin: 0 }}>Audit Logs</Title></Space>}
      extra={<Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching} />}
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.content ?? []}
        loading={isLoading || isFetching}
        pagination={{ current: page + 1, pageSize: 50, total: data?.totalElements ?? 0, onChange: (p) => setPage(p - 1), showTotal: (t) => `${t} log entries` }}
        size="small"
        scroll={{ x: 900 }}
      />
    </Card>
  );
};

export default AuditLogsPage;
