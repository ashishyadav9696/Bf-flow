import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchAccountDetails } from '../redux/slices/accountSlice.js';
import DepositWithdrawForm from '../components/forms/DepositWithdrawForm.jsx';
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';

const TABS = [
  { id: 'deposit', label: 'Deposit', icon: ArrowDownLeft, color: 'text-green-600 dark:text-green-400', activeBg: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50' },
  { id: 'withdraw', label: 'Withdraw', icon: ArrowUpRight, color: 'text-red-500 dark:text-red-400', activeBg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50' },
];

export default function DepositWithdraw() {
  const dispatch = useDispatch();
  const location = useLocation();
  const defaultTab = location.state?.tab || 'deposit';
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    dispatch(fetchAccountDetails());
  }, [dispatch]);

  const handleSuccess = () => {
    dispatch(fetchAccountDetails());
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="page-header">
        <h1 className="page-title">Deposit & Withdraw</h1>
        <p className="page-subtitle">Manage your funds instantly</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Tab Switcher */}
          <div className="flex gap-3 mb-6">
            {TABS.map(({ id, label, icon: Icon, color, activeBg }) => (
              <button
                key={id}
                id={`tab-${id}-btn`}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-semibold text-sm
                  transition-all duration-200
                  ${activeTab === id
                    ? `${activeBg} ${color} border-current`
                    : 'border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 hover:border-gray-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              {activeTab === 'deposit'
                ? <ArrowDownLeft className="text-green-500" size={24} />
                : <ArrowUpRight className="text-red-500" size={24} />
              }
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">
                  {activeTab === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {activeTab === 'deposit'
                    ? 'Add money to your BankFlow account'
                    : 'Withdraw money from your account (OTP required)'}
                </p>
              </div>
            </div>
            <DepositWithdrawForm key={activeTab} type={activeTab} onSuccess={handleSuccess} />
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-4">
          <div className={`card border ${activeTab === 'deposit' ? 'border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-950/10' : 'border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10'}`}>
            <div className="flex items-center gap-3 mb-3">
              {activeTab === 'deposit'
                ? <ArrowDownLeft size={20} className="text-green-600" />
                : <ArrowUpRight size={20} className="text-red-500" />
              }
              <h3 className="font-semibold text-gray-800 dark:text-slate-200">
                {activeTab === 'deposit' ? 'About Deposits' : 'About Withdrawals'}
              </h3>
            </div>
            {activeTab === 'deposit' ? (
              <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
                <li className="flex gap-2"><span className="text-green-500">✓</span> Instant credit to account</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span> No minimum deposit limit</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span> Email confirmation sent</li>
                <li className="flex gap-2"><span className="text-yellow-500">⚠</span> Deposits over ₹1L may be flagged</li>
              </ul>
            ) : (
              <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
                <li className="flex gap-2"><span className="text-green-500">✓</span> OTP verification required</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span> Processed instantly</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span> Email confirmation sent</li>
                <li className="flex gap-2"><span className="text-yellow-500">⚠</span> Cannot exceed available balance</li>
              </ul>
            )}
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw size={16} className="text-accent" />
              <h3 className="font-semibold text-gray-800 dark:text-slate-200 text-sm">Processing Time</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>Deposits</span>
                <span className="font-semibold text-green-600 dark:text-green-400">Instant</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>Withdrawals</span>
                <span className="font-semibold text-green-600 dark:text-green-400">Instant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
