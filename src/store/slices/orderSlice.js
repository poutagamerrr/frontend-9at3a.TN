import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

export const createOrder = createAsyncThunk('orders/create', async (payload, thunkAPI) => {
  try {
    const { data } = await api.post('/orders', payload);
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue('Failed to create order');
  }
});

export const fetchOrders = createAsyncThunk('orders/fetchAll', async (_, thunkAPI) => {
  try {
    const { data } = await api.get('/orders');
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue('Failed to fetch orders');
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer;

