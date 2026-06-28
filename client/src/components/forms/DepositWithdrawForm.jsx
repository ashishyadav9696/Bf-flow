import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { depositFunds, withdrawFunds } from '../../redux/slices/transactionSlice.js';
import { fetchAccountDetails } from '../../redux/slices/accountSlice.js';
import { validateAmount } from '../../utils/validators.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import OTPModal from './OTPModal.jsx';
import { IndianRupee, Zap } from 'lucide-react';

const QUICK_AMOUNTS = [500, 1000, 5000, 10000];

/**
 * Shared form component for Deposit and Withdraw operations.
 * Props:
 *   type: 'deposit' | 'withdraw'
 *   onSuccess: () => void
 */
export default function DepositWithdrawForm({ type, onSuccess }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.account);
  const { actionLoading } = useSelector((state) => state.transaction);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [showOTP, setShowOTP] = useState(false);
  const [otpToken, setOtpToken] = useState(null);

  const isDeposit = type === 'deposit';
  const maxAmount = isDeposit ? undefined : balance;

  const validate = () => {
    const newErrors = {};
    const amtErr = validateAmount(amount, maxAmount);
    if (amtErr) newErrors.amount = amtErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!isDeposit) {
      // Require OTP for withdrawal
      setShowOTP(true);
    } else {
      executeTransaction();
    }
  };

  const executeTransaction = async (token = null) => {
    const payload = { amount: parseFloat(amount), description };

    let result;
    if (isDeposit) {
      result = await dispatch(depositFunds(payload));
    } else {
      result = await dispatch(withdrawFunds({ ...payload, otpToken: token }));
    }

    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(fetchAccountDetails());
      setAmount('');
      setDescription('');
      setErrors({});
      setOtpToken(null);
      onSuccess?.();
    }
  };

  const handleOTPVerified = (token) => {
    setOtpToken(token);
    setShowOTP(false);
    executeTransaction(token);
  };

  const previewBalance = () => {
    const amt = parseFloat(amount) || 0;
    if (isDeposit) return (balance || 0) + amt;
    return Math.max(0, (balance || 0) - amt);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Input */}
        <div>
          <label htmlFor={`${type}-amount`} className="input-label">
            Amount (₹)
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <IndianRupee size={16} />
            </div>
            <input
              id={`${type}-amount`}
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setErrors((prev) => ({ ...prev, amount: null })); }}
              placeholder="Enter amount"
              className={`input-field pl-9 ${errors.amount ? 'error' : ''}`}
            />
          </div>
          {errors.amount && <p className="text-xs text-danger mt-1">{errors.amount}</p>}
        </div>

        {/* Quick Amount Buttons */}
        <div>
          <label className="input-label flex items-center gap-1">
            <Zap size={13} className="text-accent" /> Quick Select
          </label>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => { setAmount(String(amt)); setErrors({}); }}
                className={`py-2 px-3 rounded-xl text-sm font-semibold border transition-all duration-200
                  ${parseFloat(amount) === amt
                    ? 'bg-accent text-white border-accent'
                    : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-accent hover:text-accent'
                  }`}
              >
                ₹{(amt / 1000) >= 1 ? `${amt / 1000}K` : amt}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor={`${type}-desc`} className="input-label">
            Description (Optional)
          </label>
          <input
            id={`${type}-desc`}
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isDeposit ? 'e.g., Salary, Freelance' : 'e.g., Groceries, Bills'}
            className="input-field"
            maxLength={100}
          />
        </div>

        {/* Balance Preview */}
        {amount && !errors.amount && (
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">Current Balance</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(balance || 0)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500 dark:text-slate-400">{isDeposit ? 'Adding' : 'Deducting'}</span>
              <span className={`font-semibold ${isDeposit ? 'text-green-600' : 'text-red-500'}`}>
                {isDeposit ? '+' : '-'}{formatCurrency(parseFloat(amount) || 0)}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-slate-800 mt-2 pt-2 flex justify-between">
              <span className="text-gray-700 dark:text-slate-300 font-medium text-sm">New Balance</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(previewBalance())}</span>
            </div>
          </div>
        )}

        <button
          id={`${type}-submit-btn`}
          type="submit"
          disabled={actionLoading}
          className={`w-full ${isDeposit ? 'btn-success' : 'btn-danger'}`}
        >
          {actionLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processing...
            </span>
          ) : (
            `${isDeposit ? 'Deposit' : 'Withdraw'} ${amount ? formatCurrency(parseFloat(amount) || 0) : ''}`
          )}
        </button>
      </form>

      <OTPModal
        isOpen={showOTP}
        onClose={() => setShowOTP(false)}
        purpose="withdraw"
        onVerified={handleOTPVerified}
        userEmail={user?.email}
      />
    </>
  );
}
