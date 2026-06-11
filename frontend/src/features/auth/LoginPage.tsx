import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Tag, Divider, Space, Alert } from 'antd';
import { UserOutlined, LockOutlined, CrownOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../app/store';
import { setCredentials } from './authSlice';
import { useLoginMutation } from '../../app/apiSlice';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [login, { isLoading }] = useLoginMutation();
  const [error, setError] = useState<string | null>(null);

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
      dispatch(setCredentials(result));
      navigate(from, { replace: true });
    } catch {
      setError('Login failed — backend may be offline. Use the dev quick-login buttons below.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'linear-gradient(135deg, #0C4A6E 0%, #0891B2 100%)',
    }}>
      <Card style={{ width: 420, borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🌿</div>
          <Title level={3} style={{ color: '#0C4A6E', marginBottom: 4 }}>MST Agritech</Title>
          <Text type="secondary">Zimbabwe's Global Agricultural Platform</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
            <Input prefix={<UserOutlined />} placeholder="your@email.com" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Enter your password' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          {error && <Alert message={error} type="warning" showIcon style={{ marginBottom: 16 }} />}
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              Sign In
            </Button>
          </Form.Item>
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
