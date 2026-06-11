import React from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Space } from 'antd';
import { RiseOutlined, FallOutlined, TrophyOutlined } from '@ant-design/icons';

const { Title } = Typography;

const TOP_PRODUCTS = [
  { rank: 1, name: 'Premium Roses', category: 'Flowers', revenueUsd: 45200, orders: 38, growth: 12.4 },
  { rank: 2, name: 'Beef Sirloin', category: 'Meat', revenueUsd: 38100, orders: 29, growth: 8.1 },
  { rank: 3, name: 'Tobacco Leaf', category: 'Cash Crops', revenueUsd: 32000, orders: 14, growth: -2.3 },
  { rank: 4, name: 'Maize', category: 'Cereals', revenueUsd: 18500, orders: 52, growth: 5.7 },
  { rank: 5, name: 'Lily Flowers', category: 'Flowers', revenueUsd: 14200, orders: 21, growth: 19.2 },
];

const TOP_MARKETS = [
  { country: 'United Arab Emirates', code: 'AE', revenue: 48500, share: 28.3 },
  { country: 'United Kingdom', code: 'GB', revenue: 39200, share: 22.9 },
  { country: 'Netherlands', code: 'NL', revenue: 28100, share: 16.4 },
  { country: 'South Africa', code: 'ZA', revenue: 22400, share: 13.1 },
  { country: 'Germany', code: 'DE', revenue: 15600, share: 9.1 },
];

const AnalyticsPage: React.FC = () => (
  <Space direction="vertical" style={{ width: '100%' }} size="large">
    <Row gutter={16}>
      <Col span={6}><Card><Statistic title="YTD Revenue (USD)" value={171300} precision={0} prefix="$" /></Card></Col>
      <Col span={6}><Card><Statistic title="Total Orders (YTD)" value={154} /></Card></Col>
      <Col span={6}><Card><Statistic title="Avg Order Value" value={1112} precision={0} prefix="$" /></Card></Col>
      <Col span={6}><Card><Statistic title="Avg Fulfillment (days)" value={4.2} precision={1} /></Card></Col>
    </Row>

    <Row gutter={16}>
      <Col span={14}>
        <Card title={<Space><TrophyOutlined /><Title level={5} style={{ margin: 0 }}>Top Products by Revenue</Title></Space>}>
          <Table
            rowKey="rank" dataSource={TOP_PRODUCTS} pagination={false} size="small"
            columns={[
              { title: '#', dataIndex: 'rank', key: 'rank', width: 40 },
              { title: 'Product', dataIndex: 'name', key: 'name' },
              { title: 'Category', key: 'cat', render: (_, r) => <Tag>{r.category}</Tag> },
              { title: 'Revenue', key: 'rev', align: 'right', render: (_, r) => `$${r.revenueUsd.toLocaleString()}` },
              { title: 'Orders', dataIndex: 'orders', key: 'orders', align: 'right' },
              {
                title: 'Growth', key: 'growth', align: 'right',
                render: (_, r) => r.growth >= 0
                  ? <span style={{ color: '#3f8600' }}><RiseOutlined /> {r.growth}%</span>
                  : <span style={{ color: '#cf1322' }}><FallOutlined /> {Math.abs(r.growth)}%</span>,
              },
            ]}
          />
        </Card>
      </Col>
      <Col span={10}>
        <Card title={<Title level={5} style={{ margin: 0 }}>Top Export Markets</Title>}>
          <Table
            rowKey="code" dataSource={TOP_MARKETS} pagination={false} size="small"
            columns={[
              { title: 'Country', key: 'country', render: (_, r) => <><Tag>{r.code}</Tag> {r.country}</> },
              { title: 'Revenue', key: 'rev', align: 'right', render: (_, r) => `$${r.revenue.toLocaleString()}` },
              { title: 'Share', key: 'share', align: 'right', render: (_, r) => `${r.share}%` },
            ]}
          />
        </Card>
      </Col>
    </Row>
  </Space>
);

export default AnalyticsPage;
