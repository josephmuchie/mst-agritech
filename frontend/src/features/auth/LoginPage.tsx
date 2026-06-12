import React, { useCallback, useState } from 'react';
import { Form, Input, Button, Typography, Tag, Divider, Space, Alert } from 'antd';
import { UserOutlined, LockOutlined, CrownOutlined, TeamOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../app/store';
import { normalizeAuthResponse, setCredentials } from './authSlice';
import { useDiscoverSsoQuery, useLazyGetSsoAuthorizeQuery, useLoginMutation } from '../../app/apiSlice';
import BrandLogo from '../../components/BrandLogo';
import { useIsMobile } from '../../hooks/useIsMobile';

const { Title, Text, Paragraph } = Typography;

const SSO_CALLBACK_URL = `${window.location.origin}/login/sso/callback`;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [login, { isLoading }] = useLoginMutation();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [ssoStarting, setSsoStarting] = useState(false);
  const isMobile = useIsMobile();

  const { data: ssoInfo } = useDiscoverSsoQuery(
    { email: email || undefined },
    { skip: !email.includes('@') },
  );

  const [getAuthorize] = useLazyGetSsoAuthorizeQuery();

  const loginDev = (role: 'ADMIN' | 'USER') => {
    dispatch(setCredentials({
      accessToken: 'dev-token',
      refreshToken: 'dev-refresh',
      user: role === 'ADMIN'
        ? { id: 1, email: 'admin@mstagritech.co.zw', fullName: 'Admin User', roles: ['ADMIN'] }
        : { id: 2, email: 'farmer@mstagritech.co.zw', fullName: 'Jane Farmer', roles: ['USER'] },
    }));
    navigate(from, { replace: true });
  };

  const onFinish = async (values: { email: string; password: string }) => {
    setError(null);
    try {
      const result = await login({ email: values.email, password: values.password }).unwrap();
      dispatch(setCredentials(normalizeAuthResponse(result)));
      navigate(from, { replace: true });
    } catch {
      setError('Login failed — check credentials or use company SSO if enabled for your organization.');
    }
  };

  const startSso = useCallback(async () => {
    if (!ssoInfo?.ssoEnabled || !ssoInfo.tenantSlug) {
      setError('SSO is not available for this email domain.');
      return;
    }
    const emailValue = form.getFieldValue('email') as string;
    if (!emailValue?.includes('@')) {
      setError('Enter your work email before using company SSO.');
      return;
    }
    setError(null);
    setSsoStarting(true);
    try {
      const result = await getAuthorize({
        tenantSlug: ssoInfo.tenantSlug,
        redirectUri: SSO_CALLBACK_URL,
        emailHint: emailValue,
      }).unwrap();
      window.location.href = result.authorizationUrl;
    } catch {
      setError('Unable to start company SSO. Ensure the backend is running and SSO is enabled in admin settings.');
      setSsoStarting(false);
    }
  }, [ssoInfo, form, getAuthorize]);

  const passwordLoginAllowed = ssoInfo?.allowPasswordLogin !== false;

  return (
    <div className="auth-page">
      <section className="auth-page-brand" aria-label="MST Agritech">
        <div className="auth-page-brand-inner">
          <BrandLogo
            variant="primary-white"
            height={220}
            className="auth-page-logo"
          />
          <Title level={2} className="auth-page-tagline">
            Zimbabwe&apos;s Global Agricultural Platform
          </Title>
          <Paragraph className="auth-page-description">
            Connect farmers, buyers, and logistics on one trusted platform for trade,
            compliance, and real-time market intelligence.
          </Paragraph>
        </div>
        <div className="auth-page-brand-accent" aria-hidden />
      </section>

      <section className="auth-page-panel">
        <div className="auth-page-form-wrap">
          <div className="auth-page-form-header">
            <Title level={isMobile ? 4 : 3} className="auth-page-form-title">
              Welcome back
            </Title>
            <Text type="secondary" className="auth-page-form-subtitle">
              Sign in to your MST Agritech account
            </Text>
          </div>

          {ssoInfo?.ssoEnabled && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message={`${ssoInfo.tenantName ?? 'Your organization'} supports company sign-on`}
              description={`Use "${ssoInfo.providerLabel ?? 'Corporate SSO'}" with your work email.`}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            size={isMobile ? 'middle' : 'large'}
            className="auth-page-form"
          >
            <Form.Item name="email" label="Work Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
              <Input
                prefix={<UserOutlined />}
                placeholder="you@company.com"
                onChange={(e) => setEmail(e.target.value.trim())}
              />
            </Form.Item>

            {ssoInfo?.ssoEnabled && (
              <Form.Item>
                <Button
                  block
                  size="large"
                  icon={<SafetyCertificateOutlined />}
                  loading={ssoStarting}
                  onClick={() => void startSso()}
                  className="auth-sso-button"
                >
                  Sign in with {ssoInfo.providerLabel ?? 'Company SSO'}
                </Button>
              </Form.Item>
            )}

            {passwordLoginAllowed && (
              <>
                {ssoInfo?.ssoEnabled && (
                  <Divider plain style={{ margin: '8px 0 16px' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>or use password</Text>
                  </Divider>
                )}
                <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Enter your password' }]}>
                  <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button type="primary" htmlType="submit" block loading={isLoading} size="large">
                    Sign In
                  </Button>
                </Form.Item>
              </>
            )}

            {!passwordLoginAllowed && !ssoInfo?.ssoEnabled && (
              <Alert type="warning" showIcon message="Sign-in options are not configured for this email domain." />
            )}

            {error && <Alert message={error} type="warning" showIcon style={{ marginTop: 16 }} />}
          </Form>

          <div className="auth-page-dev">
            <Divider className="auth-page-dev-divider">
              <Text type="secondary" className="auth-page-dev-label">Dev quick login</Text>
            </Divider>
            <Space direction="vertical" className="auth-page-dev-actions" size={8}>
              <Button
                block
                size={isMobile ? 'middle' : 'large'}
                icon={<CrownOutlined />}
                onClick={() => loginDev('ADMIN')}
                className="auth-dev-btn auth-dev-btn--admin"
              >
                Login as Admin
              </Button>
              <Button
                block
                size={isMobile ? 'middle' : 'large'}
                icon={<TeamOutlined />}
                onClick={() => loginDev('USER')}
                className="auth-dev-btn auth-dev-btn--user"
              >
                Login as User
              </Button>
            </Space>
            <div className="auth-page-dev-tag">
              <Tag color="orange">Dev mode — bypasses auth</Tag>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
