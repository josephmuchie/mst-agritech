import React from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Space, Spin } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import {
  useGetAnalyticsSummaryQuery,
  useGetTopProductsQuery,
  useGetTopMarketsQuery,
} from '../app/apiSlice';
import { TABLE_SCROLL } from '../utils/table';

const { Title } = Typography;

const AnalyticsPage: React.FC = () => {
  const { data: summary, isLoading: summaryLoading } = useGetAnalyticsSummaryQuery();
  const { data: topProducts, isLoading: productsLoading } = useGetTopProductsQuery();
  const { data: topMarkets, isLoading: marketsLoading } = useGetTopMarketsQuery();

  if (summaryLoading || productsLoading || marketsLoading) {
    return <div className="page-root"><Spin size="large" /></div>;
  }

  return (
    <div className="page-root">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row gutter={[16, 16]} className="analytics-stats-row">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="YTD Revenue (USD)"
                value={summary?.ytdRevenueUsd ?? 0}
                precision={0}
                prefix="$"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Total Orders (YTD)" value={summary?.totalOrdersYtd ?? 0} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Avg Order Value"
                value={summary?.avgOrderValueUsd ?? 0}
                precision={0}
                prefix="$"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Avg Fulfillment (days)"
                value={summary?.avgFulfillmentDays ?? 0}
                precision={1}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="analytics-tables-row">
          <Col xs={24} xl={14}>
            <Card title={<Space><TrophyOutlined /><Title level={5} style={{ margin: 0 }}>Top Products by Revenue</Title></Space>}>
              <Table
                rowKey="rank"
                dataSource={topProducts ?? []}
                pagination={false}
                size="small"
                scroll={TABLE_SCROLL}
                className="responsive-table"
                columns={[
                  { title: '#', dataIndex: 'rank', key: 'rank', width: 40 },
                  { title: 'Product', dataIndex: 'name', key: 'name' },
                  { title: 'Category', key: 'cat', render: (_, r) => <Tag>{r.category}</Tag> },
                  { title: 'Revenue', key: 'rev', align: 'right', render: (_, r) => `$${Number(r.revenueUsd).toLocaleString()}` },
                  { title: 'Orders', dataIndex: 'orders', key: 'orders', align: 'right' },
                  {
                    title: 'Growth', key: 'growth', align: 'right',
                    render: () => <span style={{ color: '#64748B' }}>—</span>,
                  },
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} xl={10}>
            <Card title={<Title level={5} style={{ margin: 0 }}>Top Export Markets</Title>}>
              <Table
                rowKey="code"
                dataSource={topMarkets ?? []}
                pagination={false}
                size="small"
                scroll={TABLE_SCROLL}
                className="responsive-table"
                columns={[
                  { title: 'Country', key: 'country', render: (_, r) => <><Tag>{r.code}</Tag> {r.country}</> },
                  { title: 'Revenue', key: 'rev', align: 'right', render: (_, r) => `$${Number(r.revenue).toLocaleString()}` },
                  { title: 'Share', key: 'share', align: 'right', render: (_, r) => `${r.share}%` },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default AnalyticsPage;
