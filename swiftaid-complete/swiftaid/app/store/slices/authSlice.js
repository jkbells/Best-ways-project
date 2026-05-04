/**
 * Auth Slice — manages user authentication state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../services/api';

// ─── Async Thunks ──────────────────────────────────────────────────────────

export const sendOTP = createAsyncThunk('auth/sendOTP', async (phone, { rejectWithValue }) => {
  try {
    const data = await authAPI.sendOTP(phone);
    return { phone, devOTP: data.otp }; // devOTP only in development
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const verifyOTP = createAsyncThunk('auth/verifyOTP', async ({ phone, otp }, { rejectWithValue }) => {
  try {
    const data = await authAPI.verifyOTP(phone, otp);
    await AsyncStorage.setItem('authToken', data.token);
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const setupProfile = createAsyncThunk('auth/setupProfile', async (profileData, { rejectWithValue }) => {
  try {
    const data = await authAPI.setupProfile(profileData);
    return data.user;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const loadCurrentUser = createAsyncThunk('auth/loadCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) throw new Error('No token');
    const data = await authAPI.getMe();
    return { user: data.user, token };
  } catch (error) {
    await AsyncStorage.removeItem('authToken');
    return rejectWithValue(error.message);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.removeItem('authToken');
});

// ─── Slice ─────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    phone: null,
    devOTP: null,       // Only for dev testing
    isAuthenticated: false,
    isNewUser: false,
    loading: false,
    error: null,
    initialized: false, // True after initial token check
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearDevOTP: (state) => { state.devOTP = null; },
  },
  extraReducers: (builder) => {
    // sendOTP
    builder
      .addCase(sendOTP.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.phone = action.payload.phone;
        state.devOTP = action.payload.devOTP;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // verifyOTP
    builder
      .addCase(verifyOTP.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isNewUser = action.payload.isNewUser;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // setupProfile
    builder
      .addCase(setupProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isNewUser = false;
      });

    // loadCurrentUser
    builder
      .addCase(loadCurrentUser.pending, (state) => { state.loading = true; })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loadCurrentUser.rejected, (state) => {
        state.loading = false;
        state.initialized = true;
        state.isAuthenticated = false;
      });

    // logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.phone = null;
    });
  },
});

export const { clearError, clearDevOTP } = authSlice.actions;
export default authSlice.reducer;
