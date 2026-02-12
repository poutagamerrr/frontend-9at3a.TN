import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

const userFromStorage = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null;
const tokenFromStorage = localStorage.getItem('token') || null;

export const register = createAsyncThunk('auth/register', async (formData, thunkAPI) => {
  try {
    const { data } = await api.post('/auth/register', formData);
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const login = createAsyncThunk('auth/login', async (formData, thunkAPI) => {
  try {
    const { data } = await api.post('/auth/login', formData);
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const adminLogin = createAsyncThunk('auth/adminLogin', async (formData, thunkAPI) => {
  try {
    const { data } = await api.post('/auth/admin-login', formData);
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Admin login failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: userFromStorage,
    token: tokenFromStorage,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const handleFulfilled = (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    };
    const handleRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(register.pending, handlePending)
      .addCase(register.fulfilled, handleFulfilled)
      .addCase(register.rejected, handleRejected)
      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, handleFulfilled)
      .addCase(login.rejected, handleRejected)
      .addCase(adminLogin.pending, handlePending)
      .addCase(adminLogin.fulfilled, handleFulfilled)
      .addCase(adminLogin.rejected, handleRejected);
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;

