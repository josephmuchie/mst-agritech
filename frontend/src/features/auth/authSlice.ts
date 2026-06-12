import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
}

export interface AuthApiResponse {
  accessToken: string;
  refreshToken: string;
  userId?: number;
  email?: string;
  fullName?: string;
  roles?: string[];
  user?: AuthUser | null;
}

const USER_KEY = 'authUser';

const loadStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) as AuthUser : null;
  } catch {
    return null;
  }
};

const persistUser = (user: AuthUser | null) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

export const normalizeAuthResponse = (raw: AuthApiResponse) => ({
  accessToken: raw.accessToken,
  refreshToken: raw.refreshToken,
  user: raw.user ?? {
    id: raw.userId ?? 0,
    email: raw.email ?? '',
    fullName: raw.fullName ?? '',
    roles: raw.roles ?? [],
  },
});

const initialState: AuthState = {
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  user: loadStoredUser(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ accessToken: string; refreshToken: string; user: AuthUser }>) {
      const { accessToken, refreshToken, user } = normalizeAuthResponse(action.payload);
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.user = user;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      persistUser(user);
    },
    clearCredentials(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      persistUser(null);
    },
    switchRole(state) {
      if (!state.user) {
        state.user = {
          id: 2,
          email: 'farmer@mstagritech.co.zw',
          fullName: 'Jane Farmer',
          roles: ['USER'],
        };
      }
      const isAdmin = state.user.roles.includes('ADMIN');
      state.user = {
        ...state.user,
        roles: isAdmin ? ['USER'] : ['ADMIN'],
        fullName: isAdmin ? 'Jane Farmer' : 'Admin User',
        email: isAdmin ? 'farmer@mstagritech.co.zw' : 'admin@mstagritech.co.zw',
      };
      persistUser(state.user);
    },
  },
});

export const { setCredentials, clearCredentials, switchRole } = authSlice.actions;
export default authSlice.reducer;
