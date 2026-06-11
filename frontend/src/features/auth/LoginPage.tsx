import React from 'react';
import { Form, Input, Button, Card, Typography, Tag, Divider, Space } from 'antd';
import { UserOutlined, LockOutlined, CrownOutlined, TeamOutlined } from '@ant-design/icons';
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

  const loginAs = (role: 'ADMIN' | 'USER') => {
    dispatch(setCredentials({
      accessToken: 'dev-token',
      refreshToken: 'dev-refresh',
      user: role === 'ADMIN'
        ? { id: 1, email: 'admin@mstagritech.co.zw', fullName: 'Admin User', roles: ['ADMIN'] }
        : { id: 2, email: 'farmer@mstagritech.co.zw', fullName: 'Jane Farmer', roles: ['USER'] },
    }));
    navigate(from, { replace: true });
  };

  const onFinish = () => loginAs('ADMIN');

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

        <Divider style={{ margin: '0 0 16px' }}>Quick Login</Divider>
        <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }} size={10}>
          <Button
            block size="large" type="primary"
            icon={<CrownOutlined />}
            onClick={() => loginAs('ADMIN')}
            style={{ background: '#0891B2', borderColor: '#0891B2' }}
          >
            Login as Admin
          </Button>
          <Button
            block size="large"
            icon={<TeamOutlined />}
            onClick={() => loginAs('USER')}
            style={{ borderColor: '#16A34A', color: '#16A34A' }}
          >
            Login as Normal User
          </Button>
        </Space>

        <Divider style={{ margin: '0 0 16px' }}>Or enter credentials</Divider>
        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="email" label="Email">
            <Input prefix={<UserOutlined />} placeholder="any email or leave blank" />
          </Form.Item>
          <Form.Item name="password" label="Password">
            <Input.Password prefix={<LockOutlined />} placeholder="any value or leave blank" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Sign In as Admin
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
