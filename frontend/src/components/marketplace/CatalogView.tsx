import React, { useState } from 'react';
import {
  Card, Row, Col, Tag, Typography, Input, Select, Badge, Button, Space, Spin,
  Drawer, Descriptions, InputNumber, Empty, Image, Divider,
} from 'antd';
import {
  ShoppingCartOutlined, EnvironmentOutlined, SafetyCertificateOutlined,
  ClockCircleOutlined, InboxOutlined, FileProtectOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import type { MarketplaceProductResponse } from '../../app/apiSlice';
import { useIsMobile } from '../../hooks/useIsMobile';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const CATEGORY_COLOR: Record<string, string> = {
  Flowers: 'magenta', 'Meat & Livestock': 'volcano', 'Fresh Produce': 'green',
  Tobacco: 'gold', Grains: 'orange', Dairy: 'blue',
};

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240"><rect width="100%" height="100%" fill="#e6f4f1"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#0891B2" text-anchor="middle" dominant-baseline="middle">MST AgriTech</text></svg>`,
  );

function certList(certifications?: string): string[] {
  if (!certifications) return [];
  return certifications.split(',').map((c) => c.trim()).filter(Boolean);
}

export interface CatalogViewProps {
  products?: MarketplaceProductResponse[];
  categories?: string[];
  isLoading?: boolean;
  search: string;
  onSearch: (v: string) => void;
  category: string;
  onCategory: (v: string) => void;
  /** When provided the catalog runs in "cart" mode (punchout); otherwise it is browse/quote mode. */
  onAddToCart?: (product: MarketplaceProductResponse, quantity: number) => void;
  /** Browse-mode action when "Request Quote" is clicked. */
  onRequestQuote?: (product: MarketplaceProductResponse, quantity: number) => void;
}

