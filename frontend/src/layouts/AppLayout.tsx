import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Typography, Space, Button } from 'antd';
import {
  DashboardOutlined, TeamOutlined, ShopOutlined, ShoppingCartOutlined,
  CarOutlined, DollarOutlined, BarChartOutlined, SettingOutlined,
  AuditOutlined, GlobalOutlined, BellOutlined, LogoutOutlined,
  UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined, ApiOutlined,
  FileTextOutlined, SafetyOutlined, BuildOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/store';
import { clearCredentials } from '../features/auth/authSlice';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/farmers', icon: <TeamOutlined />, label: 'Farmers' },
  { key: '/buyers', icon: <ShopOutlined />, label: 'Buyers' },
  { key: '/marketplace', icon: <GlobalOutlined />, label: 'Marketplace' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Orders' },
  { key: '/payments', icon: <DollarOutlined />, label: 'Payments' },
  { key: '/shipments', icon: <CarOutlined />, label: 'Shipments' },
  { key: '/reports', icon: <FileTextOutlined />, label: 'Reports' },
  { key: '/analytics', icon: <BarChartOutlined />, label: 'Analytics' },
  {
    key: 'admin', icon: <SettingOutlined />, label: 'Administration',
    children: [
      { key: '/admin/users', icon: <UserOutlined />, label: 'Users' },
      { key: '/admin/roles', icon: <SafetyOutlined />, label: 'Roles & Permissions' },
      { key: '/admin/master-data', icon: <BuildOutlined />, label: 'Master Data' },
      { key: '/admin/logistics', icon: <CarOutlined />, label: 'Logistics Companies' },
      { key: '/admin/integrations', icon: <ApiOutlined />, label: 'Integrations' },
      { key: '/admin/audit-logs', icon: <AuditOutlined />, label: 'Audit Logs' },
      { key: '/admin/settings', icon: <SettingOutlined />, label: 'App Settings' },
    ],
  },
];

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const userMenu = {
    items: [
      { key: 'profile', label: 'Profile', icon: <UserOutlined /> },
      { type: 'divider' as const },
      {
        key: 'logout', label: 'Sign Out', icon: <LogoutOutlined />, danger: true,
        onClick: () => { dispatch(clearCredentials()); navigate('/login'); },
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#F0F9FF' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={240}
        style={{ position: 'fixed', height: '100vh', left: 0, top: 0, bottom: 0, zIndex: 100 }}
      >
        <div style={{
          height: 64, display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 20px', borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: collapsed ? 20 : 16, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {collapsed ? '🌿' : '🌿 MST Agritech'}
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['admin']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, paddingTop: 8 }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s', background: '#F0F9FF' }}>
        <Header style={{
          position: 'sticky', top: 0, zIndex: 99, background: '#FFFFFF',
          padding: '0 24px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, color: '#0C4A6E' }}
          />
          <Space size={16}>
            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
            </Badge>
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#0891B2' }}>
                  {user?.fullName?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                {!collapsed && <Text style={{ color: '#0C4A6E', fontWeight: 500 }}>{user?.fullName}</Text>}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ margin: '24px', minHeight: 'calc(100vh - 64px - 48px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
