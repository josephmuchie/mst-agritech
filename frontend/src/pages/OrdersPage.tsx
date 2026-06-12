import React, { useState } from 'react';
import { Table, Tag, Space, Typography, Select, Card, Button, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useGetOrdersQuery, useUpdateOrderStatusMutation } from '../app/apiSlice';
import type { OrderResponse } from '../app/apiSlice';
import { TABLE_SCROLL } from '../utils/table';

const { Title } = Typography;

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'default', PENDING: 'orange', CONFIRMED: 'blue', PROCESSING: 'cyan',
  SHIPPED: 'purple', DELIVERED: 'green', CANCELLED: 'red', DISPUTED: 'volcano',
};
const ORDER_STATUSES = ['DRAFT', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'DISPUTED'];

const OrdersPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { data, isLoading, isFetching, refetch } = useGetOrdersQuery({ page, size: 20, status: statusFilter });
  const [updateStatus] = useUpdateOrderStatusMutation();

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      message.success(`Order updated to ${status}`);
    } catch {
      message.error('Failed to update status');
    }
  };

  const columns: ColumnsType<OrderResponse> = [
    { title: 'Reference', dataIndex: 'reference', key: 'reference', render: (v) => <code>{v}</code> },
    { title: 'Farmer', dataIndex: 'farmerName', key: 'farmerName' },
    { title: 'Buyer', dataIndex: 'buyerCompanyName', key: 'buyerCompanyName' },
    {
      title: 'Amount', key: 'amount', align: 'right',
      render: (_, r) => r.totalAmount != null ? `${r.currencyCode ?? 'USD'} ${Number(r.totalAmount).toLocaleString()}` : '—',
    },
    {
      title: 'Status', key: 'status',
      render: (_, r) => <Tag color={STATUS_COLOR[r.status] ?? 'default'}>{r.status}</Tag>,
    },
    {
      title: 'Update Status', key: 'update', width: 180,
      render: (_, r) => (
        <Select
          size="small" value={r.status} style={{ width: 150 }}
          onChange={(v) => handleStatusChange(r.id, v)}
          options={ORDER_STATUSES.map((s) => ({ value: s, label: s }))}
        />
      ),
    },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (v) => new Date(v).toLocaleDateString() },
  ];

  return (
    <div className="page-root">
    <Card
      title={<Title level={4} style={{ margin: 0 }}>Orders</Title>}
      extra={
        <Space>
          <Select allowClear placeholder="Filter by status" style={{ width: 180 }} onChange={setStatusFilter}
            options={ORDER_STATUSES.map((s) => ({ value: s, label: s }))} />
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching} />
        </Space>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.content ?? []}
        loading={isLoading || isFetching}
        pagination={{ current: page + 1, pageSize: 20, total: data?.totalElements ?? 0, onChange: (p) => setPage(p - 1), showTotal: (t) => `${t} orders` }}
        size="middle"
        scroll={TABLE_SCROLL}
        className="responsive-table"
      />
    </Card>
    </div>
  );
};

export default OrdersPage;
