import React, { useEffect, useState } from 'react';
import { Typography, Alert, Tag, Spin, Button } from 'antd';
import {
  ApiOutlined,
  ReloadOutlined,
  SafetyOutlined,
  LinkOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import '../styles/swaggerTheme.css';
import '../styles/apiDocs.css';
import { useAppSelector } from '../app/store';
import BrandLogo from '../components/BrandLogo';
import { getApiBaseUrl, getOpenApiUrl } from '../config/api';
import { useIsMobile } from '../hooks/useIsMobile';

const { Text, Title } = Typography;

interface SpecMeta {
  title?: string;
  version?: string;
  description?: string;
}

const ApiDocsPage: React.FC = () => {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const isMobile = useIsMobile();
  const [specStatus, setSpecStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [specMeta, setSpecMeta] = useState<SpecMeta | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const openApiUrl = getOpenApiUrl();
  const apiBaseUrl = getApiBaseUrl();

  useEffect(() => {
    let cancelled = false;
    setSpecStatus('loading');
    setSpecMeta(null);

    fetch(openApiUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: { info?: SpecMeta }) => {
        if (cancelled) return;
        setSpecMeta(json.info ?? null);
        setSpecStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setSpecStatus('error');
      });

    return () => { cancelled = true; };
  }, [retryKey, openApiUrl]);

  const displayApiOrigin = apiBaseUrl.startsWith('http')
    ? apiBaseUrl.replace(/\/api\/v1\/?$/, '')
    : (import.meta.env.DEV ? 'localhost:8081' : 'agritech-api.mst.co.zw');

  return (
    <div className={`api-docs-page${isMobile ? ' api-docs-page--mobile' : ''}`}>
      <section className="api-docs-hero">
        <div className="api-docs-hero-inner">
          <div className="api-docs-hero-top">
            <div className="api-docs-hero-brand">
              <div className="api-docs-hero-lockup">
                <BrandLogo
                  variant="icon-white"
                  height={28}
                  className="api-docs-hero-logo-img"
                />
                <Title level={isMobile ? 5 : 3} className="api-docs-hero-title">
                  API Documentation
                </Title>
              </div>
              <div className="api-docs-hero-details">
                {isMobile ? (
                  <Text className="api-docs-hero-subtitle api-docs-hero-subtitle--mobile">
                    Browse endpoints, try live requests, and inspect responses.
                  </Text>
                ) : (
                  <Text className="api-docs-hero-subtitle">
                    Explore and test MST Agritech REST endpoints. Expand any operation to view
                    schemas, send authenticated requests, and inspect live responses.
                  </Text>
                )}
                {specMeta?.title && (
                  <Text className="api-docs-hero-spec-title">
                    {specMeta.title}
                    {specMeta.version ? ` · v${specMeta.version}` : ''}
                  </Text>
                )}
              </div>
            </div>
            {specStatus === 'error' && (
              <div className="api-docs-hero-actions">
                <Button
                  icon={<ReloadOutlined />}
                  block={isMobile}
                  onClick={() => setRetryKey((k) => k + 1)}
                >
                  Retry
                </Button>
              </div>
            )}
          </div>

          <div className="api-docs-meta">
            <Tag className="api-docs-meta-tag--highlight" icon={<CodeOutlined />}>
              OpenAPI 3.0
            </Tag>
            <Tag icon={<ApiOutlined />}>REST v1</Tag>
            <Tag icon={<SafetyOutlined />}>Bearer JWT</Tag>
            {specStatus === 'ready' && <Tag color="success">Ready</Tag>}
            {specStatus === 'loading' && <Tag color="processing">Loading…</Tag>}
            {specStatus === 'error' && <Tag color="error">Unavailable</Tag>}
          </div>

          <div className="api-docs-endpoints">
            <div className="api-docs-endpoint">
              <span className="api-docs-endpoint-label">Base path</span>
              <span className="api-docs-endpoint-value"><code>/api/v1</code></span>
            </div>
            <div className="api-docs-endpoint">
              <span className="api-docs-endpoint-label">API host</span>
              <span className="api-docs-endpoint-value">
                <code>{displayApiOrigin}</code>
              </span>
            </div>
            {!isMobile && (
              <div className="api-docs-endpoint">
                <span className="api-docs-endpoint-label">OpenAPI spec</span>
                <span className="api-docs-endpoint-value">
                  <code>{openApiUrl}</code>
                </span>
              </div>
            )}
          </div>

          <div className="api-docs-auth-banner">
            <SafetyOutlined />
            <span className="api-docs-auth-banner-text">
              {isMobile ? (
                <>Session token attached automatically. Tap <strong>Authorize</strong> below to override.</>
              ) : (
                <>
                  Your session token is sent automatically on every <strong>Try it out</strong> request.
                  Use the <strong>Authorize</strong> control below to override the bearer token.
                </>
              )}
            </span>
          </div>
        </div>
      </section>

      <section className="api-docs-explorer">
        <div className="api-docs-explorer-toolbar">
          <Text className="api-docs-explorer-toolbar-title">
            <LinkOutlined /> {isMobile ? 'Endpoints' : 'Endpoint Explorer'}
          </Text>
          <Text type="secondary" className="api-docs-explorer-toolbar-hint">
            {isMobile ? 'Search or tap to expand' : 'Filter by path or tag · Click an operation to expand'}
          </Text>
        </div>

        <div className="api-docs-explorer-body">
          {specStatus === 'loading' && (
            <div className="api-docs-state">
              <Spin size="large" tip={isMobile ? 'Loading spec…' : 'Loading API specification...'} />
            </div>
          )}

          {specStatus === 'error' && (
            <div className="api-docs-state api-docs-state--error">
              <div className="api-docs-error-panel">
                <Alert
                  type="error"
                  showIcon
                  message="Unable to load API documentation"
                  description={
                    <div className="api-docs-error-body">
                      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                        Could not reach the OpenAPI spec
                        {!isMobile && <> at <Text code>{openApiUrl}</Text></>}.
                        {import.meta.env.DEV ? (
                          <> Start the backend on port <Text code>8081</Text>, then retry.</>
                        ) : (
                          <> Confirm the API is running at <Text code>{getApiBaseUrl()}</Text>.</>
                        )}
                      </Text>
                      <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        block
                        onClick={() => setRetryKey((k) => k + 1)}
                      >
                        Retry loading spec
                      </Button>
                    </div>
                  }
                />
              </div>
            </div>
          )}

          {specStatus === 'ready' && (
            <div className="mst-swagger-ui swagger-docs-wrap">
              <SwaggerUI
                key={`${retryKey}-${isMobile ? 'm' : 'd'}`}
                url={openApiUrl}
                docExpansion={isMobile ? 'none' : 'list'}
                defaultModelsExpandDepth={0}
                displayRequestDuration
                tryItOutEnabled
                persistAuthorization
                requestInterceptor={(req) => {
                  if (accessToken) {
                    req.headers = { ...req.headers, Authorization: `Bearer ${accessToken}` };
                  }
                  return req;
                }}
                deepLinking={!isMobile}
                filter
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ApiDocsPage;
