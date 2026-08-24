import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitializing: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isInitializing = false;
    },
    authFailed: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      } else {
        state.user = {
          id: '',
          name: '',
          email: '',
          ...action.payload,
        };
      }
    },
  },
});

export const { authSuccess, authFailed, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;