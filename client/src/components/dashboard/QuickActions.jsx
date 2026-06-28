import { useNavigate } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Clock } from 'lucide-react';
import { useDarkMode } from '../../context/DarkModeContext.jsx';

const actions = [
  { id: 'quick-deposit-btn', label: 'Deposit', icon: ArrowDownLeft, path: '/deposit-withdraw', state: { tab: 'deposit' }, gradient: 'linear-gradient(135deg, #16a34a, #22c55e)', shadow: 'rgba(34,197,94,0.3)' },
  { id: 'quick-withdraw-btn', label: 'Withdraw', icon: ArrowUpRight, path: '/deposit-withdraw', state: { tab: 'withdraw' }, gradient: 'linear-gradient(135deg, #dc2626, #ef4444)', shadow: 'rgba(239,68,68,0.3)' },
  { id: 'quick-transfer-btn', label: 'Transfer', icon: ArrowRightLeft, path: '/transfer', gradient: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', shadow: 'rgba(59,130,246,0.3)' },
  { id: 'quick-history-btn', label: 'History', icon: Clock, path: '/transactions', gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)', shadow: 'rgba(168,85,247,0.3)' },
];

export default function QuickActions() {
  const navigate = useNavigate();
  const { dark } = useDarkMode();

  const cardBg = dark ? '#1e293b' : '#ffffff';
  const cardBorder = dark ? '#334155' : '#f1f5f9';
  const textMain = dark ? '#f1f5f9' : '#1e293b';
  const textSub = dark ? '#64748b' : '#94a3b8';

  return (
    <div style={{
      background: cardBg, borderRadius: '20px', padding: '24px',
      border: `1px solid ${cardBorder}`,
      boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)',
      transition: 'background 0.3s ease',
    }}>
      <h3 style={{ margin: '0 0 20px', fontWeight: '700', fontSize: '16px', color: textMain }}>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {actions.map(({ id, label, icon: Icon, path, state, gradient, shadow }) => (
          <button
            key={id} id={id}
            onClick={() => navigate(path, { state })}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
              padding: '16px 8px', borderRadius: '16px',
              background: gradient,
              border: 'none', cursor: 'pointer', color: '#fff',
              boxShadow: `0 6px 20px ${shadow}`,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 10px 28px ${shadow}`; }}
            onMouseOut={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 6px 20px ${shadow}`; }}
          >
            <div style={{ width:'44px',height:'44px',borderRadius:'14px',background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Icon size={22} />
            </div>
            <span style={{ fontSize:'12px',fontWeight:'700',letterSpacing:'0.2px' }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
