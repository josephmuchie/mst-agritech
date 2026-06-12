import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface UserResponse {
  id: number; email: string; fullName: string; active: boolean; roles: string[]; createdAt: string;
}
export interface FarmerResponse {
  id: number; userId: number; fullName: string; email: string; farmName: string; province: string;
  countryName: string; countryCode: string; gpsLatitude: number; gpsLongitude: number;
  totalHectares: number; verified: boolean; createdAt: string;
}
export interface BuyerResponse {
  id: number; userId: number; companyName: string; countryName: string; buyerType: string;
  contactEmail: string; contactPhone: string; verified: boolean; createdAt: string;
}
export interface OrderResponse {
  id: number; reference: string; farmerId: number; farmerName: string; buyerId: number;
  buyerCompanyName: string; status: string; totalAmount: number; currencyCode: string;
  notes: string; createdAt: string; updatedAt: string;
}
export interface DashboardKpiResponse {
  totalOrders: number; activeFarmers: number; revenueUsd: number; activeShipments: number;
}
export interface AuditLogResponse {
  id: number; userId: number; action: string; entityType: string; entityId: string;
  ipAddress: string; responseStatus: number; createdAt: string;
}
export interface RoleResponse { id: number; name: string; description: string; }
export interface CountryResponse { id: number; isoCode: string; name: string; region: string; active: boolean; }
export interface CurrencyResponse { id: number; code: string; name: string; symbol: string; active: boolean; }
export interface ProductCategoryResponse { id: number; name: string; description: string; active: boolean; }
export interface IntegrationConfigResponse {
  id: number; systemType: string; displayName: string; endpointUrl: string | null;
  active: boolean; configured: boolean; environment: string; dataFlows: string[];
  description: string; lastSyncAt: string | null; updatedAt: string;
}
export interface IntegrationInvokeResponse {
  runId: number; systemType: string; flowType: string; status: string;
  recordsProcessed: number; message: string; completedAt: string;
}
export interface IntegrationSyncRunResponse {
  id: number; integrationConfigId: number; flowType: string; triggerType: string;
  status: string; recordsProcessed: number; errorMessage: string | null;
  startedAt: string; completedAt: string | null;
}
export interface ExternalInvoiceResponse {
  id: number; integrationConfigId: number; externalId: string; invoiceNumber: string;
  buyerName: string; orderReference: string | null; amount: number; currencyCode: string;
  status: string; issueDate: string | null; dueDate: string | null; syncedAt: string;
}
export interface IntegrationSettingsResponse {
  autoSyncEnabled: boolean; defaultRetryCount: number; oracleEnabled: boolean;
}
export interface LoginRequest { email: string; password: string; }
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId?: number;
  email?: string;
  fullName?: string;
  roles?: string[];
  tenantId?: number;
  tenantSlug?: string;
  tenantName?: string;
  user?: { id: number; email: string; fullName: string; roles: string[]; };
}
export interface SsoDiscoverResponse {
  ssoEnabled: boolean;
  tenantSlug?: string;
  tenantName?: string;
  providerLabel?: string;
  allowPasswordLogin?: boolean;
}
export interface SsoAuthorizeResponse {
  authorizationUrl: string;
  state: string;
}
export interface TenantSsoConfigResponse {
  tenantId: number;
  tenantSlug: string;
  tenantName: string;
  enabled: boolean;
  providerLabel: string;
  providerType: string;
  issuerUri?: string;
  clientId?: string;
  hasClientSecret: boolean;
  authorizationUri?: string;
  tokenUri?: string;
  userinfoUri?: string;
  scopes: string;
  autoProvisionUsers: boolean;
  allowPasswordLogin: boolean;
  defaultRoleName: string;
  emailDomains?: string;
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'User', 'Role', 'Permission', 'AuditLog',
    'Country', 'Currency', 'ProductCategory', 'Product',
    'Farmer', 'Buyer', 'LogisticsCompany',
    'Order', 'OrderItem', 'Quote', 'Payment', 'Shipment',
    'SubscriptionPlan', 'Subscription', 'AppSetting', 'IntegrationConfig',
    'MarketPrice', 'Report',
    'IntegrationConfig', 'IntegrationSyncRun', 'ExternalInvoice', 'IntegrationSettings',
    'TenantSso',
  ],
  endpoints: (builder) => ({
    // Auth
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    register: builder.mutation<LoginResponse, LoginRequest & { fullName: string }>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    discoverSso: builder.query<SsoDiscoverResponse, { email?: string; tenantSlug?: string }>({
      query: ({ email, tenantSlug }) => {
        const params = new URLSearchParams();
        if (email) params.set('email', email);
        if (tenantSlug) params.set('tenantSlug', tenantSlug);
        const qs = params.toString();
        return `/auth/sso/discover${qs ? `?${qs}` : ''}`;
      },
    }),
    getSsoAuthorize: builder.query<SsoAuthorizeResponse, {
      tenantSlug: string;
      redirectUri?: string;
      emailHint?: string;
    }>({
      query: ({ tenantSlug, redirectUri, emailHint }) => {
        const params = new URLSearchParams({ tenantSlug });
        if (redirectUri) params.set('redirectUri', redirectUri);
        if (emailHint) params.set('emailHint', emailHint);
        return `/auth/sso/authorize?${params.toString()}`;
      },
    }),
    ssoCallback: builder.mutation<LoginResponse, { code: string; state: string }>({
      query: (body) => ({ url: '/auth/sso/callback', method: 'POST', body }),
    }),
    getTenantSsoConfig: builder.query<TenantSsoConfigResponse, void>({
      query: () => '/tenants/sso',
      providesTags: ['TenantSso'],
    }),
    updateTenantSsoConfig: builder.mutation<TenantSsoConfigResponse, Partial<TenantSsoConfigResponse> & {
      clientSecret?: string;
      emailDomains?: string;
    }>({
      query: (body) => ({ url: '/tenants/sso', method: 'PUT', body }),
      invalidatesTags: ['TenantSso'],
    }),

    // Dashboard
    getKpis: builder.query<DashboardKpiResponse, void>({
      query: () => '/dashboard/kpis',
    }),

    // Users
    getUsers: builder.query<PageResponse<UserResponse>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 20 } = {}) => `/users?page=${page}&size=${size}`,
      providesTags: ['User'],
    }),
    deactivateUser: builder.mutation<void, number>({
      query: (id) => ({ url: `/users/${id}/deactivate`, method: 'PATCH' }),
      invalidatesTags: ['User'],
    }),

    // Farmers
    getFarmers: builder.query<PageResponse<FarmerResponse>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 20 } = {}) => `/farmers?page=${page}&size=${size}`,
      providesTags: ['Farmer'],
    }),
    verifyFarmer: builder.mutation<FarmerResponse, number>({
      query: (id) => ({ url: `/farmers/${id}/verify`, method: 'PATCH' }),
      invalidatesTags: ['Farmer'],
    }),

    // Buyers
    getBuyers: builder.query<PageResponse<BuyerResponse>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 20 } = {}) => `/buyers?page=${page}&size=${size}`,
      providesTags: ['Buyer'],
    }),

    // Orders
    getOrders: builder.query<PageResponse<OrderResponse>, { page?: number; size?: number; status?: string }>({
      query: ({ page = 0, size = 20, status } = {}) =>
        `/orders?page=${page}&size=${size}${status ? `&status=${status}` : ''}`,
      providesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation<OrderResponse, { id: number; status: string }>({
      query: ({ id, status }) => ({ url: `/orders/${id}/status?status=${status}`, method: 'PATCH' }),
      invalidatesTags: ['Order'],
    }),

    // Audit Logs
    getAuditLogs: builder.query<PageResponse<AuditLogResponse>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 20 } = {}) => `/audit-logs?page=${page}&size=${size}`,
      providesTags: ['AuditLog'],
    }),

    // Roles
    getRoles: builder.query<RoleResponse[], void>({
      query: () => '/roles',
      providesTags: ['Role'],
    }),

    // Master data
    getCountries: builder.query<CountryResponse[], void>({
      query: () => '/master-data/countries',
      providesTags: ['Country'],
    }),
    getCurrencies: builder.query<CurrencyResponse[], void>({
      query: () => '/master-data/currencies',
      providesTags: ['Currency'],
    }),
    getProductCategories: builder.query<ProductCategoryResponse[], void>({
      query: () => '/master-data/product-categories',
      providesTags: ['ProductCategory'],
    }),

    // Integrations
    getIntegrations: builder.query<IntegrationConfigResponse[], void>({
      query: () => '/integrations',
      providesTags: ['IntegrationConfig'],
    }),
    updateIntegration: builder.mutation<IntegrationConfigResponse, {
      id: number;
      displayName?: string;
      endpointUrl?: string;
      credentialsJson?: string;
      extraConfig?: string;
      active?: boolean;
    }>({
      query: ({ id, ...body }) => ({ url: `/integrations/${id}`, method: 'PUT', body }),
      invalidatesTags: ['IntegrationConfig'],
    }),
    invokeIntegration: builder.mutation<IntegrationInvokeResponse, { id: number; flowType: string }>({
      query: ({ id, flowType }) => ({
        url: `/integrations/${id}/invoke`,
        method: 'POST',
        body: { flowType },
      }),
      invalidatesTags: ['IntegrationConfig', 'IntegrationSyncRun', 'ExternalInvoice'],
    }),
    getIntegrationRuns: builder.query<PageResponse<IntegrationSyncRunResponse>, { id: number; page?: number; size?: number }>({
      query: ({ id, page = 0, size = 10 }) => `/integrations/${id}/runs?page=${page}&size=${size}`,
      providesTags: ['IntegrationSyncRun'],
    }),
    getIntegrationInvoices: builder.query<PageResponse<ExternalInvoiceResponse>, { id: number; page?: number; size?: number }>({
      query: ({ id, page = 0, size = 10 }) => `/integrations/${id}/invoices?page=${page}&size=${size}`,
      providesTags: ['ExternalInvoice'],
    }),
    getIntegrationSettings: builder.query<IntegrationSettingsResponse, void>({
      query: () => '/integrations/settings',
      providesTags: ['IntegrationSettings'],
    }),
    updateIntegrationSettings: builder.mutation<IntegrationSettingsResponse, Partial<IntegrationSettingsResponse>>({
      query: (body) => ({
        url: '/integrations/settings',
        method: 'PUT',
        body: {
          autoSyncEnabled: body.autoSyncEnabled,
          defaultRetryCount: body.defaultRetryCount,
          oracleEnabled: body.oracleEnabled,
        },
      }),
      invalidatesTags: ['IntegrationSettings'],
    }),
  }),
});

export const {
  useLoginMutation, useRegisterMutation,
  useDiscoverSsoQuery, useLazyGetSsoAuthorizeQuery, useSsoCallbackMutation,
  useGetTenantSsoConfigQuery, useUpdateTenantSsoConfigMutation,
  useGetKpisQuery,
  useGetUsersQuery, useDeactivateUserMutation,
  useGetFarmersQuery, useVerifyFarmerMutation,
  useGetBuyersQuery,
  useGetOrdersQuery, useUpdateOrderStatusMutation,
  useGetAuditLogsQuery,
  useGetRolesQuery,
  useGetCountriesQuery, useGetCurrenciesQuery, useGetProductCategoriesQuery,
  useGetIntegrationsQuery, useUpdateIntegrationMutation, useInvokeIntegrationMutation,
  useGetIntegrationRunsQuery, useGetIntegrationInvoicesQuery,
  useGetIntegrationSettingsQuery, useUpdateIntegrationSettingsMutation,
} = apiSlice;
