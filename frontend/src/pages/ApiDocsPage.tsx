import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Typography, Alert, Tag, Spin, Button, message } from 'antd';
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
import {
  getApiBaseUrl,
  getDisplayApiHost,
  getOpenApiUrl,
  patchOpenApiSpec,
} from '../config/api';
import { useIsMobile } from '../hooks/useIsMobile';

const { Text, Title } = Typography;

interface SpecMeta {
  title?: string;
  version?: string;
  description?: string;
}

type SwaggerSystem = {
  authActions?: {
    authorize: (auth: Record<string, { value: string }>) => void;
  };
};

const ApiDocsPage: React.FC = () => {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const isMobile = useIsMobile();
  const [specStatus, setSpecStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [specMeta, setSpecMeta] = useState<SpecMeta | null>(null);
  const [openApiSpec, setOpenApiSpec] = useState<Record<string, unknown> | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const openApiUrl = getOpenApiUrl();
  const displayApiHost = getDisplayApiHost();
  const hasToken = Boolean(accessToken);

  useEffect(() => {
    let cancelled = false;
    setSpecStatus('loading');
    setSpecMeta(null);
    setOpenApiSpec(null);

    fetch(openApiUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: Record<string, unknown> & { info?: SpecMeta }) => {
        if (cancelled) return;
        setSpecMeta(json.info ?? null);
        setOpenApiSpec(patchOpenApiSpec(json));
        setSpecStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setSpecStatus('error');
      });

    return () => { cancelled = true; };
  }, [retryKey, openApiUrl]);

  const applySwaggerAuth = useCallback((system: SwaggerSystem) => {
    if (!accessToken || !system.authActions?.authorize) return;
    system.authActions.authorize({
      bearerAuth: { value: accessToken },
    });
  }, [accessToken]);

  const requestInterceptor = useCallback((req: { headers?: Record<string, string>; url?: string }) => {
    if (!accessToken) {
      message.error('Sign in required — API requests need an active session token.');
      throw new Error('Authentication required');
    }
    req.headers = { ...req.headers, Authorization: `Bearer ${accessToken}` };
    return req;
  }, [accessToken]);

  const responseInterceptor = useCallback((res: { text?: string; data?: string; body?: unknown }) => {
    const raw = res.text ?? res.data;
    if (typeof raw === 'string' && raw.trim().startsWith('{')) {
      try {
        const formatted = JSON.stringify(JSON.parse(raw), null, 2);
        if (res.text !== undefined) res.text = formatted;
        if (res.data !== undefined) res.data = formatted;
      } catch {
        /* keep original */
      }
    }
    return res;
  }, []);

  const swaggerKey = useMemo(
    () => `${retryKey}-${accessToken ?? 'anon'}-${isMobile ? 'm' : 'd'}`,
    [retryKey, accessToken, isMobile],
  );

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
            {specStatus === 'loading' && <Tag color="processing">Loading…</Tag>}
            {specStatus === 'error' && <Tag color="error">Unavailable</Tag>}
          </div>

          <div className="api-docs-endpoints-inline">
            <span className="api-docs-endpoint-inline">
              <span className="api-docs-endpoint-label">Base path</span>
              <code>/api/v1</code>
            </span>
            <span className="api-docs-endpoint-sep" aria-hidden>·</span>
            <span className="api-docs-endpoint-inline">
              <span className="api-docs-endpoint-label">API host</span>
              <code>{displayApiHost}</code>
            </span>
            {!isMobile && (
              <>
                <span className="api-docs-endpoint-sep" aria-hidden>·</span>
                <span className="api-docs-endpoint-inline">
                  <span className="api-docs-endpoint-label">Spec</span>
                  <code>{openApiUrl}</code>
                </span>
              </>
            )}
          </div>

          <div className={`api-docs-auth-banner${hasToken ? '' : ' api-docs-auth-banner--warning'}`}>
            <SafetyOutlined />
            <span className="api-docs-auth-banner-text">
              {!hasToken ? (
                <>
                  <strong>Not signed in.</strong> Sign in to the app first — your session token is required for Try it out requests.
                </>
              ) : isMobile ? (
                <>Session token attached automatically on every request.</>
              ) : (
                <>
                  Your session token is sent automatically on every <strong>Try it out</strong> request.
                  Use <strong>Authorize</strong> below only if you need to override it.
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

          {specStatus === 'ready' && openApiSpec && (
            <div className="mst-swagger-ui swagger-docs-wrap">
              <SwaggerUI
                key={swaggerKey}
                spec={openApiSpec}
                docExpansion="list"
                defaultModelsExpandDepth={0}
                defaultModelRendering="example"
                displayRequestDuration
                tryItOutEnabled={hasToken}
                persistAuthorization
                requestInterceptor={requestInterceptor}
                responseInterceptor={responseInterceptor}
                onComplete={applySwaggerAuth}
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
