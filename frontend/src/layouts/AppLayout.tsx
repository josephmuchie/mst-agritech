import React, { useEffect, useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Typography, Space, Button, Tag, Drawer } from 'antd';
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
import { useIsMobile } from '../hooks/useIsMobile';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const iconStyle = { fontSize: 26 };
const mobileIconStyle = { fontSize: 22 };

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

const mobileMenuItems = allMenuItems.map((item) => ({
  ...item,
  icon: React.isValidElement(item.icon)
    ? React.cloneElement(item.icon as React.ReactElement<{ style?: React.CSSProperties }>, { style: mobileIconStyle })
    : item.icon,
  children: item.children?.map((child) => ({
    ...child,
    icon: React.isValidElement(child.icon)
      ? React.cloneElement(child.icon as React.ReactElement<{ style?: React.CSSProperties }>, { style: mobileIconStyle })
      : child.icon,
  })),
}));

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const isAdmin = user?.roles.includes('ADMIN') ?? false;
  const [openKeys, setOpenKeys] = useState<string[]>(isAdmin ? ['admin'] : []);
  const { siderWidth, onResizeStart } = useResizableSider(collapsed);

  const menuItems = isAdmin ? allMenuItems : allMenuItems.filter((item) => item.key !== 'admin');
  const mobileItems = isAdmin ? mobileMenuItems : mobileMenuItems.filter((item) => item.key !== 'admin');

  useEffect(() => {
    setOpenKeys((keys) => {
      if (isAdmin) return keys.includes('admin') ? keys : [...keys, 'admin'];
      return keys.filter((key) => key !== 'admin');
    });
  }, [isAdmin]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  const handleNavigate = (key: string) => {
    navigate(key);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

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

  const menuProps = {
    theme: 'dark' as const,
    mode: 'inline' as const,
    selectedKeys: [location.pathname],
    openKeys,
    onOpenChange: setOpenKeys,
    items: isMobile ? mobileItems : menuItems,
    onClick: ({ key }: { key: string }) => handleNavigate(key),
    style: { borderRight: 0, paddingTop: 8, flex: 1, overflowY: 'auto' as const },
  };

  const contentMargin = isMobile ? 0 : siderWidth;

  return (
    <Layout style={{ minHeight: '100dvh', background: '#F0F9FF' }}>
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          trigger={null}
          width={siderWidth}
          collapsedWidth={80}
          style={{ position: 'fixed', height: '100dvh', left: 0, top: 0, bottom: 0, zIndex: 100 }}
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
          <Menu {...menuProps} />
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
      )}

      {isMobile && (
        <Drawer
          className="mobile-nav-drawer"
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={280}
          closable={false}
          styles={{ body: { padding: 0 } }}
        >
          <div className="mobile-nav-logo" onClick={() => handleNavigate('/')}>
            <BrandLogo variant="primary-white" height={48} style={{ width: '100%' }} />
          </div>
          <Menu {...menuProps} />
        </Drawer>
      )}

      <Layout style={{ marginLeft: contentMargin, transition: !isMobile && collapsed ? 'margin-left 0.2s' : undefined, background: '#F0F9FF' }}>
        <Header className="app-header" style={{
          position: 'sticky', top: 0, zIndex: 99, background: '#FFFFFF',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>
          <Button
            type="text"
            aria-label={isMobile ? 'Open navigation menu' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            icon={isMobile || collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => (isMobile ? setDrawerOpen(true) : setCollapsed(!collapsed))}
            style={{ fontSize: 18, color: '#0C4A6E' }}
          />
          <Space size={isMobile ? 8 : 16}>
            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} aria-label="Notifications" />
            </Badge>
            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
              <Space style={{ cursor: 'pointer' }} aria-label="User menu">
                <Avatar
                  size={isMobile ? 36 : 40}
                  style={{ backgroundColor: isAdmin ? '#0891B2' : '#16A34A' }}
                  src="/Assets/SVG/icon white.svg"
                  alt={user?.fullName || 'User'}
                >
                  {user?.fullName?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <Space size={6}>
                  <Text className="app-header-user-name" style={{ color: '#0C4A6E', fontWeight: 500 }}>
                    {user?.fullName}
                  </Text>
                  <Tag className="app-header-role-tag" color={isAdmin ? 'cyan' : 'green'} style={{ margin: 0, fontSize: 11 }}>
                    {isAdmin ? 'ADMIN' : 'USER'}
                  </Tag>
                </Space>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
