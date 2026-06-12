import React, { useState } from 'react';
import { Card, Row, Col, Tag, Typography, Input, Select, Badge, Button, Space } from 'antd';
import { ShoppingCartOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;

const PRODUCTS = [
  { id: 1, name: 'Premium Roses', category: 'Flowers', farmer: 'Green Valley Farm', country: 'ZW', priceUsd: 4.5, unit: 'bunch', stock: 2000, available: true },
  { id: 2, name: 'Beef Sirloin', category: 'Meat', farmer: 'Highveld Ranch', country: 'ZW', priceUsd: 12, unit: 'kg', stock: 500, available: true },
  { id: 3, name: 'Maize', category: 'Cereals', farmer: 'Sunshine Agro', country: 'ZW', priceUsd: 0.35, unit: 'kg', stock: 50000, available: true },
  { id: 4, name: 'Tobacco Leaf', category: 'Cash Crops', farmer: 'Mashonaland Leaf', country: 'ZW', priceUsd: 3.2, unit: 'kg', stock: 10000, available: true },
  { id: 5, name: 'Lily Flowers', category: 'Flowers', farmer: 'Eastern Highlands Flora', country: 'ZW', priceUsd: 5.8, unit: 'bunch', stock: 800, available: false },
  { id: 6, name: 'Free-Range Chicken', category: 'Poultry', farmer: 'Sunrise Poultry', country: 'ZW', priceUsd: 6.5, unit: 'kg', stock: 300, available: true },
];

const CATEGORIES = ['All', 'Flowers', 'Meat', 'Cereals', 'Cash Crops', 'Poultry'];

const CATEGORY_COLOR: Record<string, string> = {
  Flowers: 'pink', Meat: 'red', Cereals: 'gold', 'Cash Crops': 'green', Poultry: 'orange',
};

const MarketplacePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = PRODUCTS.filter(
    (p) =>
      (category === 'All' || p.category === category) &&
      (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.farmer.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="page-root">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Card className="page-filter-bar">
          <Space wrap>
            <Search placeholder="Search products or farms…" onSearch={setSearch} onChange={(e) => !e.target.value && setSearch('')} allowClear />
            <Select value={category} onChange={setCategory}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
          </Space>
        </Card>
        <Row gutter={[16, 16]} className="marketplace-grid">
          {filtered.map((p) => (
            <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
              <Badge.Ribbon text={p.available ? 'Available' : 'Out of Stock'} color={p.available ? 'green' : 'red'}>
                <Card
                  hoverable={p.available}
                  actions={[<Button type="primary" icon={<ShoppingCartOutlined />} disabled={!p.available} size="small">Request Quote</Button>]}
                >
                  <Tag color={CATEGORY_COLOR[p.category] ?? 'default'} style={{ marginBottom: 8 }}>{p.category}</Tag>
                  <Title level={5} style={{ margin: '4px 0' }}>{p.name}</Title>
                  <Space wrap><EnvironmentOutlined style={{ color: '#0891B2' }} /><Text type="secondary">{p.farmer} · {p.country}</Text></Space>
                  <div style={{ marginTop: 12 }}>
                    <Text strong style={{ fontSize: 18, color: '#0891B2' }}>${p.priceUsd}</Text>
                    <Text type="secondary"> / {p.unit}</Text>
                  </div>
                  <div><Text type="secondary" style={{ fontSize: 12 }}>Stock: {p.stock.toLocaleString()} {p.unit}s</Text></div>
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
