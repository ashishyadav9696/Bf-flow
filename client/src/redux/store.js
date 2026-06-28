import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import accountReducer from './slices/accountSlice.js';
import transactionReducer from './slices/transactionSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    account: accountReducer,
    transaction: transactionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Allow non-serializable Date values in state
        ignoredPaths: ['auth.user.createdAt'],
      },
    }),
});
