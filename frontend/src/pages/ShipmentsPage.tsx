import React from 'react';
import { Card, Typography, Table, Tag, Space, Button } from 'antd';
import { TruckOutlined } from '@ant-design/icons';

const { Title } = Typography;

const SAMPLE_SHIPMENTS = [
  { id: 1, trackingNo: 'DHL-ZW-001234', carrier: 'DHL Express', origin: 'Harare, ZW', destination: 'Dubai, UAE', status: 'IN_TRANSIT', eta: '2026-06-18' },
  { id: 2, trackingNo: 'MSC-ZW-005678', carrier: 'MSC', origin: 'Beira, MZ', destination: 'Rotterdam, NL', status: 'LOADING', eta: '2026-07-05' },
  { id: 3, trackingNo: 'MAE-ZW-009012', carrier: 'Maersk', origin: 'Durban, ZA', destination: 'London, UK', status: 'DELIVERED', eta: '2026-06-01' },
];

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'default', LOADING: 'orange', LOADED: 'blue', IN_TRANSIT: 'purple',
  CUSTOMS: 'cyan', DELIVERED: 'green', CANCELLED: 'red',
};

const ShipmentsPage: React.FC = () => (
  <Card title={<Space><TruckOutlined /><Title level={4} style={{ margin: 0 }}>Shipments</Title></Space>}>
    <Table
      rowKey="id"
      dataSource={SAMPLE_SHIPMENTS}
      pagination={false}
      size="middle"
      columns={[
        { title: 'Tracking #', dataIndex: 'trackingNo', key: 'trackingNo', render: (v) => <code>{v}</code> },
        { title: 'Carrier', dataIndex: 'carrier', key: 'carrier' },
        { title: 'Origin', dataIndex: 'origin', key: 'origin' },
        { title: 'Destination', dataIndex: 'destination', key: 'destination' },
        { title: 'Status', key: 'status', render: (_, r) => <Tag color={STATUS_COLOR[r.status]}>{r.status.replace('_', ' ')}</Tag> },
        { title: 'ETA', dataIndex: 'eta', key: 'eta' },
        { title: '', key: 'action', render: () => <Button size="small">Track</Button> },
      ]}
    />
  </Card>
);

export default ShipmentsPage;
