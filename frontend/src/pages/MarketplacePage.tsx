import React, { useState } from 'react';
import { Card, Row, Col, Tag, Typography, Input, Select, Badge, Button, Space, Spin } from 'antd';
import { ShoppingCartOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useGetMarketplaceProductsQuery, useGetMarketplaceCategoriesQuery } from '../app/apiSlice';

const { Title, Text } = Typography;
const { Search } = Input;

const CATEGORY_COLOR: Record<string, string> = {
  Flowers: 'pink', 'Meat & Livestock': 'red', 'Fresh Produce': 'green',
  Tobacco: 'green', Grains: 'gold', Dairy: 'blue',
};

const MarketplacePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const { data: products, isLoading } = useGetMarketplaceProductsQuery({ search, category });
  const { data: categories } = useGetMarketplaceCategoriesQuery();

  const categoryOptions = ['All', ...(categories ?? [])];

  if (isLoading) {
    return <div className="page-root"><Spin size="large" /></div>;
  }

  return (
    <div className="page-root">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Card className="page-filter-bar">
          <Space wrap>
            <Search
              placeholder="Search products or farms…"
              onSearch={setSearch}
              onChange={(e) => !e.target.value && setSearch('')}
              allowClear
            />
            <Select
              value={category}
              onChange={setCategory}
              options={categoryOptions.map((c) => ({ value: c, label: c }))}
            />
          </Space>
        </Card>
        <Row gutter={[16, 16]} className="marketplace-grid">
          {(products ?? []).map((p) => (
            <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
              <Badge.Ribbon text={p.available ? 'Available' : 'Out of Stock'} color={p.available ? 'green' : 'red'}>
                <Card
                  hoverable={p.available}
                  actions={[
                    <Button
                      type="primary"
                      icon={<ShoppingCartOutlined />}
                      disabled={!p.available}
                      size="small"
                    >
                      Request Quote
                    </Button>,
                  ]}
                >
                  <Tag color={CATEGORY_COLOR[p.category] ?? 'default'} style={{ marginBottom: 8 }}>{p.category}</Tag>
                  <Title level={5} style={{ margin: '4px 0' }}>{p.name}</Title>
                  <Space wrap>
                    <EnvironmentOutlined style={{ color: '#0891B2' }} />
                    <Text type="secondary">{p.farmer} · {p.country}</Text>
                  </Space>
                  <div style={{ marginTop: 12 }}>
                    <Text strong style={{ fontSize: 18, color: '#0891B2' }}>${Number(p.priceUsd).toFixed(2)}</Text>
                    <Text type="secondary"> / {p.unit}</Text>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Stock: {Number(p.stock).toLocaleString()} {p.unit}
                    </Text>
                  </div>
                </Card>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>
      </Space>
    </div>
  );
};

export default MarketplacePage;
