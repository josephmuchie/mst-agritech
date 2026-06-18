import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider, App as AntApp } from 'antd';
import { store } from './app/store';
import themeConfig from './theme/themeConfig';
import AppLayout from './layouts/AppLayout';
import LoginPage from './features/auth/LoginPage';
import SsoCallbackPage from './features/auth/SsoCallbackPage';
import RequireAuth from './features/auth/RequireAuth';
import DashboardPage from './pages/DashboardPage';
import FarmersPage from './pages/FarmersPage';
import BuyersPage from './pages/BuyersPage';
import MarketplacePage from './pages/MarketplacePage';
import PunchoutPage from './pages/PunchoutPage';
import OrdersPage from './pages/OrdersPage';
import PaymentsPage from './pages/PaymentsPage';
import ShipmentsPage from './pages/ShipmentsPage';
import ReportsPage from './pages/ReportsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UsersPage from './pages/admin/UsersPage';
import RolesPage from './pages/admin/RolesPage';
import MasterDataPage from './pages/admin/MasterDataPage';
import LogisticsPage from './pages/admin/LogisticsPage';
import IntegrationsPage from './pages/admin/IntegrationsPage';
import ProcurementIntegrationPage from './pages/admin/ProcurementIntegrationPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import AppSettingsPage from './pages/admin/AppSettingsPage';
import DataIngestionPage from './pages/admin/DataIngestionPage';
import ApiDocsPage from './pages/ApiDocsPage';
import NotFoundPage from './pages/NotFoundPage';
import ForbiddenPage from './pages/ForbiddenPage';

const App: React.FC = () => (
  <Provider store={store}>
    <ConfigProvider theme={themeConfig}>
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/sso/callback" element={<SsoCallbackPage />} />
            <Route path="/punchout" element={<PunchoutPage />} />
            <Route path="/403" element={<ForbiddenPage />} />
            <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
              <Route index element={<DashboardPage />} />
              <Route path="farmers" element={<FarmersPage />} />
              <Route path="buyers" element={<BuyersPage />} />
              <Route path="marketplace" element={<MarketplacePage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="shipments" element={<ShipmentsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="api-docs" element={<ApiDocsPage />} />
              <Route path="admin/users" element={<RequireAuth allowedRoles={['ADMIN']}><UsersPage /></RequireAuth>} />
              <Route path="admin/roles" element={<RequireAuth allowedRoles={['ADMIN']}><RolesPage /></RequireAuth>} />
              <Route path="admin/master-data" element={<RequireAuth allowedRoles={['ADMIN']}><MasterDataPage /></RequireAuth>} />
              <Route path="admin/logistics" element={<RequireAuth allowedRoles={['ADMIN']}><LogisticsPage /></RequireAuth>} />
              <Route path="admin/integrations" element={<RequireAuth allowedRoles={['ADMIN']}><IntegrationsPage /></RequireAuth>} />
              <Route path="admin/procurement" element={<RequireAuth allowedRoles={['ADMIN']}><ProcurementIntegrationPage /></RequireAuth>} />
              <Route path="admin/audit-logs" element={<RequireAuth allowedRoles={['ADMIN']}><AuditLogsPage /></RequireAuth>} />
              <Route path="admin/settings" element={<RequireAuth allowedRoles={['ADMIN']}><AppSettingsPage /></RequireAuth>} />
              <Route path="admin/config/ingestion" element={<DataIngestionPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </Provider>
);

export default App;
