import React from 'react';
import { Card, List, Tag, Typography, Space, Switch, Tooltip, Button } from 'antd';
import { ApiOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const INTEGRATIONS = [
  { id: 1, system: 'ORACLE_ERP', label: 'Oracle ERP Cloud', description: 'Sync orders and invoices with Oracle Financials', connected: true, env: 'production' },
  { id: 2, system: 'SAP', label: 'SAP S/4HANA', description: 'Inventory and procurement integration via SAP IDoc', connected: false, env: 'staging' },
  { id: 3, system: 'SALESFORCE', label: 'Salesforce CRM', description: 'Buyer accounts and opportunity tracking', connected: true, env: 'production' },
  { id: 4, system: 'DHL_API', label: 'DHL Shipping API', description: 'Real-time tracking and shipment label generation', connected: true, env: 'production' },
  { id: 5, system: 'STRIPE', label: 'Stripe Payments', description: 'Multi-currency card and bank payment processing', connected: true, env: 'production' },
  { id: 6, system: 'PAYPAL', label: 'PayPal Commerce', description: 'International PayPal payment gateway', connected: false, env: 'sandbox' },
];

const ENV_COLOR: Record<string, string> = { production: 'green', staging: 'orange', sandbox: 'blue' };

const IntegrationsPage: React.FC = () => (
  <Card title={<Space><ApiOutlined /><Title level={4} style={{ margin: 0 }}>External Integrations</Title></Space>}>
    <List
      dataSource={INTEGRATIONS}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Tag color={ENV_COLOR[item.env]}>{item.env}</Tag>,
            <Tooltip title={item.connected ? 'Connected' : 'Disconnected'}>
              {item.connected
                ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                : <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />}
            </Tooltip>,
            <Switch checked={item.connected} disabled size="small" />,
            <Button size="small" disabled>Configure</Button>,
          ]}
        >
          <List.Item.Meta
            avatar={<ApiOutlined style={{ fontSize: 28, color: '#0891B2' }} />}
            title={item.label}
            description={<Text type="secondary">{item.description}</Text>}
          />
        </List.Item>
      )}
    />
  </Card>
);

export default IntegrationsPage;
