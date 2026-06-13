import React, { useState } from 'react';
import { Card, Typography, Table, Tag, Space, Statistic, Row, Col, Spin } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { useGetPaymentsQuery, useGetPaymentSummaryQuery } from '../app/apiSlice';
import { TABLE_SCROLL } from '../utils/table';

const { Title } = Typography;

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'orange', COMPLETED: 'green', FAILED: 'red', REFUNDED: 'blue',
};

const PaymentsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetPaymentsQuery({ page: page - 1, size: 20 });
  const { data: summary, isLoading: summaryLoading } = useGetPaymentSummaryQuery();

  if (isLoading || summaryLoading) {
    return <div className="page-root"><Spin size="large" /></div>;
  }

  const payments = data?.content ?? [];

  return (
    <div className="page-root">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row gutter={[16, 16]} className="analytics-stats-row">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Received (USD)"
                value={summary?.totalReceivedUsd ?? 0}
                prefix={<DollarOutlined />}
                precision={2}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Pending" value={summary?.pendingCount ?? 0} suffix="payments" />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Completed" value={summary?.completedCount ?? 0} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Failed"
                value={summary?.failedCount ?? 0}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>
        <Card title={<Title level={4} style={{ margin: 0 }}>Payment Transactions</Title>}>
          <Table
            rowKey="id"
            dataSource={payments}
            size="middle"
            scroll={TABLE_SCROLL}
            className="responsive-table"
            pagination={{
              current: page,
              pageSize: 20,
              total: data?.totalElements ?? 0,
              onChange: setPage,
            }}
            columns={[
              { title: 'Reference', dataIndex: 'reference', key: 'reference', render: (v) => <code>{v}</code> },
              { title: 'Order', dataIndex: 'orderRef', key: 'orderRef' },
              {
                title: 'Amount',
                key: 'amount',
                align: 'right',
                render: (_, r) => `${r.currencyCode} ${Number(r.amount).toLocaleString()}`,
              },
              { title: 'Gateway', dataIndex: 'gateway', key: 'gateway', render: (v) => <Tag>{v.replace('_', ' ')}</Tag> },
              { title: 'Status', key: 'status', render: (_, r) => <Tag color={STATUS_COLOR[r.status]}>{r.status}</Tag> },
              {
                title: 'Date',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (v: string) => v?.slice(0, 10),
              },
            ]}
          />
        </Card>
      </Space>
    </div>
  );
};

export default PaymentsPage;
