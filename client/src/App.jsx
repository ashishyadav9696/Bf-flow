import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './redux/slices/authSlice.js';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import Loader from './components/common/Loader.jsx';

// Pages
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AccountDetails from './pages/AccountDetails.jsx';
import TransactionHistory from './pages/TransactionHistory.jsx';
import TransferMoney from './pages/TransferMoney.jsx';
import DepositWithdraw from './pages/DepositWithdraw.jsx';
import AdminPanel from './pages/AdminPanel.jsx';

export default function App() {
  const dispatch = useDispatch();
  const { token, initializing } = useSelector((state) => state.auth);

  // On app load: if token exists, fetch current user to hydrate state
  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token]);

  if (initializing) {
    return <Loader message="Initializing BankFlow..." />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/account" element={<AccountDetails />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/transfer" element={<TransferMoney />} />
          <Route path="/deposit-withdraw" element={<DepositWithdraw />} />
        </Route>

        {/* Admin-only routes */}
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
