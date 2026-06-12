import React, { useCallback, useState } from 'react';
import { Form, Input, Button, Card, Typography, Tag, Divider, Space, Alert } from 'antd';
import { UserOutlined, LockOutlined, CrownOutlined, TeamOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../app/store';
import { normalizeAuthResponse, setCredentials } from './authSlice';
import { useDiscoverSsoQuery, useLazyGetSsoAuthorizeQuery, useLoginMutation } from '../../app/apiSlice';
import BrandLogo from '../../components/BrandLogo';

const { Text } = Typography;

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
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, #0C4A6E 0%, #0891B2 100%)',
    }}>
      <BrandLogo
        variant="icon-white"
        height={420}
        style={{
          position: 'absolute', right: '-80px', bottom: '-80px',
          opacity: 0.08, pointerEvents: 'none',
        }}
      />
      <Card style={{ width: 420, borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <BrandLogo
            variant="primary-cyan"
            height={72}
            style={{ margin: '0 auto 16px' }}
          />
          <Text type="secondary">Zimbabwe's Global Agricultural Platform</Text>
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

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
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
                style={{ borderColor: '#0891B2', color: '#0891B2', marginBottom: passwordLoginAllowed ? 8 : 0 }}
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
              <Form.Item>
                <Button type="primary" htmlType="submit" block loading={isLoading}>
                  Sign In
                </Button>
              </Form.Item>
            </>
          )}

          {!passwordLoginAllowed && !ssoInfo?.ssoEnabled && (
            <Alert type="warning" showIcon message="Sign-in options are not configured for this email domain." />
          )}

          {error && <Alert message={error} type="warning" showIcon style={{ marginBottom: 16 }} />}
        </Form>

        <Divider style={{ margin: '0 0 16px' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Dev Mode — Quick Login</Text>
        </Divider>
        <Space direction="vertical" style={{ width: '100%' }} size={10}>
          <Button
            block icon={<CrownOutlined />}
            onClick={() => loginDev('ADMIN')}
            style={{ borderColor: '#0891B2', color: '#0891B2' }}
          >
            Dev: Login as Admin
          </Button>
          <Button
            block icon={<TeamOutlined />}
            onClick={() => loginDev('USER')}
            style={{ borderColor: '#16A34A', color: '#16A34A' }}
          >
            Dev: Login as Normal User
          </Button>
        </Space>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Tag color="orange">Dev Mode — Quick login bypasses auth</Tag>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
