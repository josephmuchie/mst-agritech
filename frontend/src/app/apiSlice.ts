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
export interface LoginRequest { email: string; password: string; }
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: number; email: string; fullName: string; roles: string[]; };
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
  ],
  endpoints: (builder) => ({
    // Auth
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    register: builder.mutation<LoginResponse, LoginRequest & { fullName: string }>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
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
  }),
});

export const {
  useLoginMutation, useRegisterMutation,
  useGetKpisQuery,
  useGetUsersQuery, useDeactivateUserMutation,
  useGetFarmersQuery, useVerifyFarmerMutation,
  useGetBuyersQuery,
  useGetOrdersQuery, useUpdateOrderStatusMutation,
  useGetAuditLogsQuery,
  useGetRolesQuery,
  useGetCountriesQuery, useGetCurrenciesQuery, useGetProductCategoriesQuery,
} = apiSlice;
