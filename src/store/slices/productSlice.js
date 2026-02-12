import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (_, thunkAPI) => {
  try {
    const { data } = await api.get('/products');
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue('Failed to load products');
  }
});

export const fetchProductById = createAsyncThunk('products/fetchById', async (id, thunkAPI) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue('Failed to load product');
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    current: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.current = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;

