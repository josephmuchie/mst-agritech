import React, { useState } from 'react';
import { Table, Tag, Button, Space, Typography, Input, Card, Tooltip, message } from 'antd';
import { CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useGetFarmersQuery, useVerifyFarmerMutation } from '../app/apiSlice';
import type { FarmerResponse } from '../app/apiSlice';

const { Title } = Typography;
const { Search } = Input;

const FarmersPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { data, isLoading, isFetching, refetch } = useGetFarmersQuery({ page, size: 20 });
  const [verifyFarmer, { isLoading: verifying }] = useVerifyFarmerMutation();

  const handleVerify = async (id: number) => {
    try {
      await verifyFarmer(id).unwrap();
      message.success('Farmer verified successfully');
    } catch {
      message.error('Failed to verify farmer');
    }
  };

  const filtered = (data?.content ?? []).filter(
    (f) =>
      search === '' ||
      f.fullName.toLowerCase().includes(search.toLowerCase()) ||
      f.farmName.toLowerCase().includes(search.toLowerCase()) ||
      f.countryName.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<FarmerResponse> = [
    { title: 'Farmer', dataIndex: 'fullName', key: 'fullName', sorter: (a, b) => a.fullName.localeCompare(b.fullName) },
    { title: 'Farm Name', dataIndex: 'farmName', key: 'farmName' },
    { title: 'Province', dataIndex: 'province', key: 'province' },
    { title: 'Country', key: 'country', render: (_, r) => <Tag>{r.countryCode}</Tag> },
    {
      title: 'Hectares', dataIndex: 'totalHectares', key: 'totalHectares', align: 'right',
      render: (v) => v != null ? `${Number(v).toLocaleString()} ha` : '—',
    },
    {
      title: 'Status', key: 'verified',
      render: (_, r) => r.verified
        ? <Tag color="green" icon={<CheckCircleOutlined />}>Verified</Tag>
        : <Tag color="orange">Pending</Tag>,
      filters: [{ text: 'Verified', value: true }, { text: 'Pending', value: false }],
      onFilter: (value, r) => r.verified === value,
    },
    {
      title: 'Actions', key: 'actions', align: 'center',
      render: (_, r) => !r.verified && (
        <Tooltip title="Mark as verified">
          <Button
            size="small" type="primary" icon={<CheckCircleOutlined />}
            loading={verifying}
            onClick={() => handleVerify(r.id)}
          >Verify</Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <Card
      title={<Title level={4} style={{ margin: 0 }}>Farmers</Title>}
      extra={
        <Space>
          <Search placeholder="Search farmers…" allowClear style={{ width: 240 }} onSearch={setSearch} onChange={(e) => !e.target.value && setSearch('')} />
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching} />
        </Space>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        loading={isLoading || isFetching}
        pagination={{
          current: page + 1,
          pageSize: 20,
          total: data?.totalElements ?? 0,
          onChange: (p) => setPage(p - 1),
          showTotal: (t) => `${t} farmers`,
        }}
        size="middle"
      />
    </Card>
  );
};

export default FarmersPage;
