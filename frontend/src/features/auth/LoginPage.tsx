import React, { useCallback, useState } from 'react';
import { Form, Input, Button, Typography, Tag, Divider, Alert } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { UserOutlined, LockOutlined, CrownOutlined, TeamOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../app/store';
import { normalizeAuthResponse, setCredentials } from './authSlice';
import { useDiscoverSsoQuery, useLazyGetSsoAuthorizeQuery, useLoginMutation } from '../../app/apiSlice';
import BrandLogo from '../../components/BrandLogo';
import { useIsMobile } from '../../hooks/useIsMobile';

const { Title, Text } = Typography;

const SSO_CALLBACK_URL = `${window.location.origin}/login/sso/callback`;

type ControlSize = 'middle' | 'large';

interface LoginFormProps {
  form: FormInstance;
  controlSize: ControlSize;
  setEmail: (value: string) => void;
  ssoInfo: ReturnType<typeof useDiscoverSsoQuery>['data'];
  passwordLoginAllowed: boolean;
  ssoStarting: boolean;
  isLoading: boolean;
  error: string | null;
  onFinish: (values: { email: string; password: string }) => void;
  onStartSso: () => void;
  compact?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  form,
  controlSize,
  setEmail,
  ssoInfo,
  passwordLoginAllowed,
  ssoStarting,
  isLoading,
  error,
  onFinish,
  onStartSso,
  compact,
}) => (
  <>
    {ssoInfo?.ssoEnabled && (
      <Alert
        className="auth-page-sso-hint"
        type="info"
        showIcon
        message={`${ssoInfo.tenantName ?? 'Your organization'} supports company sign-on`}
        description={compact ? undefined : `Use "${ssoInfo.providerLabel ?? 'Corporate SSO'}" with your work email.`}
      />
    )}

    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      size={controlSize}
      className="auth-page-form"
      requiredMark={false}
    >
      <Form.Item name="email" label="Work Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
        <Input
          prefix={<UserOutlined />}
          placeholder="you@company.com"
          onChange={(e) => setEmail(e.target.value.trim())}
        />
      </Form.Item>

      {ssoInfo?.ssoEnabled && (
        <Form.Item className="auth-page-form-item--tight">
          <Button
            block
            size={controlSize}
            icon={<SafetyCertificateOutlined />}
            loading={ssoStarting}
            onClick={() => void onStartSso()}
            className="auth-sso-button"
          >
            Sign in with {ssoInfo.providerLabel ?? 'Company SSO'}
          </Button>
        </Form.Item>
      )}

      {passwordLoginAllowed && (
        <>
          {ssoInfo?.ssoEnabled && (
            <Divider plain className="auth-page-divider">
              <Text type="secondary" className="auth-page-divider-text">or password</Text>
            </Divider>
          )}
          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Enter your password' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item className="auth-page-form-item--submit">
            <Button type="primary" htmlType="submit" block loading={isLoading} size={controlSize}>
              Sign In
            </Button>
          </Form.Item>
        </>
      )}

      {!passwordLoginAllowed && !ssoInfo?.ssoEnabled && (
        <Alert type="warning" showIcon message="Sign-in options are not configured for this email domain." />
      )}

      {error && <Alert className="auth-page-error" message={error} type="warning" showIcon />}
    </Form>
  </>
);

interface DevLoginProps {
  controlSize: ControlSize;
  onLoginDev: (role: 'ADMIN' | 'USER') => void;
  compact?: boolean;
}

const DevLogin: React.FC<DevLoginProps> = ({ controlSize, onLoginDev, compact }) => (
  <div className={`auth-page-dev${compact ? ' auth-page-dev--compact' : ''}`}>
    <Divider className="auth-page-dev-divider">
      <Text type="secondary" className="auth-page-dev-label">Dev quick login</Text>
    </Divider>
    <div className="auth-page-dev-actions">
      <Button
        block
        size={controlSize}
        icon={<CrownOutlined />}
        onClick={() => onLoginDev('ADMIN')}
        className="auth-dev-btn auth-dev-btn--admin"
      >
        {compact ? 'Admin' : 'Login as Admin'}
      </Button>
      <Button
        block
        size={controlSize}
        icon={<TeamOutlined />}
        onClick={() => onLoginDev('USER')}
        className="auth-dev-btn auth-dev-btn--user"
      >
        {compact ? 'User' : 'Login as User'}
      </Button>
    </div>
    <Tag color="orange" className="auth-page-dev-tag">Dev mode — bypasses auth</Tag>
  </div>
);

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
        ? { id: 1, email: 'info@mst.co.zw', fullName: 'Admin User', roles: ['ADMIN'] }
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
  const controlSize: ControlSize = isMobile ? 'middle' : 'large';

  const formProps = {
    form,
    controlSize,
    setEmail,
    ssoInfo,
    passwordLoginAllowed,
    ssoStarting,
    isLoading,
    error,
    onFinish,
    onStartSso: startSso,
  };

  return (
    <div className={`auth-page${isMobile ? ' auth-page--mobile' : ''}`}>
      {isMobile ? (
        <div className="auth-mobile-view">
          <section className="auth-mobile-brand" aria-label="MST Agritech">
            <BrandLogo variant="primary-white" height={64} className="auth-mobile-logo" />
            <Text className="auth-mobile-tagline">Zimbabwe&apos;s Global Agricultural Platform</Text>
          </section>

          <section className="auth-mobile-body">
            <div className="auth-mobile-body-inner">
              <header className="auth-mobile-intro">
                <Title level={4} className="auth-mobile-title">Sign in</Title>
                <Text type="secondary" className="auth-mobile-subtitle">
                  Use your work email to access MST Agritech
                </Text>
              </header>

              <LoginForm {...formProps} compact />
            </div>

            <DevLogin controlSize={controlSize} onLoginDev={loginDev} compact />
          </section>
        </div>
      ) : (
        <>
          <section className="auth-page-brand" aria-label="MST Agritech">
            <div className="auth-page-brand-inner">
              <BrandLogo variant="primary-white" height={220} className="auth-page-logo" />
              <Title level={2} className="auth-page-tagline">
                Zimbabwe&apos;s Global Agricultural Platform
              </Title>
              <Text className="auth-page-description">
                Connect farmers, buyers, and logistics on one trusted platform for trade,
                compliance, and real-time market intelligence.
              </Text>
            </div>
            <div className="auth-page-brand-accent" aria-hidden />
          </section>

          <section className="auth-page-panel">
            <div className="auth-page-shell">
              <div className="auth-page-form-wrap">
                <div className="auth-page-form-header">
                  <Title level={3} className="auth-page-form-title">Welcome back</Title>
                  <Text type="secondary" className="auth-page-form-subtitle">
                    Sign in to your MST Agritech account
                  </Text>
                </div>

                <LoginForm {...formProps} />

                <DevLogin controlSize={controlSize} onLoginDev={loginDev} />
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default LoginPage;
