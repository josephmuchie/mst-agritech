import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Layout, Typography, Button, Drawer, List, InputNumber, Space, Tag, Empty,
  Badge, Result, Spin, message, Affix,
} from 'antd';
import { ShoppingCartOutlined, SendOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  useGetPunchoutSessionQuery, useGetPunchoutProductsQuery,
  useGetPunchoutCategoriesQuery, usePunchoutCheckoutMutation,
} from '../app/apiSlice';
import type { MarketplaceProductResponse } from '../app/apiSlice';
import CatalogView from '../components/marketplace/CatalogView';
import { getApiErrorMessage } from '../utils/apiError';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface CartLine { product: MarketplaceProductResponse; quantity: number; }

/** Auto-submits a form to the buyer's procurement system (cXML BrowserFormPost or OCI HOOK_URL). */
function autoPost(url: string, fields: Record<string, string>) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;
  form.style.display = 'none';
  Object.entries(fields).forEach(([k, v]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = v ?? '';
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

const PunchoutPage: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('sid') ?? '';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState<Record<number, CartLine>>({});
  const [cartOpen, setCartOpen] = useState(false);

  const { data: session, isLoading: sessionLoading, isError: sessionError } =
    useGetPunchoutSessionQuery(token, { skip: !token });
  const { data: products, isLoading } =
    useGetPunchoutProductsQuery({ token, search, category }, { skip: !token });
  const { data: categories } = useGetPunchoutCategoriesQuery(token, { skip: !token });
  const [checkout, { isLoading: transferring }] = usePunchoutCheckoutMutation();

  const lines = useMemo(() => Object.values(cart), [cart]);
  const itemCount = lines.length;
  const total = useMemo(
    () => lines.reduce((sum, l) => sum + Number(l.product.priceUsd) * l.quantity, 0),
    [lines],
  );

  const addToCart = (product: MarketplaceProductResponse, quantity: number) => {
    setCart((prev) => {
      const existing = prev[product.id];
      const nextQty = (existing?.quantity ?? 0) + quantity;
      return { ...prev, [product.id]: { product, quantity: nextQty } };
    });
    message.success(`Added ${quantity} ${product.unit} of ${product.name}`);
  };

  const setQty = (id: number, quantity: number) =>
    setCart((prev) => ({ ...prev, [id]: { ...prev[id], quantity } }));

  const removeLine = (id: number) =>
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  const transfer = async () => {
    if (lines.length === 0) { message.warning('Your cart is empty'); return; }
    try {
      const res = await checkout({
        token,
        items: lines.map((l) => ({ productId: l.product.id, sku: l.product.sku, quantity: l.quantity })),
      }).unwrap();
      if (!res.postUrl) {
        message.error('No return URL provided by the procurement system');
        return;
      }
      message.success('Transferring cart to your procurement system…');
      autoPost(res.postUrl, res.fields);
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Cart transfer failed'));
    }
  };

  if (!token) {
    return <Result status="404" title="Missing session" subTitle="No PunchOut session token was provided." />;
  }
  if (sessionLoading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }
  if (sessionError || !session) {
    return <Result status="error" title="Invalid or expired session"
      subTitle="This PunchOut session could not be found. Please restart from your procurement system." />;
  }
  if (session.status !== 'ACTIVE') {
    return <Result status="success" title="Cart transferred"
      subTitle="Your selections have been returned to your procurement system. You may close this window." />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <Space>
          <img src="/Assets/PNG/icon cyan.png" alt="MST" style={{ height: 32 }} />
          <Title level={4} style={{ margin: 0 }}>MST AgriTech Marketplace</Title>
          <Tag color="cyan">{session.protocol} PunchOut</Tag>
        </Space>
        <Space>
          {session.buyerName && <Text type="secondary">Buyer: {session.buyerName}</Text>}
          <Badge count={itemCount} size="small">
            <Button icon={<ShoppingCartOutlined />} onClick={() => setCartOpen(true)}>Cart</Button>
          </Badge>
        </Space>
      </Header>

      <Content style={{ padding: 24, background: '#f5f7f7' }}>
        <CatalogView
          products={products}
          categories={categories}
          isLoading={isLoading}
          search={search}
          onSearch={setSearch}
          category={category}
          onCategory={setCategory}
          onAddToCart={addToCart}
        />
      </Content>

      <Affix offsetBottom={24} style={{ position: 'fixed', right: 24, bottom: 24 }}>
        <Badge count={itemCount}>
          <Button type="primary" size="large" shape="round" icon={<ShoppingCartOutlined />} onClick={() => setCartOpen(true)}>
            Review cart
          </Button>
        </Badge>
      </Affix>

      <Drawer
        title={`Cart — ${session.buyerName ?? 'Procurement'}`}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        width={Math.min(440, typeof window !== 'undefined' ? window.innerWidth : 440)}
        footer={
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text strong>Total</Text>
              <Text strong style={{ fontSize: 18, color: '#0891B2' }}>${total.toFixed(2)}</Text>
            </Space>
            <Button
              type="primary"
              block
              size="large"
              icon={<SendOutlined />}
              loading={transferring}
              disabled={lines.length === 0}
              onClick={transfer}
            >
              Transfer cart to {session.buyerName ?? 'procurement system'}
            </Button>
          </Space>
        }
      >
        {lines.length === 0 ? (
          <Empty description="Your cart is empty" />
        ) : (
          <List
            dataSource={lines}
            renderItem={(l) => (
              <List.Item
                actions={[
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeLine(l.product.id)} />,
                ]}
              >
                <List.Item.Meta
                  title={l.product.name}
                  description={
                    <Space direction="vertical" size={4}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {l.product.sku} · ${Number(l.product.priceUsd).toFixed(2)} / {l.product.unit}
                      </Text>
                      <InputNumber
                        min={1}
                        size="small"
                        value={l.quantity}
                        onChange={(v) => setQty(l.product.id, Number(v) || 1)}
                        addonAfter={l.product.unit}
                      />
                    </Space>
                  }
                />
                <Text strong>${(Number(l.product.priceUsd) * l.quantity).toFixed(2)}</Text>
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </Layout>
  );
};

export default PunchoutPage;
