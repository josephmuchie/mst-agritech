import React, { useEffect, useState } from 'react';
import { Card, Typography, Alert, Space, Tag, Spin, Button } from 'antd';
import { SafetyOutlined, ReloadOutlined } from '@ant-design/icons';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import '../styles/swaggerTheme.css';
import { useAppSelector } from '../app/store';
import BrandLogo from '../components/BrandLogo';
import PageHeader from '../components/PageHeader';
import { getApiBaseUrl, getOpenApiUrl } from '../config/api';

const { Text } = Typography;

const ApiDocsPage: React.FC = () => {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const [specStatus, setSpecStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [retryKey, setRetryKey] = useState(0);
  const openApiUrl = getOpenApiUrl();

  useEffect(() => {
    let cancelled = false;
    setSpecStatus('loading');

    fetch(openApiUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(() => { if (!cancelled) setSpecStatus('ready'); })
      .catch(() => { if (!cancelled) setSpecStatus('error'); });

    return () => { cancelled = true; };
  }, [retryKey, openApiUrl]);

  return (
    <div className="page-root page-root--api-docs">
      <PageHeader
        icon={<BrandLogo variant="icon-cyan" height={40} className="page-header-logo" />}
        title="API Documentation"
        description="Interactive Swagger reference for the MST Agritech REST API. Expand any endpoint to view parameters, request bodies, response schemas, and try live requests."
      />

      <Alert
        className="page-alert"
        type="info"
        showIcon
        icon={<SafetyOutlined />}
        message="Authenticated requests"
        description={
          <Text type="secondary">
            Your session token is attached automatically. Use the{' '}
            <Text strong>Authorize</Text> button in Swagger to override the bearer token.
          </Text>
        }
      />

      <Card className="page-card page-card--flush api-docs-card">
        <div className="api-docs-card-bar">
          <Space wrap size={[8, 8]}>
            <Tag color="cyan">OpenAPI 3.0</Tag>
            <Tag color="blue">REST v1</Tag>
            <Text type="secondary" className="api-docs-base-path">
              Base path: <Text code>/api/v1</Text>
            </Text>
          </Space>
        </div>

        {specStatus === 'loading' && (
          <div className="api-docs-state">
            <Spin size="large" tip="Loading API specification..." />
          </div>
        )}

        {specStatus === 'error' && (
          <div className="api-docs-state api-docs-state--error">
            <Alert
              type="error"
              showIcon
              message="Unable to load API documentation"
              description={
                <Space direction="vertical" size={8} className="api-docs-error-body">
                  <Text type="secondary">
                    Could not reach the OpenAPI spec at{' '}
                    <Text code>{openApiUrl}</Text>.
                    {import.meta.env.DEV ? (
                      <> Start the backend on port <Text code>8081</Text>, then retry.</>
                    ) : (
                      <> Confirm the API is running (<Text code>{getApiBaseUrl()}</Text>), then retry.</>
                    )}
                  </Text>
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    block
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
          <div className="mst-swagger-ui swagger-docs-wrap">
            <SwaggerUI
              key={retryKey}
              url={openApiUrl}
              docExpansion="list"
              defaultModelsExpandDepth={isMobileModelsDepth()}
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

function isMobileModelsDepth(): number {
  if (typeof window === 'undefined') return 1;
  return window.matchMedia('(max-width: 767px)').matches ? 0 : 1;
}

export default ApiDocsPage;
