import React, { useState } from 'react';
import { Table, Tag, Space, Typography, Input, Card, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useGetBuyersQuery } from '../app/apiSlice';
import type { BuyerResponse } from '../app/apiSlice';

const { Title } = Typography;
const { Search } = Input;

const BUYER_TYPE_COLOR: Record<string, string> = {
  WHOLESALER: 'blue', RETAILER: 'cyan', EXPORTER: 'purple',
  SUPERMARKET: 'green', RESTAURANT: 'orange', OTHER: 'default',
};

const BuyersPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { data, isLoading, isFetching, refetch } = useGetBuyersQuery({ page, size: 20 });

  const filtered = (data?.content ?? []).filter(
    (b) =>
      search === '' ||
      b.companyName.toLowerCase().includes(search.toLowerCase()) ||
      b.countryName?.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<BuyerResponse> = [
    { title: 'Company', dataIndex: 'companyName', key: 'companyName', sorter: (a, b) => a.companyName.localeCompare(b.companyName) },
    { title: 'Type', key: 'buyerType', render: (_, r) => <Tag color={BUYER_TYPE_COLOR[r.buyerType] ?? 'default'}>{r.buyerType}</Tag> },
    { title: 'Country', dataIndex: 'countryName', key: 'countryName' },
    { title: 'Contact Email', dataIndex: 'contactEmail', key: 'contactEmail' },
    { title: 'Phone', dataIndex: 'contactPhone', key: 'contactPhone' },
    {
      title: 'Status', key: 'verified',
      render: (_, r) => r.verified ? <Tag color="green">Verified</Tag> : <Tag color="orange">Pending</Tag>,
    },
  ];

  return (
    <Card
      title={<Title level={4} style={{ margin: 0 }}>Buyers</Title>}
      extra={
        <Space>
          <Search placeholder="Search buyers…" allowClear style={{ width: 240 }} onSearch={setSearch} onChange={(e) => !e.target.value && setSearch('')} />
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching} />
        </Space>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        loading={isLoading || isFetching}
        pagination={{ current: page + 1, pageSize: 20, total: data?.totalElements ?? 0, onChange: (p) => setPage(p - 1), showTotal: (t) => `${t} buyers` }}
        size="middle"
      />
    </Card>
  );
};

export default BuyersPage;
