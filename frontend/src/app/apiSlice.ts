import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';
import { getApiBaseUrl } from '../config/api';

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
export interface RoleResponse { id: number; name: string; description: string; permissions: string[]; }
export interface LogisticsCompanyResponse {
  id: number; name: string; type: string; trackingUrl: string | null;
  countries: string[]; active: boolean;
}
export interface MarketplaceProductResponse {
  id: number; name: string; category: string; farmer: string; country: string;
  priceUsd: number; unit: string; stock: number; available: boolean;
}
export interface ReportDefinitionResponse {
  id: string; title: string; description: string; category: string; format: string;
}
export interface AppSettingsResponse {
  platformName: string; defaultCurrency: string; supportEmail: string;
  maxOrderValueUsd: string; maintenanceMode: boolean;
}
export interface DataImportJobResponse {
  id: number; importType: string; source: string; fileName: string | null;
  status: string; recordsTotal: number; recordsSuccess: number; recordsFailed: number;
  errorSummary: string | null; createdByEmail: string | null;
  startedAt: string; completedAt: string | null;
}
export interface DataImportTypeInfoResponse {
  type: string; label: string; description: string; columns: string[];
}
export interface DataIngestionAccessResponse { allowed: boolean; }
export interface ApiIngestionRequest {
  importType: string;
  records: Array<Record<string, string>>;
}
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
export interface PaymentListResponse {
  id: number; reference: string; orderRef: string; amount: number;
  currencyCode: string; gateway: string; status: string; createdAt: string;
}
export interface PaymentSummaryResponse {
  totalReceivedUsd: number; pendingCount: number; completedCount: number; failedCount: number;
}
export interface ShipmentListResponse {
  id: number; trackingNo: string; carrier: string; origin: string;
  destination: string; status: string; eta: string | null;
}
export interface AnalyticsSummaryResponse {
  ytdRevenueUsd: number; totalOrdersYtd: number;
  avgOrderValueUsd: number; avgFulfillmentDays: number;
}
export interface TopProductResponse {
  rank: number; name: string; category: string; revenueUsd: number; orders: number;
}
export interface TopMarketResponse {
  country: string; code: string; revenue: number; share: number;
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
    baseUrl: getApiBaseUrl(),
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

    // Payments
    getPayments: builder.query<PageResponse<PaymentListResponse>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 20 } = {}) => `/payments?page=${page}&size=${size}`,
      providesTags: ['Payment'],
    }),
    getPaymentSummary: builder.query<PaymentSummaryResponse, void>({
      query: () => '/payments/summary',
      providesTags: ['Payment'],
    }),

    // Shipments
    getShipments: builder.query<PageResponse<ShipmentListResponse>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 20 } = {}) => `/shipments?page=${page}&size=${size}`,
      providesTags: ['Shipment'],
    }),

    // Analytics
    getAnalyticsSummary: builder.query<AnalyticsSummaryResponse, void>({
      query: () => '/analytics/summary',
      providesTags: ['Report'],
    }),
    getTopProducts: builder.query<TopProductResponse[], void>({
      query: () => '/analytics/top-products',
      providesTags: ['Report'],
    }),
    getTopMarkets: builder.query<TopMarketResponse[], void>({
      query: () => '/analytics/top-markets',
      providesTags: ['Report'],
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

    // Logistics
    getLogisticsCompanies: builder.query<LogisticsCompanyResponse[], void>({
      query: () => '/logistics/companies',
      providesTags: ['LogisticsCompany'],
    }),

    // Marketplace
    getMarketplaceProducts: builder.query<MarketplaceProductResponse[], { search?: string; category?: string }>({
      query: ({ search, category } = {}) => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (category && category !== 'All') params.set('category', category);
        const qs = params.toString();
        return `/marketplace/products${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Product'],
    }),
    getMarketplaceCategories: builder.query<string[], void>({
      query: () => '/marketplace/categories',
    }),

    // Reports
    getReports: builder.query<ReportDefinitionResponse[], void>({
      query: () => '/reports',
      providesTags: ['Report'],
    }),

    // App settings
    getAppSettings: builder.query<AppSettingsResponse, void>({
      query: () => '/settings/general',
      providesTags: ['AppSetting'],
    }),
    updateAppSettings: builder.mutation<AppSettingsResponse, Partial<AppSettingsResponse>>({
      query: (body) => ({
        url: '/settings/general',
        method: 'PUT',
        body: {
          platformName: body.platformName,
          defaultCurrency: body.defaultCurrency,
          supportEmail: body.supportEmail,
          maxOrderValueUsd: body.maxOrderValueUsd,
          maintenanceMode: body.maintenanceMode,
        },
      }),
      invalidatesTags: ['AppSetting'],
    }),

    // Data ingestion
    getIngestionAccess: builder.query<DataIngestionAccessResponse, void>({
      query: () => '/config/ingestion/access',
    }),
    getIngestionTypes: builder.query<DataImportTypeInfoResponse[], void>({
      query: () => '/config/ingestion/types',
    }),
    getIngestionJobs: builder.query<PageResponse<DataImportJobResponse>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 20 } = {}) => `/config/ingestion/jobs?page=${page}&size=${size}`,
    }),
    uploadIngestionExcel: builder.mutation<DataImportJobResponse, { importType: string; file: File }>({
      query: ({ importType, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('importType', importType);
        return {
          url: '/config/ingestion/excel',
          method: 'POST',
          body: formData,
        };
      },
    }),
    uploadIngestionApi: builder.mutation<DataImportJobResponse, ApiIngestionRequest>({
      query: (body) => ({
        url: '/config/ingestion/api',
        method: 'POST',
        body,
      }),
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
  useGetPaymentsQuery, useGetPaymentSummaryQuery,
  useGetShipmentsQuery,
  useGetAnalyticsSummaryQuery, useGetTopProductsQuery, useGetTopMarketsQuery,
  useGetAuditLogsQuery,
  useGetRolesQuery,
  useGetLogisticsCompaniesQuery,
  useGetMarketplaceProductsQuery, useGetMarketplaceCategoriesQuery,
  useGetReportsQuery,
  useGetAppSettingsQuery, useUpdateAppSettingsMutation,
  useGetIngestionAccessQuery, useGetIngestionTypesQuery, useGetIngestionJobsQuery,
  useUploadIngestionExcelMutation, useUploadIngestionApiMutation,
  useGetCountriesQuery, useGetCurrenciesQuery, useGetProductCategoriesQuery,
  useGetIntegrationsQuery, useUpdateIntegrationMutation, useInvokeIntegrationMutation,
  useGetIntegrationRunsQuery, useGetIntegrationInvoicesQuery,
  useGetIntegrationSettingsQuery, useUpdateIntegrationSettingsMutation,
} = apiSlice;
