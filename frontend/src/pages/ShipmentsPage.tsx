import React from 'react';
import { Card, Typography, Table, Tag, Space, Button, Spin } from 'antd';
import { TruckOutlined } from '@ant-design/icons';
import { useGetShipmentsQuery } from '../app/apiSlice';
import { TABLE_SCROLL } from '../utils/table';

const { Title } = Typography;

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'default', LOADING: 'orange', LOADED: 'blue', IN_TRANSIT: 'purple',
  CUSTOMS: 'cyan', DELIVERED: 'green', CANCELLED: 'red',
};

const ShipmentsPage: React.FC = () => {
  const { data, isLoading } = useGetShipmentsQuery({ page: 0, size: 50 });
  const shipments = data?.content ?? [];

  if (isLoading) {
    return <div className="page-root"><Spin size="large" /></div>;
  }

  return (
    <div className="page-root">
      <Card title={<Space><TruckOutlined /><Title level={4} style={{ margin: 0 }}>Shipments</Title></Space>}>
        <Table
          rowKey="id"
          dataSource={shipments}
          pagination={false}
          size="middle"
          scroll={TABLE_SCROLL}
          className="responsive-table"
          columns={[
            { title: 'Tracking #', dataIndex: 'trackingNo', key: 'trackingNo', render: (v) => <code>{v}</code> },
            { title: 'Carrier', dataIndex: 'carrier', key: 'carrier' },
            { title: 'Origin', dataIndex: 'origin', key: 'origin' },
            { title: 'Destination', dataIndex: 'destination', key: 'destination' },
            {
              title: 'Status',
              key: 'status',
              render: (_, r) => <Tag color={STATUS_COLOR[r.status]}>{r.status.replace('_', ' ')}</Tag>,
            },
            {
              title: 'ETA',
              dataIndex: 'eta',
              key: 'eta',
              render: (v: string | null) => v?.slice(0, 10) ?? '—',
            },
            { title: '', key: 'action', render: () => <Button size="small">Track</Button> },
          ]}
        />
      </Card>
    </div>
  );
};

export default ShipmentsPage;
