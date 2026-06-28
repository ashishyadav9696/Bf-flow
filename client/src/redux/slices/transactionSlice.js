import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

// ─── Async Thunks ────────────────────────────────────────────

export const fetchTransactions = createAsyncThunk(
  'transaction/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/transactions', { params });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchTransactionById = createAsyncThunk(
  'transaction/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/transactions/${id}`);
      return response.data.data.transaction;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Transaction not found');
    }
  }
);

export const depositFunds = createAsyncThunk(
  'transaction/deposit',
  async ({ amount, description }, { rejectWithValue }) => {
    try {
      const response = await api.post('/account/deposit', { amount, description, type: 'deposit' });
      toast.success(`₹${Number(amount).toLocaleString('en-IN')} deposited successfully!`);
      if (response.data.data.fraudWarning) {
        toast.error(`⚠️ Fraud Alert: ${response.data.data.fraudWarning}`, { duration: 6000 });
      }
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Deposit failed');
    }
  }
);

export const withdrawFunds = createAsyncThunk(
  'transaction/withdraw',
  async ({ amount, description, otpToken }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        '/account/withdraw',
        { amount, description, type: 'withdrawal' },
        { headers: { 'x-otp-token': otpToken } }
      );
      toast.success(`₹${Number(amount).toLocaleString('en-IN')} withdrawn successfully!`);
      if (response.data.data.fraudWarning) {
        toast.error(`⚠️ Fraud Alert: ${response.data.data.fraudWarning}`, { duration: 6000 });
      }
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Withdrawal failed');
    }
  }
);

export const transferFunds = createAsyncThunk(
  'transaction/transfer',
  async ({ receiverAccountNumber, amount, description, otpToken }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        '/account/transfer',
        { receiverAccountNumber, amount, description, type: 'transfer' },
        { headers: { 'x-otp-token': otpToken } }
      );
      toast.success(response.data.message);
      if (response.data.data.fraudWarning) {
        toast.error(`⚠️ Fraud Alert: ${response.data.data.fraudWarning}`, { duration: 6000 });
      }
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Transfer failed');
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────

const transactionSlice = createSlice({
  name: 'transaction',
  initialState: {
    transactions: [],
    currentTransaction: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      limit: 10,
      hasNextPage: false,
      hasPrevPage: false,
    },
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearTransactionError: (state) => { state.error = null; },
    clearCurrentTransaction: (state) => { state.currentTransaction = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchTransactionById.pending, (state) => { state.loading = true; })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload;
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Deposit
    builder
      .addCase(depositFunds.pending, (state) => { state.actionLoading = true; })
      .addCase(depositFunds.fulfilled, (state) => { state.actionLoading = false; })
      .addCase(depositFunds.rejected, (state, action) => {
        state.actionLoading = false;
        toast.error(action.payload);
      });

    // Withdraw
    builder
      .addCase(withdrawFunds.pending, (state) => { state.actionLoading = true; })
      .addCase(withdrawFunds.fulfilled, (state) => { state.actionLoading = false; })
      .addCase(withdrawFunds.rejected, (state, action) => {
        state.actionLoading = false;
        toast.error(action.payload);
      });

    // Transfer
    builder
      .addCase(transferFunds.pending, (state) => { state.actionLoading = true; })
      .addCase(transferFunds.fulfilled, (state) => { state.actionLoading = false; })
      .addCase(transferFunds.rejected, (state, action) => {
        state.actionLoading = false;
        toast.error(action.payload);
      });
  },
});

export const { clearTransactionError, clearCurrentTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