const CatalogView: React.FC<CatalogViewProps> = ({
  products, categories, isLoading, search, onSearch, category, onCategory, onAddToCart, onRequestQuote,
}) => {
  const [detail, setDetail] = useState<MarketplaceProductResponse | null>(null);
  const [qty, setQty] = useState<number>(1);
  const isMobile = useIsMobile();

  const categoryOptions = ['All', ...(categories ?? [])];
  const cartMode = Boolean(onAddToCart);

  const openDetail = (p: MarketplaceProductResponse) => {
    setDetail(p);
    setQty(Number(p.minOrderQuantity) > 0 ? Number(p.minOrderQuantity) : 1);
  };

  const primaryLabel = cartMode ? 'Add to cart' : 'Request Quote';
  const primaryIcon = cartMode ? <ShoppingCartOutlined /> : <FileProtectOutlined />;

  const handlePrimary = (p: MarketplaceProductResponse, quantity: number) => {
    if (onAddToCart) onAddToCart(p, quantity);
    else if (onRequestQuote) onRequestQuote(p, quantity);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Card className="page-filter-bar">
        <Space wrap>
          <Search
            placeholder="Search products, SKU or supplier…"
            defaultValue={search}
            onSearch={onSearch}
            onChange={(e) => !e.target.value && onSearch('')}
            allowClear
            style={{ width: 280 }}
          />
          <Select
            value={category}
            onChange={onCategory}
            style={{ minWidth: 180 }}
            options={categoryOptions.map((c) => ({ value: c, label: c }))}
          />
        </Space>
      </Card>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>
      ) : (products ?? []).length === 0 ? (
        <Empty description="No products match your filters" />
      ) : (
        <Row gutter={[16, 16]} className="marketplace-grid">
          {(products ?? []).map((p) => (
            <Col key={p.id} xs={12} sm={12} md={8} lg={6}>
              <Badge.Ribbon
                text={p.available ? 'In stock' : 'Out of stock'}
                color={p.available ? 'green' : 'red'}
              >
                <Card
                  className="marketplace-card"
                  hoverable
                  cover={
                    <div className="marketplace-card-cover" onClick={() => openDetail(p)}>
                      <img alt={p.name} src={p.imageUrl || PLACEHOLDER} loading="lazy" />
                    </div>
                  }
                  actions={
                    isMobile
                      ? [
                          <Button
                            type="primary"
                            icon={primaryIcon}
                            size="small"
                            disabled={!p.available}
                            onClick={() => handlePrimary(p, Number(p.minOrderQuantity) || 1)}
                          >
                            {primaryLabel}
                          </Button>,
                        ]
                      : [
                          <Button type="text" size="small" onClick={() => openDetail(p)}>Details</Button>,
                          <Button
                            type="primary"
                            icon={primaryIcon}
                            size="small"
                            disabled={!p.available}
                            onClick={() => handlePrimary(p, Number(p.minOrderQuantity) || 1)}
                          >
                            {primaryLabel}
                          </Button>,
                        ]
                  }
                >
                  <Space size={4} wrap style={{ marginBottom: 6 }}>
                    <Tag color={CATEGORY_COLOR[p.category] ?? 'cyan'}>{p.category}</Tag>
                    {p.requiresColdChain && <Tag color="blue">Cold chain</Tag>}
                  </Space>
                  <Title level={5} style={{ margin: '2px 0' }} ellipsis={{ rows: 1 }}>{p.name}</Title>
                  <Space size={4}>
                    <EnvironmentOutlined style={{ color: '#0891B2' }} />
                    <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                      {p.supplier} · {p.originRegion || p.country}
                    </Text>
                  </Space>
                  <div style={{ marginTop: 10 }}>
                    <Text strong style={{ fontSize: 18, color: '#0891B2' }}>
                      ${Number(p.priceUsd).toFixed(2)}
                    </Text>
                    <Text type="secondary"> / {p.unit}</Text>
                    {p.sku && <Text type="secondary" className="marketplace-card-sku" style={{ fontSize: 11, float: 'right' }}>{p.sku}</Text>}
                  </div>
                  <Space size={12} wrap style={{ marginTop: 6, fontSize: 12 }}>
                    {p.minOrderQuantity != null && (
                      <Text type="secondary"><InboxOutlined /> MOQ {Number(p.minOrderQuantity).toLocaleString()}</Text>
                    )}
                    {p.leadTimeDays != null && (
                      <Text type="secondary"><ClockCircleOutlined /> {p.leadTimeDays}d</Text>
                    )}
                  </Space>
                </Card>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>
      )}

      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        width={Math.min(560, typeof window !== 'undefined' ? window.innerWidth : 560)}
        title={detail?.name}
        destroyOnClose
        footer={
          detail && (
            <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
              <Space>
                <Text type="secondary">Qty</Text>
                <InputNumber
                  min={1}
                  value={qty}
                  onChange={(v) => setQty(Number(v) || 1)}
                  step={detail.minOrderQuantity ? Number(detail.minOrderQuantity) : 1}
                />
                <Text type="secondary">{detail.unit}</Text>
              </Space>
              <Button
                type="primary"
                icon={primaryIcon}
                disabled={!detail.available}
                onClick={() => { handlePrimary(detail, qty); setDetail(null); }}
              >
                {primaryLabel}
              </Button>
            </Space>
          )
        }
      >
        {detail && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Image
              src={detail.imageUrl || PLACEHOLDER}
              alt={detail.name}
              fallback={PLACEHOLDER}
              style={{ borderRadius: 8, width: '100%', objectFit: 'cover', maxHeight: 260 }}
            />
            <Space wrap>
              <Tag color={CATEGORY_COLOR[detail.category] ?? 'cyan'}>{detail.category}</Tag>
              <Tag color={detail.available ? 'green' : 'red'}>{detail.available ? 'In stock' : 'Out of stock'}</Tag>
              {detail.requiresColdChain && <Tag color="blue">Cold chain</Tag>}
            </Space>

            <div>
              <Text strong style={{ fontSize: 26, color: '#0891B2' }}>
                ${Number(detail.priceUsd).toFixed(2)}
              </Text>
              <Text type="secondary"> {detail.currency || 'USD'} / {detail.unit}</Text>
            </div>

            {detail.description && <Paragraph type="secondary">{detail.description}</Paragraph>}

            {certList(detail.certifications).length > 0 && (
              <Space wrap>
                {certList(detail.certifications).map((c) => (
                  <Tag key={c} icon={<SafetyCertificateOutlined />} color="green">{c}</Tag>
                ))}
              </Space>
            )}

            <Divider style={{ margin: '4px 0' }} />

            <Descriptions column={1} size="small" bordered
              labelStyle={{ width: 160, fontWeight: 500 }}>
              <Descriptions.Item label="SKU / Part No.">{detail.sku || '—'}</Descriptions.Item>
              <Descriptions.Item label="Supplier">{detail.supplier}</Descriptions.Item>
              <Descriptions.Item label="Origin">{detail.originRegion || detail.country}</Descriptions.Item>
              <Descriptions.Item label="Available stock">
                {Number(detail.stock).toLocaleString()} {detail.unit}
              </Descriptions.Item>
              <Descriptions.Item label="Min. order qty">
                {detail.minOrderQuantity != null ? `${Number(detail.minOrderQuantity).toLocaleString()} ${detail.unit}` : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Lead time">
                {detail.leadTimeDays != null ? `${detail.leadTimeDays} days` : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Incoterms">{detail.incoterms || '—'}</Descriptions.Item>
              <Descriptions.Item label="Packaging">{detail.packaging || '—'}</Descriptions.Item>
              <Descriptions.Item label="Shelf life">
                {detail.shelfLifeDays != null ? `${detail.shelfLifeDays} days` : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="HS code"><AppstoreOutlined /> {detail.hsCode || '—'}</Descriptions.Item>
              <Descriptions.Item label="UNSPSC">{detail.unspscCode || '—'}</Descriptions.Item>
            </Descriptions>
          </Space>
        )}
      </Drawer>
    </Space>
  );
};

export default CatalogView;
