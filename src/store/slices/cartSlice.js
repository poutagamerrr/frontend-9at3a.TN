import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, thunkAPI) => {
  try {
    const { data } = await api.get('/cart');
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue('Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity }, thunkAPI) => {
  try {
    const { data } = await api.post('/cart', { productId, quantity });
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue('Failed to add to cart');
  }
});

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async ({ productId, quantity }, thunkAPI) => {
    try {
      const { data } = await api.put(`/cart/${productId}`, { quantity });
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue('Failed to update cart');
    }
  }
);

export const removeCartItem = createAsyncThunk('cart/remove', async (productId, thunkAPI) => {
  try {
    const { data } = await api.delete(`/cart/${productId}`);
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue('Failed to remove cart item');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      });
  },
});

export default cartSlice.reducer;

