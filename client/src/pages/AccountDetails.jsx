import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAccountDetails, updateProfile } from '../redux/slices/accountSlice.js';
import { updateUser } from '../redux/slices/authSlice.js';
import { formatCurrency, formatDate, maskAccountNumber } from '../utils/formatCurrency.js';
import { validateName } from '../utils/validators.js';
import { User, Mail, CreditCard, Calendar, Edit3, Check, X, Eye, EyeOff, Copy, Fingerprint, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AccountDetails() {
  const dispatch = useDispatch();
  const { accountDetails, loading } = useSelector((state) => state.account);
  const { user } = useSelector((state) => state.auth);

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [accountVisible, setAccountVisible] = useState(false);

  const displayUser = accountDetails || user;

  useEffect(() => {
    dispatch(fetchAccountDetails());
  }, [dispatch]);

  const handleEditName = () => {
    setNewName(displayUser?.name || '');
    setEditingName(true);
    setNameError('');
  };

  const handleSaveName = async () => {
    const err = validateName(newName);
    if (err) { setNameError(err); return; }
    const result = await dispatch(updateProfile({ name: newName.trim() }));
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(updateUser({ name: newName.trim() }));
      setEditingName(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied!`));
  };

  if (loading && !displayUser) {
    return (
      <div className="space-y-4">
        <div className="card animate-pulse h-48"></div>
        <div className="card animate-pulse h-32"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0 max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">Account Details</h1>
        <p className="page-subtitle">Manage your profile and account information</p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {displayUser?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Account Holder</p>
            {editingName ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  id="edit-name-input"
                  type="text"
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setNameError(''); }}
                  className="input-field text-lg font-semibold py-1 h-auto"
                  autoFocus
                />
                <button id="save-name-btn" onClick={handleSaveName} className="w-8 h-8 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center hover:bg-green-100 dark:hover:bg-green-900/30">
                  <Check size={16} />
                </button>
                <button onClick={() => setEditingName(false)} className="w-8 h-8 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 rounded-lg flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{displayUser?.name}</h2>
                <button id="edit-name-btn" onClick={handleEditName} className="text-gray-400 hover:text-accent transition-colors">
                  <Edit3 size={15} />
                </button>
              </div>
            )}
            {nameError && <p className="text-xs text-danger mt-1">{nameError}</p>}
            {displayUser?.isAdmin && <span className="badge badge-warning mt-1">Admin</span>}
          </div>
        </div>

        {/* Info Grid */}
        <div className="space-y-3">
          <InfoRow icon={Mail} label="Email Address" value={displayUser?.email} />
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <div className="w-9 h-9 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-slate-400 shadow-sm">
              <CreditCard size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">Account Number</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 font-mono">
                {accountVisible
                  ? displayUser?.accountNumber
                  : maskAccountNumber(displayUser?.accountNumber)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setAccountVisible(!accountVisible)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors">
                {accountVisible ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <button
                id="copy-account-details-btn"
                onClick={() => copyToClipboard(displayUser?.accountNumber, 'Account number')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
              >
                <Copy size={15} />
              </button>
            </div>
          </div>
          {displayUser?.aadhaarNumber && (
            <InfoRow icon={Fingerprint} label="Aadhaar Number" value={displayUser.aadhaarNumber} />
          )}
          {displayUser?.panNumber && (
            <InfoRow icon={FileText} label="PAN Card Number" value={displayUser.panNumber} />
          )}
          <InfoRow icon={Calendar} label="Member Since" value={formatDate(displayUser?.createdAt)} />
        </div>
      </div>

      {/* Balance Card */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 dark:text-slate-200 mb-4">Account Balance</h3>
        <div className="flex items-center justify-between bg-gradient-primary rounded-xl p-4">
          <div>
            <p className="text-white/70 text-xs mb-1">Available Balance</p>
            <p className="text-white text-2xl font-bold">
              {balanceVisible ? formatCurrency(displayUser?.balance ?? 0) : '₹ ●●●●●'}
            </p>
          </div>
          <button
            id="account-balance-toggle-btn"
            onClick={() => setBalanceVisible(!balanceVisible)}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            {balanceVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Account Status */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 dark:text-slate-200 mb-4">Account Status</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3">
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">Verification</p>
            <span className={`badge ${displayUser?.isVerified ? 'badge-success' : 'badge-warning'}`}>
              {displayUser?.isVerified ? '✅ Verified' : '⏳ Pending'}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3">
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">Account Status</p>
            <span className={`badge ${displayUser?.isSuspended ? 'badge-danger' : 'badge-success'}`}>
              {displayUser?.isSuspended ? '🚫 Suspended' : '✅ Active'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
      <div className="w-9 h-9 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-slate-400 shadow-sm">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{value || '─'}</p>
      </div>
    </div>
  );
}
