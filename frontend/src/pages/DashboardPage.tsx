import React from 'react';
import { Row, Col, Card, Statistic, Badge, Typography, Table, Tag } from 'antd';
import { ArrowUpOutlined, ShoppingCartOutlined, TeamOutlined, DollarOutlined, CarOutlined } from '@ant-design/icons';
import { useSSE } from '../hooks/useSSE';

const { Title, Text } = Typography;

interface KpiData {
  totalOrders: number;
  activeFarmers: number;
  revenueUsd: number;
  activeShipments: number;
}

const recentOrders = [
  { key: 1, id: 'ORD-001', buyer: 'Woolworths SA', product: 'Fresh Roses', amount: '$4,200', status: 'SHIPPED' },
  { key: 2, id: 'ORD-002', buyer: 'Al Ain Farms UAE', product: 'Beef Cuts', amount: '$12,800', status: 'IN_PRODUCTION' },
  { key: 3, id: 'ORD-003', buyer: 'Tesco UK', product: 'Tobacco Leaf', amount: '$31,500', status: 'QUOTED' },
  { key: 4, id: 'ORD-004', buyer: 'Carrefour France', product: 'Baby Corn', amount: '$2,100', status: 'DELIVERED' },
];

const statusColors: Record<string, string> = {
  QUOTED: 'blue', ACCEPTED: 'cyan', IN_PRODUCTION: 'orange',
  SHIPPED: 'purple', DELIVERED: 'green', CANCELLED: 'red',
};

const columns = [
  { title: 'Order ID', dataIndex: 'id', key: 'id' },
  { title: 'Buyer', dataIndex: 'buyer', key: 'buyer' },
  { title: 'Product', dataIndex: 'product', key: 'product' },
  { title: 'Amount', dataIndex: 'amount', key: 'amount' },
  {
    title: 'Status', dataIndex: 'status', key: 'status',
    render: (s: string) => <Tag color={statusColors[s] || 'default'}>{s.replace('_', ' ')}</Tag>,
  },
];

const DashboardPage: React.FC = () => {
  const { data: kpi, connected } = useSSE<KpiData>('/stream/dashboard/kpis');

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>Dashboard</Title>
        <Badge
          status={connected ? 'processing' : 'default'}
          text={<Text type="secondary" style={{ fontSize: 12 }}>{connected ? 'Live' : 'Offline'}</Text>}
        />
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={kpi?.totalOrders ?? 148}
              prefix={<ShoppingCartOutlined style={{ color: '#0891B2' }} />}
              suffix={<Text type="success" style={{ fontSize: 12 }}><ArrowUpOutlined /> 12%</Text>}
              valueStyle={{ color: '#0C4A6E' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Farmers"
              value={kpi?.activeFarmers ?? 63}
              prefix={<TeamOutlined style={{ color: '#16A34A' }} />}
              valueStyle={{ color: '#0C4A6E' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Revenue (USD)"
              value={kpi?.revenueUsd ?? 284500}
              prefix={<DollarOutlined style={{ color: '#D97706' }} />}
              precision={0}
              formatter={(v) => `$${Number(v).toLocaleString()}`}
              valueStyle={{ color: '#0C4A6E' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Shipments"
              value={kpi?.activeShipments ?? 21}
              prefix={<CarOutlined style={{ color: '#7C3AED' }} />}
              valueStyle={{ color: '#0C4A6E' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Orders" extra={<Text type="secondary">Auto-updating</Text>}>
        <Table dataSource={recentOrders} columns={columns} pagination={false} size="small" />
      </Card>
    </div>
  );
};

export default DashboardPage;
