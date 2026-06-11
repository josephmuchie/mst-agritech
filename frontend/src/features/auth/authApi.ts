import { apiSlice } from '../../app/apiSlice';
import { setCredentials, clearCredentials } from './authSlice';

interface LoginRequest { email: string; password: string; }
interface LoginResponse { accessToken: string; refreshToken: string; user: { id: number; email: string; fullName: string; roles: string[] } }

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(clearCredentials());
      },
    }),
    refreshToken: builder.mutation<{ accessToken: string }, { refreshToken: string }>({
      query: (body) => ({ url: '/auth/refresh', method: 'POST', body }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useRefreshTokenMutation } = authApi;
