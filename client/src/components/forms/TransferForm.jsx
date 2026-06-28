import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { validateReceiver, fetchAccountDetails } from '../../redux/slices/accountSlice.js';
import { transferFunds } from '../../redux/slices/transactionSlice.js';
import { validateAccountNumber, validateAmount } from '../../utils/validators.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import OTPModal from './OTPModal.jsx';
import { Search, CheckCircle, IndianRupee, ArrowRight } from 'lucide-react';

const STEPS = ['Recipient', 'Amount', 'Verify', 'Done'];

export default function TransferForm({ onSuccess }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.account);
  const { receiver, receiverLoading } = useSelector((state) => state.account);
  const { actionLoading } = useSelector((state) => state.transaction);

  const [step, setStep] = useState(0);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [showOTP, setShowOTP] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Step 0: Validate receiver
  const handleFindReceiver = async () => {
    const err = validateAccountNumber(accountNumber.trim().toUpperCase());
    if (err) { setErrors({ accountNumber: err }); return; }
    if (accountNumber.trim().toUpperCase() === user?.accountNumber) {
      setErrors({ accountNumber: 'Cannot transfer to your own account.' });
      return;
    }
    setErrors({});
    const result = await dispatch(validateReceiver(accountNumber.trim().toUpperCase()));
    if (result.meta.requestStatus === 'fulfilled') {
      setStep(1);
    }
  };

  // Step 1: Validate amount and go to OTP
  const handleProceedToOTP = () => {
    const err = validateAmount(amount, balance);
    if (err) { setErrors({ amount: err }); return; }
    setErrors({});
    setShowOTP(true);
  };

  // Step 2: OTP verified, execute transfer
  const handleOTPVerified = async (otpToken) => {
    setShowOTP(false);
    setStep(2);
    const result = await dispatch(transferFunds({
      receiverAccountNumber: accountNumber.trim().toUpperCase(),
      amount: parseFloat(amount),
      description,
      otpToken,
    }));

    if (result.meta.requestStatus === 'fulfilled') {
      setSuccessData(result.payload);
      setStep(3);
      dispatch(fetchAccountDetails());
      onSuccess?.();
    } else {
      setStep(1);
    }
  };

  const resetForm = () => {
    setStep(0);
    setAccountNumber('');
    setAmount('');
    setDescription('');
    setErrors({});
    setSuccessData(null);
  };

  return (
    <>
      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
              transition-all duration-300
              ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-accent' : 'text-gray-400 dark:text-slate-500'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${i < step ? 'bg-green-500' : 'bg-gray-100 dark:bg-slate-800'}`}></div>
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Enter Recipient */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="transfer-account" className="input-label">Recipient Account Number</label>
            <div className="relative">
              <input
                id="transfer-account"
                type="text"
                value={accountNumber}
                onChange={(e) => { setAccountNumber(e.target.value.toUpperCase()); setErrors({}); }}
                placeholder="BNK000000000"
                className={`input-field pr-10 font-mono ${errors.accountNumber ? 'error' : ''}`}
                maxLength={12}
              />
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {errors.accountNumber && <p className="text-xs text-danger mt-1">{errors.accountNumber}</p>}
          </div>
          <button
            id="find-receiver-btn"
            onClick={handleFindReceiver}
            disabled={receiverLoading || !accountNumber}
            className="btn-primary w-full"
          >
            {receiverLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Looking up...
              </span>
            ) : 'Find Recipient'}
          </button>
        </div>
      )}

      {/* Step 1: Enter Amount */}
      {step === 1 && receiver && (
        <div className="space-y-4">
          {/* Receiver card */}
          <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 rounded-xl p-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{receiver.name}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">{receiver.accountNumber}</p>
            </div>
          </div>

          <div>
            <label htmlFor="transfer-amount" className="input-label">Amount (₹)</label>
            <div className="relative">
              <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="transfer-amount"
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErrors({}); }}
                placeholder="Enter transfer amount"
                className={`input-field pl-9 ${errors.amount ? 'error' : ''}`}
              />
            </div>
            {errors.amount && <p className="text-xs text-danger mt-1">{errors.amount}</p>}
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Available: {formatCurrency(balance || 0)}</p>
          </div>

          <div>
            <label htmlFor="transfer-desc" className="input-label">Description (Optional)</label>
            <input
              id="transfer-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Rent, Loan repayment"
              className="input-field"
              maxLength={100}
            />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="btn-secondary flex-1">Back</button>
            <button id="transfer-proceed-btn" onClick={handleProceedToOTP} className="btn-primary flex-1">
              Continue <ArrowRight size={16} className="inline ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Processing */}
      {step === 2 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-3 border-accent/30 border-t-accent rounded-full animate-spin"></div>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Processing Transfer</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">Please wait while we process your transfer...</p>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && successData && (
        <div className="text-center py-4 animate-slide-up">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-950/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-500 dark:text-green-400" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Transfer Successful!</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
            {formatCurrency(parseFloat(amount))} sent to {receiver?.name}
          </p>
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 text-left space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Transaction ID</span>
              <span className="font-mono text-xs font-medium text-gray-700 dark:text-slate-300">{successData.transaction?._id?.slice(-12)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">New Balance</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(successData.balance)}</span>
            </div>
          </div>
          <button id="transfer-done-btn" onClick={resetForm} className="btn-primary w-full">
            Make Another Transfer
          </button>
        </div>
      )}

      <OTPModal
        isOpen={showOTP}
        onClose={() => setShowOTP(false)}
        purpose="transfer"
        onVerified={handleOTPVerified}
        userEmail={user?.email}
      />
    </>
  );
}
