import React from 'react';
import { Form, Input, Button, Card, Typography, Tag } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../app/store';
import { setCredentials } from './authSlice';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();

  const onFinish = (values: { email?: string }) => {
    // DEV MODE: bypass backend auth — any credentials accepted
    dispatch(setCredentials({
      accessToken: 'dev-token',
      refreshToken: 'dev-refresh',
      user: {
        id: 1,
        email: values.email || 'admin@mstagritech.co.zw',
        fullName: 'Admin User',
        roles: ['ADMIN'],
      },
    }));
    navigate(from, { replace: true });
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
          <br />
          <Tag color="orange" style={{ marginTop: 8 }}>Dev Mode — No password required</Tag>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="email" label="Email">
            <Input prefix={<UserOutlined />} placeholder="any email or leave blank" />
          </Form.Item>
          <Form.Item name="password" label="Password">
            <Input.Password prefix={<LockOutlined />} placeholder="any value or leave blank" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
