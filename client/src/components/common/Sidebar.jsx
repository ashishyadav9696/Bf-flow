import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard, User, Clock, ArrowRightLeft,
  Wallet, ShieldAlert, LogOut, ChevronLeft,
  ChevronRight, Moon, Sun,
} from 'lucide-react';
import { logoutUser } from '../../redux/slices/authSlice.js';
import { useDarkMode } from '../../context/DarkModeContext.jsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/account', label: 'Account', icon: User },
  { to: '/transactions', label: 'History', icon: Clock },
  { to: '/transfer', label: 'Transfer', icon: ArrowRightLeft },
  { to: '/deposit-withdraw', label: 'Deposit / Withdraw', icon: Wallet },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);
  const { dark, toggle } = useDarkMode();

  const handleLogout = () => dispatch(logoutUser());

  const bg = dark ? '#0f172a' : '#ffffff';
  const border = dark ? '#1e293b' : '#f1f5f9';
  const textMain = dark ? '#f1f5f9' : '#1e293b';
  const textSub = dark ? '#64748b' : '#94a3b8';
  const activeText = '#6366f1';
  const activeBg = dark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)';
  const hoverBg = dark ? 'rgba(255,255,255,0.05)' : '#f8fafc';

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside style={{
        display: 'flex',
        flexDirection: 'column',
        background: bg,
        borderRight: `1px solid ${border}`,
        transition: 'width 0.3s ease, background 0.3s ease',
        width: collapsed ? '72px' : '260px',
        flexShrink: 0,
        position: 'relative',
        minHeight: '100vh',
      }} className="hidden lg:flex">

        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: collapsed ? '20px 0' : '20px 20px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom: `1px solid ${border}`,
        }}>
          <div style={{
            width: '38px', height: '38px', flexShrink: 0,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
          }}>
            <span style={{ fontSize: '18px' }}>🏦</span>
          </div>
          {!collapsed && (
            <div>
              <p style={{ margin: 0, fontWeight: '800', fontSize: '16px', color: textMain, letterSpacing: '-0.3px' }}>BankFlow</p>
              <p style={{ margin: 0, fontSize: '10px', color: textSub }}>Secure Banking</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to}
              title={collapsed ? label : undefined}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '12px',
                fontSize: '14px', fontWeight: isActive ? '700' : '500',
                color: isActive ? activeText : textSub,
                background: isActive ? activeBg : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              })}
              onMouseOver={e => { if (!e.currentTarget.classList.contains('active-link')) e.currentTarget.style.background = hoverBg; }}
              onMouseOut={e => { if (!e.currentTarget.dataset.active) e.currentTarget.style.background = ''; }}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} style={{ flexShrink: 0, color: isActive ? activeText : textSub }} />
                  {!collapsed && <span>{label}</span>}
                </>
              )}
            </NavLink>
          ))}

          {user?.isAdmin && (
            <NavLink
              to="/admin"
              title={collapsed ? 'Admin Panel' : undefined}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '12px',
                fontSize: '14px', fontWeight: isActive ? '700' : '500',
                color: isActive ? '#f59e0b' : textSub,
                background: isActive ? 'rgba(245,158,11,0.1)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              })}
            >
              {({ isActive }) => (
                <>
                  <ShieldAlert size={18} style={{ flexShrink: 0, color: isActive ? '#f59e0b' : textSub }} />
                  {!collapsed && <span>Admin Panel</span>}
                </>
              )}
            </NavLink>
          )}
        </nav>

        {/* Bottom: dark mode + user + logout */}
        <div style={{ padding: '8px', borderTop: `1px solid ${border}` }}>

          {/* Dark Mode Toggle */}
          <button
            id="dark-mode-toggle"
            onClick={toggle}
            title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: '12px', padding: collapsed ? '10px 0' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: 'transparent',
              color: dark ? '#f59e0b' : '#64748b',
              fontSize: '14px', fontWeight: '500',
              transition: 'background 0.2s, color 0.2s',
              marginBottom: '4px',
            }}
            onMouseOver={e => e.currentTarget.style.background = hoverBg}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {/* User info */}
          {!collapsed && user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', marginBottom: '4px',
            }}>
              <div style={{
                width: '34px', height: '34px', flexShrink: 0,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: '700' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: textMain, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                <p style={{ margin: 0, fontSize: '11px', color: textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            id="sidebar-logout-btn"
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: '12px', padding: collapsed ? '10px 0' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: 'transparent', color: '#ef4444',
              fontSize: '14px', fontWeight: '500',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute', top: '50%', right: '-12px',
            transform: 'translateY(-50%)',
            width: '24px', height: '24px',
            background: bg, border: `1px solid ${border}`,
            borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: textSub, zIndex: 10,
          }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: bg, borderTop: `1px solid ${border}`,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        zIndex: 50, padding: '8px 8px 12px',
      }} className="lg:hidden">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          {navItems.slice(0, 5).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to}
              style={({ isActive }) => ({
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '3px', padding: '6px 10px', borderRadius: '12px',
                color: isActive ? activeText : textSub,
                background: isActive ? activeBg : 'transparent',
                textDecoration: 'none', fontSize: '10px', fontWeight: '600',
                transition: 'all 0.2s',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} style={{ color: isActive ? activeText : textSub }} />
                  <span>{label.split(' ')[0]}</span>
                </>
              )}
            </NavLink>
          ))}
          <button onClick={toggle} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '3px', padding: '6px 10px', borderRadius: '12px',
            border: 'none', cursor: 'pointer',
            background: 'transparent',
            color: dark ? '#f59e0b' : textSub,
            fontSize: '10px', fontWeight: '600',
          }}>
            {dark ? <Sun size={20} /> : <Moon size={20} />}
            <span>{dark ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
