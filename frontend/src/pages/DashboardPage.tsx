import React from 'react';
import { Row, Col, Card, Statistic, Badge, Typography, Table, Tag, Spin } from 'antd';
import { ShoppingCartOutlined, TeamOutlined, DollarOutlined, CarOutlined } from '@ant-design/icons';
import { useSSE } from '../hooks/useSSE';
import { useGetOrdersQuery } from '../app/apiSlice';
import { TABLE_SCROLL } from '../utils/table';

const { Title, Text } = Typography;

interface KpiData {
  totalOrders: number;
  activeFarmers: number;
  revenueUsd: number;
  activeShipments: number;
}

const statusColors: Record<string, string> = {
  QUOTED: 'blue', ACCEPTED: 'cyan', IN_PRODUCTION: 'orange',
  SHIPPED: 'purple', DELIVERED: 'green', CANCELLED: 'red',
};

const DashboardPage: React.FC = () => {
  const { data: kpi, connected } = useSSE<KpiData>('/stream/dashboard/kpis');
  const { data: ordersData, isLoading } = useGetOrdersQuery({ page: 0, size: 5 });

  const recentOrders = (ordersData?.content ?? []).map((o) => ({
    key: o.id,
    id: o.reference,
    buyer: o.buyerCompanyName,
    product: o.notes?.split(' ').slice(0, 2).join(' ') || '—',
    amount: o.totalAmount != null ? `${o.currencyCode ?? 'USD'} ${Number(o.totalAmount).toLocaleString()}` : '—',
    status: o.status,
  }));

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

  return (
    <div className="page-root">
      <div className="dashboard-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              value={kpi?.totalOrders ?? 0}
              prefix={<ShoppingCartOutlined style={{ color: '#0891B2' }} />}
              valueStyle={{ color: '#0C4A6E' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Farmers"
              value={kpi?.activeFarmers ?? 0}
              prefix={<TeamOutlined style={{ color: '#16A34A' }} />}
              valueStyle={{ color: '#0C4A6E' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Revenue (USD)"
              value={kpi?.revenueUsd ?? 0}
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
              value={kpi?.activeShipments ?? 0}
              prefix={<CarOutlined style={{ color: '#7C3AED' }} />}
              valueStyle={{ color: '#0C4A6E' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Orders" extra={<Text type="secondary">Live data</Text>}>
        {isLoading ? (
          <Spin />
        ) : (
          <Table
            dataSource={recentOrders}
            columns={columns}
            pagination={false}
            size="small"
            scroll={TABLE_SCROLL}
            className="responsive-table"
          />
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;
