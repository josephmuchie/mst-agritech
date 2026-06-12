import React, { useEffect, useState } from 'react';
import { Card, Typography, Alert, Space, Tag, Spin, Button } from 'antd';
import { SafetyOutlined, ReloadOutlined } from '@ant-design/icons';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import '../styles/swaggerTheme.css';
import { useAppSelector } from '../app/store';
import BrandLogo from '../components/BrandLogo';
import { getApiBaseUrl, getOpenApiUrl } from '../config/api';

const { Title, Paragraph, Text } = Typography;

const ApiDocsPage: React.FC = () => {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const [specStatus, setSpecStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [retryKey, setRetryKey] = useState(0);
  const openApiUrl = getOpenApiUrl();

  useEffect(() => {
    let cancelled = false;
    setSpecStatus('loading');

    fetch(openApiUrl, { mode: 'cors' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(() => { if (!cancelled) setSpecStatus('ready'); })
      .catch(() => { if (!cancelled) setSpecStatus('error'); });

    return () => { cancelled = true; };
  }, [retryKey, openApiUrl]);

  return (
    <div>
      <Space direction="vertical" size={4} style={{ marginBottom: 16, display: 'flex' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BrandLogo variant="icon-cyan" height={48} />
          <Title level={3} style={{ margin: 0, color: '#0C4A6E' }}>
            API Documentation
          </Title>
        </div>
        <Paragraph type="secondary" style={{ margin: 0 }}>
          Interactive Swagger reference for the MST Agritech REST API. Expand any endpoint to view
          parameters, request bodies, response schemas, and try live requests.
        </Paragraph>
      </Space>

      <Alert
        type="info"
        showIcon
        icon={<SafetyOutlined />}
        message="Authenticated requests"
        description={
          <Text type="secondary">
            Your current session token is automatically attached to API calls. Use the{' '}
            <Text strong>Authorize</Text> button to override the bearer token if needed.
          </Text>
        }
        style={{ marginBottom: 16 }}
      />

      <Card
        styles={{ body: { padding: 0 } }}
        style={{ border: '1px solid #BAE6FD', borderRadius: 6, overflow: 'hidden' }}
      >
        <div style={{ padding: '16px 24px', background: '#E0F2FE', borderBottom: '1px solid #BAE6FD' }}>
          <Space>
            <Tag color="cyan">OpenAPI 3.0</Tag>
            <Tag color="blue">REST v1</Tag>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Base path: <Text code>/api/v1</Text>
            </Text>
          </Space>
        </div>

        {specStatus === 'loading' && (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Spin size="large" tip="Loading API specification..." />
          </div>
        )}

        {specStatus === 'error' && (
          <div style={{ padding: 24 }}>
            <Alert
              type="error"
              showIcon
              message="Unable to load API documentation"
              description={
                <Space direction="vertical" size={8}>
                  <Text type="secondary">
                    Could not reach the OpenAPI spec at{' '}
                    <Text code>{openApiUrl}</Text>. Confirm the API is running (
                    <Text code>{getApiBaseUrl()}</Text>), then retry.
                  </Text>
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={() => setRetryKey((k) => k + 1)}
                  >
                    Retry
                  </Button>
                </Space>
              }
            />
          </div>
        )}

        {specStatus === 'ready' && (
          <div className="mst-swagger-ui swagger-docs-wrap" style={{ padding: '0 16px 16px' }}>
            <SwaggerUI
              key={retryKey}
              url={openApiUrl}
              docExpansion="list"
              defaultModelsExpandDepth={1}
              displayRequestDuration
              tryItOutEnabled
              persistAuthorization
              requestInterceptor={(req) => {
                if (accessToken) {
                  req.headers = { ...req.headers, Authorization: `Bearer ${accessToken}` };
                }
                return req;
              }}
              deepLinking
              filter
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default ApiDocsPage;
