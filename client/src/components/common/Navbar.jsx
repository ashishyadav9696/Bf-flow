import { useSelector, useDispatch } from 'react-redux';
import { Bell, LogOut, Moon, Sun } from 'lucide-react';
import { logoutUser } from '../../redux/slices/authSlice.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { useDarkMode } from '../../context/DarkModeContext.jsx';

export default function Navbar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.account);
  const { dark, toggle } = useDarkMode();

  const bg = dark ? '#0f172a' : '#ffffff';
  const border = dark ? '#1e293b' : '#f1f5f9';
  const textMain = dark ? '#f1f5f9' : '#1e293b';
  const textSub = dark ? '#64748b' : '#94a3b8';
  const badgeBg = dark ? '#1e293b' : '#f8fafc';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header style={{
      background: bg, borderBottom: `1px solid ${border}`,
      padding: '12px 24px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20,
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      <div>
        <p style={{ margin: 0, fontSize: '12px', color: textSub }}>{getGreeting()},</p>
        <h2 style={{ margin: 0, fontWeight: '700', color: textMain, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user?.name || 'User'}
          {user?.isAdmin && (
            <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '600', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '20px' }}>
              Admin
            </span>
          )}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Balance pill */}
        {balance !== null && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: dark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.06)',
            border: `1px solid ${dark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)'}`,
            borderRadius: '12px', padding: '6px 14px',
          }}>
            <span style={{ fontSize: '12px', color: textSub }}>Balance</span>
            <span style={{ fontWeight: '800', color: '#6366f1', fontSize: '14px' }}>{formatCurrency(balance)}</span>
          </div>
        )}

        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: dark ? 'rgba(245,158,11,0.1)' : badgeBg,
            border: `1px solid ${border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: dark ? '#f59e0b' : textSub,
            transition: 'all 0.2s',
          }}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button
          id="navbar-notifications-btn"
          style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: badgeBg, border: `1px solid ${border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: textSub, transition: 'all 0.2s',
          }}
        >
          <Bell size={16} />
        </button>

        {/* Logout (desktop only) */}
        <button
          id="navbar-logout-btn"
          onClick={() => dispatch(logoutUser())}
          title="Logout"
          style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#ef4444', transition: 'all 0.2s',
          }}
          className="hidden lg:flex"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
