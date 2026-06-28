import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, AlertTriangle, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/formatCurrency.js';
import { useDarkMode } from '../../context/DarkModeContext.jsx';

const getTransactionMeta = (tx, userId) => {
  const isCredit = tx.type === 'deposit' || (tx.type === 'transfer' && tx.receiver?._id === userId);
  switch (tx.type) {
    case 'deposit': return { icon: ArrowDownLeft, color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: 'Deposit', isCredit: true };
    case 'withdrawal': return { icon: ArrowUpRight, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Withdrawal', isCredit: false };
    case 'transfer': return { icon: ArrowRightLeft, color: isCredit ? '#22c55e' : '#3b82f6', bg: isCredit ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.1)', label: isCredit ? 'Received' : 'Sent', isCredit };
    default: return { icon: ArrowRightLeft, color: '#64748b', bg: 'rgba(100,116,139,0.1)', label: tx.type, isCredit: false };
  }
};

const StatusBadge = ({ status, dark }) => {
  const config = {
    completed: { bg: dark ? 'rgba(34,197,94,0.15)' : '#dcfce7', color: '#22c55e' },
    pending: { bg: dark ? 'rgba(245,158,11,0.15)' : '#fef3c7', color: '#f59e0b' },
    flagged: { bg: dark ? 'rgba(245,158,11,0.15)' : '#fef3c7', color: '#f59e0b' },
    failed: { bg: dark ? 'rgba(239,68,68,0.15)' : '#fee2e2', color: '#ef4444' },
  };
  const s = config[status] || { bg: 'rgba(100,116,139,0.1)', color: '#64748b' };
  return (
    <span style={{ display:'inline-flex',alignItems:'center',padding:'2px 8px',borderRadius:'20px',fontSize:'11px',fontWeight:'600',background:s.bg,color:s.color }}>
      {status}
    </span>
  );
};

export default function RecentTransactions({ transactions = [], loading }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { dark } = useDarkMode();

  const cardBg = dark ? '#1e293b' : '#ffffff';
  const cardBorder = dark ? '#334155' : '#f1f5f9';
  const textMain = dark ? '#f1f5f9' : '#1e293b';
  const textSub = dark ? '#64748b' : '#94a3b8';
  const hoverBg = dark ? 'rgba(255,255,255,0.04)' : '#f8fafc';

  if (loading) {
    return (
      <div style={{ background: cardBg, borderRadius: '20px', padding: '24px', border: `1px solid ${cardBorder}` }}>
        <h3 style={{ margin: '0 0 20px', fontWeight: '700', fontSize: '16px', color: textMain }}>Recent Transactions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', animation: 'pulse 1.5s ease-in-out infinite' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: dark ? '#334155' : '#f1f5f9', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: '12px', borderRadius: '6px', background: dark ? '#334155' : '#f1f5f9', width: '50%', marginBottom: '8px' }} />
                <div style={{ height: '10px', borderRadius: '6px', background: dark ? '#334155' : '#f1f5f9', width: '30%' }} />
              </div>
              <div style={{ width: '70px', height: '12px', borderRadius: '6px', background: dark ? '#334155' : '#f1f5f9' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: cardBg, borderRadius: '20px', padding: '24px',
      border: `1px solid ${cardBorder}`,
      boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)',
      transition: 'background 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontWeight: '700', fontSize: '16px', color: textMain }}>Recent Transactions</h3>
        <button
          onClick={() => navigate('/transactions')}
          style={{ display:'flex',alignItems:'center',gap:'4px',fontSize:'13px',fontWeight:'600',color:'#6366f1',background:'none',border:'none',cursor:'pointer',padding:'4px 8px',borderRadius:'8px' }}
          onMouseOver={e => e.currentTarget.style.background=hoverBg}
          onMouseOut={e => e.currentTarget.style.background='none'}
        >
          View all <ChevronRight size={14} />
        </button>
      </div>

      {transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: dark ? '#334155' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <ArrowRightLeft size={22} color={textSub} />
          </div>
          <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: textMain }}>No transactions yet</p>
          <p style={{ margin: 0, fontSize: '13px', color: textSub }}>Your transactions will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {transactions.map((tx) => {
            const meta = getTransactionMeta(tx, user?._id);
            const Icon = meta.icon;
            const counterparty = tx.type === 'deposit' ? 'BankFlow System' : tx.type === 'withdrawal' ? 'Withdrawal' : meta.isCredit ? (tx.sender?.name || 'Unknown') : (tx.receiver?.name || 'Unknown');

            return (
              <div
                key={tx._id}
                onClick={() => navigate('/transactions')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px', borderRadius: '14px', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseOver={e => e.currentTarget.style.background = hoverBg}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color={meta.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '600', color: textMain, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{counterparty}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: textSub }}>{formatDateTime(tx.timestamp)}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '700', color: meta.isCredit ? '#22c55e' : '#ef4444' }}>
                    {meta.isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  {tx.isFraudulent && <AlertTriangle size={12} color="#f59e0b" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
