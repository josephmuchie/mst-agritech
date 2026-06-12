import React, { useState } from 'react';
import { Card, Typography, Table, Tag, Space, Statistic, Row, Col } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { TABLE_SCROLL } from '../utils/table';

const { Title } = Typography;

const SAMPLE_PAYMENTS = [
  { id: 1, reference: 'PAY-001', orderRef: 'ORD-20260601-001', amount: 12500, currency: 'USD', gateway: 'STRIPE', status: 'COMPLETED', createdAt: '2026-06-01' },
  { id: 2, reference: 'PAY-002', orderRef: 'ORD-20260603-002', amount: 8200, currency: 'USD', gateway: 'PAYPAL', status: 'COMPLETED', createdAt: '2026-06-03' },
  { id: 3, reference: 'PAY-003', orderRef: 'ORD-20260605-003', amount: 3100, currency: 'EUR', gateway: 'BANK_TRANSFER', status: 'PENDING', createdAt: '2026-06-05' },
  { id: 4, reference: 'PAY-004', orderRef: 'ORD-20260607-004', amount: 6750, currency: 'USD', gateway: 'STRIPE', status: 'FAILED', createdAt: '2026-06-07' },
];

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'orange', COMPLETED: 'green', FAILED: 'red', REFUNDED: 'blue',
};

const PaymentsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const totalRevenue = SAMPLE_PAYMENTS.filter((p) => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="page-root">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row gutter={[16, 16]} className="analytics-stats-row">
          <Col xs={24} sm={12} lg={6}><Card><Statistic title="Total Received (USD)" value={totalRevenue} prefix={<DollarOutlined />} precision={2} /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card><Statistic title="Pending" value={SAMPLE_PAYMENTS.filter((p) => p.status === 'PENDING').length} suffix="payments" /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card><Statistic title="Completed" value={SAMPLE_PAYMENTS.filter((p) => p.status === 'COMPLETED').length} /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card><Statistic title="Failed" value={SAMPLE_PAYMENTS.filter((p) => p.status === 'FAILED').length} valueStyle={{ color: '#cf1322' }} /></Card></Col>
        </Row>
        <Card title={<Title level={4} style={{ margin: 0 }}>Payment Transactions</Title>}>
          <Table
            rowKey="id"
            dataSource={SAMPLE_PAYMENTS}
            size="middle"
            scroll={TABLE_SCROLL}
            className="responsive-table"
            pagination={{ current: page, pageSize: 20, total: SAMPLE_PAYMENTS.length, onChange: setPage }}
            columns={[
              { title: 'Reference', dataIndex: 'reference', key: 'reference', render: (v) => <code>{v}</code> },
              { title: 'Order', dataIndex: 'orderRef', key: 'orderRef' },
              { title: 'Amount', key: 'amount', align: 'right', render: (_, r) => `${r.currency} ${r.amount.toLocaleString()}` },
              { title: 'Gateway', dataIndex: 'gateway', key: 'gateway', render: (v) => <Tag>{v.replace('_', ' ')}</Tag> },
              { title: 'Status', key: 'status', render: (_, r) => <Tag color={STATUS_COLOR[r.status]}>{r.status}</Tag> },
              { title: 'Date', dataIndex: 'createdAt', key: 'createdAt' },
            ]}
          />
        </Card>
      </Space>
    </div>
  );
};

export default PaymentsPage;
