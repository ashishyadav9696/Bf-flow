import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchAccountDetails } from '../redux/slices/accountSlice.js';
import { clearReceiver } from '../redux/slices/accountSlice.js';
import TransferForm from '../components/forms/TransferForm.jsx';
import { ArrowRightLeft, Shield, Zap } from 'lucide-react';

export default function TransferMoney() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAccountDetails());
    dispatch(clearReceiver());
  }, [dispatch]);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="page-header">
        <h1 className="page-title">Transfer Money</h1>
        <p className="page-subtitle">Send money securely to any BankFlow account</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Form */}
        <div className="lg:col-span-2 card">
          <TransferForm />
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <div className="card bg-gradient-primary text-white">
            <div className="flex items-center gap-3 mb-3">
              <Shield size={20} />
              <h3 className="font-semibold">Secure Transfer</h3>
            </div>
            <p className="text-white/70 text-sm">
              All transfers are protected with OTP verification and end-to-end encryption.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <Zap size={18} className="text-accent" />
              <h3 className="font-semibold text-gray-800 dark:text-slate-200">Transfer Tips</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
              <li className="flex gap-2"><span className="text-green-500">✓</span> Double-check recipient account number</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span> Transfers are instant and irreversible</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span> OTP expires in 5 minutes</li>
              <li className="flex gap-2"><span className="text-yellow-500">⚠</span> Large transfers may be flagged for review</li>
            </ul>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-800 dark:text-slate-200 mb-3">Transfer Limits</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>Per Transaction</span>
                <span className="font-semibold">₹1,00,000</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>Processing Time</span>
                <span className="font-semibold text-green-600 dark:text-green-400">Instant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
