import React from 'react';
import { Card, Table, Tag, Typography, Space, Avatar } from 'antd';
import { TruckOutlined } from '@ant-design/icons';

const { Title } = Typography;

const LOGISTICS = [
  { id: 1, name: 'DHL Express', type: 'AIR', trackingUrl: 'https://www.dhl.com/track', countries: ['ZW','AE','GB','DE','NL'], active: true },
  { id: 2, name: 'Maersk', type: 'SEA', trackingUrl: 'https://www.maersk.com/track', countries: ['ZW','GB','NL','BE','DK'], active: true },
  { id: 3, name: 'MSC', type: 'SEA', trackingUrl: 'https://www.msc.com/track', countries: ['ZW','ZA','AE','IT','FR'], active: true },
  { id: 4, name: 'ColdChain ZW', type: 'ROAD', trackingUrl: null, countries: ['ZW','ZA','MZ','BW'], active: true },
  { id: 5, name: 'Swift Freight', type: 'AIR', trackingUrl: null, countries: ['ZW','KE','TZ','UG'], active: false },
];

const TYPE_COLOR: Record<string, string> = { AIR: 'blue', SEA: 'cyan', ROAD: 'green', MULTIMODAL: 'purple' };

const LogisticsPage: React.FC = () => (
  <Card title={<Space><TruckOutlined /><Title level={4} style={{ margin: 0 }}>Logistics Companies</Title></Space>}>
    <Table
      rowKey="id"
      dataSource={LOGISTICS}
      pagination={false}
      size="middle"
      columns={[
        { title: 'Company', key: 'name', render: (_, r) => <Space><Avatar style={{ backgroundColor: '#0891B2' }}>{r.name[0]}</Avatar>{r.name}</Space> },
        { title: 'Type', dataIndex: 'type', key: 'type', render: (v) => <Tag color={TYPE_COLOR[v]}>{v}</Tag> },
        { title: 'Served Countries', key: 'countries', render: (_, r) => r.countries.map((c) => <Tag key={c}>{c}</Tag>) },
        { title: 'Tracking', key: 'tracking', render: (_, r) => r.trackingUrl ? <a href={r.trackingUrl} target="_blank" rel="noreferrer">Track</a> : '—' },
        { title: 'Status', key: 'active', render: (_, r) => r.active ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag> },
      ]}
    />
  </Card>
);

export default LogisticsPage;
