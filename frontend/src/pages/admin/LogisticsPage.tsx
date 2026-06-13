import React from 'react';
import { Card, Table, Tag, Typography, Space, Avatar, Spin } from 'antd';
import { TruckOutlined } from '@ant-design/icons';
import { useGetLogisticsCompaniesQuery } from '../../app/apiSlice';
import { TABLE_SCROLL } from '../../utils/table';

const { Title } = Typography;

const TYPE_COLOR: Record<string, string> = { AIR: 'blue', SEA: 'cyan', ROAD: 'green', COLD_CHAIN: 'purple', MULTIMODAL: 'purple' };

const LogisticsPage: React.FC = () => {
  const { data: companies, isLoading } = useGetLogisticsCompaniesQuery();

  if (isLoading) {
    return <div className="page-root"><Spin size="large" /></div>;
  }

  return (
    <div className="page-root">
      <Card title={<Space><TruckOutlined /><Title level={4} style={{ margin: 0 }}>Logistics Companies</Title></Space>}>
        <Table
          rowKey="id"
          dataSource={companies ?? []}
          pagination={false}
          size="middle"
          scroll={TABLE_SCROLL}
          className="responsive-table"
          columns={[
            {
              title: 'Company',
              key: 'name',
              render: (_, r) => (
                <Space wrap>
                  <Avatar style={{ backgroundColor: '#0891B2' }}>{r.name[0]}</Avatar>
                  {r.name}
                </Space>
              ),
            },
            { title: 'Type', dataIndex: 'type', key: 'type', render: (v) => <Tag color={TYPE_COLOR[v]}>{v}</Tag> },
            {
              title: 'Regions',
              key: 'countries',
              render: (_, r) => r.countries.map((c) => <Tag key={c}>{c}</Tag>),
            },
            {
              title: 'Tracking',
              key: 'tracking',
              render: (_, r) => r.trackingUrl
                ? <a href={r.trackingUrl} target="_blank" rel="noreferrer">Track</a>
                : '—',
            },
            {
              title: 'Status',
              key: 'active',
              render: (_, r) => r.active
                ? <Tag color="green">Active</Tag>
                : <Tag color="red">Inactive</Tag>,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default LogisticsPage;
