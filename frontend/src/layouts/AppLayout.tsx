import React, { useEffect, useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Typography, Space, Button, Tag } from 'antd';
import {
  DashboardOutlined, TeamOutlined, ShopOutlined, ShoppingCartOutlined,
  CarOutlined, DollarOutlined, BarChartOutlined, SettingOutlined,
  AuditOutlined, GlobalOutlined, BellOutlined, LogoutOutlined,
  UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined, ApiOutlined,
  FileTextOutlined, SafetyOutlined, BuildOutlined, SwapOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/store';
import { clearCredentials, switchRole } from '../features/auth/authSlice';
import BrandLogo from '../components/BrandLogo';
import { useResizableSider } from '../hooks/useResizableSider';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const iconStyle = { fontSize: 26 };

const allMenuItems = [
  { key: '/', icon: <DashboardOutlined style={iconStyle} />, label: 'Dashboard' },
  { key: '/farmers', icon: <TeamOutlined style={iconStyle} />, label: 'Farmers' },
  { key: '/buyers', icon: <ShopOutlined style={iconStyle} />, label: 'Buyers' },
  { key: '/marketplace', icon: <GlobalOutlined style={iconStyle} />, label: 'Marketplace' },
  { key: '/orders', icon: <ShoppingCartOutlined style={iconStyle} />, label: 'Orders' },
  { key: '/payments', icon: <DollarOutlined style={iconStyle} />, label: 'Payments' },
  { key: '/shipments', icon: <CarOutlined style={iconStyle} />, label: 'Shipments' },
  { key: '/reports', icon: <FileTextOutlined style={iconStyle} />, label: 'Reports' },
  { key: '/analytics', icon: <BarChartOutlined style={iconStyle} />, label: 'Analytics' },
  {
    key: 'admin', icon: <SettingOutlined style={iconStyle} />, label: 'Administration',
    children: [
      { key: '/admin/users', icon: <UserOutlined style={iconStyle} />, label: 'Users' },
      { key: '/admin/roles', icon: <SafetyOutlined style={iconStyle} />, label: 'Roles & Permissions' },
      { key: '/admin/master-data', icon: <BuildOutlined style={iconStyle} />, label: 'Master Data' },
      { key: '/admin/logistics', icon: <CarOutlined style={iconStyle} />, label: 'Logistics Companies' },
      { key: '/admin/integrations', icon: <ApiOutlined style={iconStyle} />, label: 'Integrations' },
      { key: '/admin/audit-logs', icon: <AuditOutlined style={iconStyle} />, label: 'Audit Logs' },
      { key: '/admin/settings', icon: <SettingOutlined style={iconStyle} />, label: 'App Settings' },
    ],
  },
];

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const isAdmin = user?.roles.includes('ADMIN') ?? false;
  const [openKeys, setOpenKeys] = useState<string[]>(isAdmin ? ['admin'] : []);
  const { siderWidth, onResizeStart } = useResizableSider(collapsed);

  useEffect(() => {
    setOpenKeys((keys) => {
      if (isAdmin) return keys.includes('admin') ? keys : [...keys, 'admin'];
      return keys.filter((key) => key !== 'admin');
    });
  }, [isAdmin]);

  const userMenu = {
    items: [
      { key: 'profile', label: 'Profile', icon: <UserOutlined /> },
      {
        key: 'api-docs',
        label: 'API Documentation',
        icon: <ApiOutlined />,
        onClick: () => navigate('/api-docs'),
      },
      {
        key: 'switch-role',
        label: isAdmin ? 'Switch to: Normal User' : 'Switch to: Admin',
        icon: <SwapOutlined />,
        onClick: () => {
          dispatch(switchRole());
          navigate('/');
        },
      },
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
        width={siderWidth}
        collapsedWidth={80}
        style={{ position: 'fixed', height: '100vh', left: 0, top: 0, bottom: 0, zIndex: 100 }}
      >
        <div
          style={{
            height: 80, display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0 10px' : '0 12px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            width: '100%',
          }}
          onClick={() => navigate('/')}
        >
          <BrandLogo
            variant={collapsed ? 'icon-white' : 'primary-white'}
            height={collapsed ? 52 : 56}
            style={collapsed ? undefined : { width: '100%' }}
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          items={isAdmin ? allMenuItems : allMenuItems.filter((item) => item.key !== 'admin')}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, paddingTop: 8 }}
        />
        {!collapsed && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar"
            onMouseDown={onResizeStart}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 6,
              height: '100%',
              cursor: 'col-resize',
              zIndex: 101,
              background: 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          />
        )}
      </Sider>

      <Layout style={{ marginLeft: siderWidth, transition: collapsed ? 'margin-left 0.2s' : undefined, background: '#F0F9FF' }}>
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
                <Avatar
                  size={40}
                  style={{ backgroundColor: isAdmin ? '#0891B2' : '#16A34A' }}
                  src="/Assets/SVG/icon white.svg"
                  alt={user?.fullName || 'User'}
                >
                  {user?.fullName?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                {!collapsed && (
                  <Space size={6}>
                    <Text style={{ color: '#0C4A6E', fontWeight: 500 }}>{user?.fullName}</Text>
                    <Tag color={isAdmin ? 'cyan' : 'green'} style={{ margin: 0, fontSize: 11 }}>
                      {isAdmin ? 'ADMIN' : 'USER'}
                    </Tag>
                  </Space>
                )}
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
