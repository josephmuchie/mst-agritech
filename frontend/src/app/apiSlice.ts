import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
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
  endpoints: () => ({}),
});
