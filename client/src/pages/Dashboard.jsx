import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAccountDetails } from '../redux/slices/accountSlice.js';
import { fetchTransactions } from '../redux/slices/transactionSlice.js';
import BalanceCard from '../components/dashboard/BalanceCard.jsx';
import QuickActions from '../components/dashboard/QuickActions.jsx';
import RecentTransactions from '../components/dashboard/RecentTransactions.jsx';
import AnalyticsChart from '../components/dashboard/AnalyticsChart.jsx';
import AlertBanner from '../components/common/AlertBanner.jsx';
import { useDarkMode } from '../context/DarkModeContext.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, TrendingUp } from 'lucide-react';

const buildChartData = (transactions, userId) => {
  if (!transactions || transactions.length === 0) return [];
  
  // Get the 10 most recent transactions and reverse them to show oldest first (chronological)
  const sorted = [...transactions].slice(0, 10).reverse();

  return sorted.map((tx) => {
    const txDate = new Date(tx.timestamp);
    const dateStr = txDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    }) + ', ' + txDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();

    const isCredit = tx.type === 'deposit' || (tx.type === 'transfer' && tx.receiver?._id === userId);
    return {
      date: dateStr,
      income: isCredit ? tx.amount : 0,
      expense: isCredit ? 0 : tx.amount,
    };
  });
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { transactions, loading: txLoading } = useSelector((state) => state.transaction);
  const { loading: accountLoading } = useSelector((state) => state.account);
  const { dark } = useDarkMode();

  const hasFraudAlerts = transactions.some((tx) => tx.isFraudulent);
  const chartData = useMemo(() => buildChartData(transactions, user?._id), [transactions, user?._id]);
  const recentFive = useMemo(() => transactions.slice(0, 5), [transactions]);

  // Stats from transactions
  const stats = useMemo(() => {
    const totalIn = transactions.filter(tx => tx.type === 'deposit' || (tx.type === 'transfer' && tx.receiver?._id === user?._id)).reduce((s, tx) => s + tx.amount, 0);
    const totalOut = transactions.filter(tx => tx.type === 'withdrawal' || (tx.type === 'transfer' && tx.sender?._id === user?._id)).reduce((s, tx) => s + tx.amount, 0);
    const transfers = transactions.filter(tx => tx.type === 'transfer').length;
    return { totalIn, totalOut, transfers, count: transactions.length };
  }, [transactions, user?._id]);

  useEffect(() => {
    dispatch(fetchAccountDetails());
    dispatch(fetchTransactions({ limit: 30 }));
  }, [dispatch]);

  const textMain = dark ? '#f1f5f9' : '#1e293b';
  const textSub = dark ? '#64748b' : '#94a3b8';

  const statCards = [
    { label: 'Total Income', value: formatCurrency(stats.totalIn), icon: ArrowDownLeft, color: '#22c55e', bg: dark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.08)' },
    { label: 'Total Spent', value: formatCurrency(stats.totalOut), icon: ArrowUpRight, color: '#ef4444', bg: dark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)' },
    { label: 'Transfers', value: `${stats.transfers}`, icon: ArrowRightLeft, color: '#3b82f6', bg: dark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)' },
    { label: 'Transactions', value: `${stats.count}`, icon: TrendingUp, color: '#a855f7', bg: dark ? 'rgba(168,85,247,0.12)' : 'rgba(168,85,247,0.08)' },
  ];

  const cardBg = dark ? '#1e293b' : '#ffffff';
  const cardBorder = dark ? '#334155' : '#f1f5f9';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '80px' }}>

      {/* Welcome Banner */}
      <div style={{
        background: dark
          ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(59,130,246,0.1))'
          : 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(59,130,246,0.04))',
        border: `1px solid ${dark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)'}`,
        borderRadius: '20px',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '800', color: textMain }}>
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: textSub }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{
          padding: '10px 18px',
          background: dark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)',
          borderRadius: '12px',
          fontSize: '13px', fontWeight: '700', color: '#6366f1',
        }}>
          🏦 {user?.isAdmin ? 'Admin Account' : 'Savings Account'}
        </div>
      </div>

      {/* Fraud Alert */}
      {hasFraudAlerts && (
        <AlertBanner type="warning" message="⚠️ One or more of your recent transactions have been flagged for suspicious activity. Please review your transaction history." />
      )}

      {/* Balance + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <BalanceCard />
        <QuickActions />
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
        {statCards.map((card, i) => (
          <div key={i} style={{
            background: cardBg, borderRadius: '16px', padding: '20px',
            border: `1px solid ${cardBorder}`,
            boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.04)',
            display: 'flex', flexDirection: 'column', gap: '12px',
            transition: 'background 0.3s ease, transform 0.2s',
          }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <card.icon size={20} color={card.color} />
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '800', color: textMain }}>{card.value}</p>
              <p style={{ margin: 0, fontSize: '12px', color: textSub, fontWeight: '500' }}>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Chart */}
      <AnalyticsChart data={chartData} loading={txLoading} />

      {/* Recent Transactions */}
      <RecentTransactions transactions={recentFive} loading={txLoading} />
    </div>
  );
}
