import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    id: number;
    email: string;
    fullName: string;
    roles: string[];
  } | null;
}

const initialState: AuthState = {
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ accessToken: string; refreshToken: string; user: AuthState['user'] }>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    clearCredentials(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    switchRole(state) {
      if (!state.user) return;
      const isAdmin = state.user.roles.includes('ADMIN');
      state.user = {
        ...state.user,
        roles: isAdmin ? ['USER'] : ['ADMIN'],
        fullName: isAdmin ? 'Jane Farmer' : 'Admin User',
        email: isAdmin ? 'farmer@mstagritech.co.zw' : 'admin@mstagritech.co.zw',
      };
    },
  },
});

export const { setCredentials, clearCredentials, switchRole } = authSlice.actions;
export default authSlice.reducer;
