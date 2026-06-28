import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Eye, EyeOff, Copy, TrendingUp, ArrowUpRight } from 'lucide-react';
import { formatCurrency, maskAccountNumber } from '../../utils/formatCurrency.js';
import { useDarkMode } from '../../context/DarkModeContext.jsx';
import toast from 'react-hot-toast';

export default function BalanceCard() {
  const { balance, accountNumber } = useSelector((state) => state.account);
  const { user } = useSelector((state) => state.auth);
  const { dark } = useDarkMode();
  const [balanceVisible, setBalanceVisible] = useState(true);

  const copyAccountNumber = () => {
    if (accountNumber) {
      navigator.clipboard.writeText(accountNumber).then(() => toast.success('Account number copied!'));
    }
  };

  return (
    <div style={{
      borderRadius: '20px', overflow: 'hidden', position: 'relative',
      background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #6366f1 100%)',
      padding: '28px', color: '#fff', minHeight: '200px',
      boxShadow: '0 8px 40px rgba(29,78,216,0.35)',
    }}>
      {/* Decorative circles */}
      <div style={{ position:'absolute',top:'-40px',right:'-30px',width:'180px',height:'180px',borderRadius:'50%',background:'rgba(255,255,255,0.05)',pointerEvents:'none' }} />
      <div style={{ position:'absolute',bottom:'-50px',left:'-20px',width:'160px',height:'160px',borderRadius:'50%',background:'rgba(255,255,255,0.04)',pointerEvents:'none' }} />
      <div style={{ position:'absolute',top:'30%',right:'15%',width:'100px',height:'100px',borderRadius:'50%',background:'rgba(255,255,255,0.03)',pointerEvents:'none' }} />

      <div style={{ position:'relative',zIndex:1 }}>
        {/* Header row */}
        <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'20px' }}>
          <div>
            <p style={{ margin:'0 0 2px',fontSize:'12px',color:'rgba(255,255,255,0.65)',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.5px' }}>Total Balance</p>
            <p style={{ margin:0,fontSize:'13px',color:'rgba(255,255,255,0.5)' }}>{user?.name}</p>
          </div>
          <div style={{
            display:'flex',alignItems:'center',gap:'6px',
            background:'rgba(255,255,255,0.12)',
            borderRadius:'10px',padding:'6px 12px',
            fontSize:'12px',color:'rgba(255,255,255,0.85)',fontWeight:'600',
          }}>
            <TrendingUp size={13} />
            <span>Active</span>
          </div>
        </div>

        {/* Balance */}
        <div style={{ display:'flex',alignItems:'center',gap:'12px',marginBottom:'24px' }}>
          <span style={{ fontSize:'38px',fontWeight:'800',letterSpacing:'-1px',flex:1 }}>
            {balanceVisible ? formatCurrency(balance ?? 0) : '₹ ●●●●●●'}
          </span>
          <button
            id="balance-toggle-btn"
            onClick={() => setBalanceVisible(!balanceVisible)}
            style={{
              width:'38px',height:'38px',borderRadius:'12px',
              background:'rgba(255,255,255,0.12)',
              border:'1px solid rgba(255,255,255,0.15)',
              display:'flex',alignItems:'center',justifyContent:'center',
              cursor:'pointer',color:'rgba(255,255,255,0.8)',
              transition:'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.2)'}
            onMouseOut={e => e.currentTarget.style.background='rgba(255,255,255,0.12)'}
            aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
          >
            {balanceVisible ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {/* Account number */}
        <div style={{
          display:'flex',alignItems:'center',justifyContent:'space-between',
          background:'rgba(255,255,255,0.1)',borderRadius:'14px',
          padding:'12px 16px',backdropFilter:'blur(10px)',
          border:'1px solid rgba(255,255,255,0.1)',
        }}>
          <div>
            <p style={{ margin:'0 0 2px',fontSize:'10px',color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:'0.5px' }}>Account No.</p>
            <span style={{ fontSize:'14px',fontWeight:'700',fontFamily:'monospace',letterSpacing:'1px' }}>
              {balanceVisible ? accountNumber || '─── ─── ─────' : maskAccountNumber(accountNumber)}
            </span>
          </div>
          <button
            id="copy-account-btn"
            onClick={copyAccountNumber}
            style={{
              background:'rgba(255,255,255,0.15)',border:'none',
              borderRadius:'8px',padding:'6px 10px',
              display:'flex',alignItems:'center',gap:'5px',
              cursor:'pointer',color:'rgba(255,255,255,0.8)',
              fontSize:'11px',fontWeight:'600',transition:'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.25)'}
            onMouseOut={e => e.currentTarget.style.background='rgba(255,255,255,0.15)'}
          >
            <Copy size={12} />
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
