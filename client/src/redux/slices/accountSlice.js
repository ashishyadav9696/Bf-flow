import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

// ─── Async Thunks ────────────────────────────────────────────

export const fetchBalance = createAsyncThunk(
  'account/fetchBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/account/balance');
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch balance');
    }
  }
);

export const fetchAccountDetails = createAsyncThunk(
  'account/fetchDetails',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/account/details');
      return response.data.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch account details');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'account/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.patch('/account/details', data);
      toast.success('Profile updated successfully!');
      return response.data.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const validateReceiver = createAsyncThunk(
  'account/validateReceiver',
  async (accountNumber, { rejectWithValue }) => {
    try {
      const response = await api.get(`/account/validate-receiver/${accountNumber}`);
      return response.data.data.receiver;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Account not found');
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────

const accountSlice = createSlice({
  name: 'account',
  initialState: {
    balance: null,
    accountNumber: null,
    accountDetails: null,
    receiver: null,
    loading: false,
    receiverLoading: false,
    error: null,
  },
  reducers: {
    clearReceiver: (state) => { state.receiver = null; },
    updateBalance: (state, action) => { state.balance = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBalance.pending, (state) => { state.loading = true; })
      .addCase(fetchBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance;
        state.accountNumber = action.payload.accountNumber;
      })
      .addCase(fetchBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchAccountDetails.pending, (state) => { state.loading = true; })
      .addCase(fetchAccountDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.accountDetails = action.payload;
        state.balance = action.payload.balance;
        state.accountNumber = action.payload.accountNumber;
      })
      .addCase(fetchAccountDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateProfile.pending, (state) => { state.loading = true; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.accountDetails = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      });

    builder
      .addCase(validateReceiver.pending, (state) => { state.receiverLoading = true; state.receiver = null; })
      .addCase(validateReceiver.fulfilled, (state, action) => {
        state.receiverLoading = false;
        state.receiver = action.payload;
      })
      .addCase(validateReceiver.rejected, (state, action) => {
        state.receiverLoading = false;
        state.receiver = null;
        toast.error(action.payload);
      });
  },
});

export const { clearReceiver, updateBalance } = accountSlice.actions;
export default accountSlice.reducer;
