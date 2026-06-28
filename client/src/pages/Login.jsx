import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/slices/authSlice.js';
import { validatePassword } from '../utils/validators.js';
import { Eye, EyeOff, Lock, Mail, ArrowRight, TrendingUp, Shield, CreditCard } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext.jsx';

const stats = [
  { icon: TrendingUp, value: '₹2.4B+', label: 'Transactions Processed' },
  { icon: Shield, value: '100%', label: 'Secured & Encrypted' },
  { icon: CreditCard, value: '50K+', label: 'Active Accounts' },
];

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, token } = useSelector((state) => state.auth);
  const { dark } = useDarkMode();

  const [form, setForm] = useState({ loginId: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [activeField, setActiveField] = useState(null);

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    const trimmedId = form.loginId.trim();
    if (!trimmedId) {
      newErrors.loginId = 'Email, phone, Aadhaar, or PAN is required';
    } else if (trimmedId.includes('@')) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedId)) {
        newErrors.loginId = 'Please enter a valid email address';
      }
    } else if (/^[0-9]+$/.test(trimmedId)) {
      if (trimmedId.length === 10) {
        // Phone
      } else if (trimmedId.length === 12) {
        // Aadhaar
      } else {
        newErrors.loginId = 'Please enter a valid 10-digit phone or 12-digit Aadhaar number';
      }
    } else {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(trimmedId)) {
        newErrors.loginId = 'Please enter a valid email, phone, Aadhaar, or PAN number';
      }
    }
    const passErr = validatePassword(form.password);
    if (passErr) newErrors.password = passErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await dispatch(loginUser({ loginId: form.loginId.trim(), password: form.password }));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/dashboard');
    } else if (result.payload?.requiresVerification) {
      navigate('/verify-email', { state: { email: result.payload.email } });
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: '0 0 45%',
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 58, 95, 0.85) 45%, rgba(29, 78, 216, 0.75) 100%), url("/assets/images/banking_aesthetic_bg.png") center/cover no-repeat',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '60px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position:'absolute',top:'-100px',right:'-80px',width:'380px',height:'380px',borderRadius:'50%',background:'radial-gradient(circle,rgba(37,99,235,0.3) 0%,transparent 70%)',pointerEvents:'none' }} />
        <div style={{ position:'absolute',bottom:'-80px',left:'-60px',width:'280px',height:'280px',borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,0.25) 0%,transparent 70%)',pointerEvents:'none' }} />
        <div style={{ position:'absolute',top:'40%',left:'30%',width:'400px',height:'400px',borderRadius:'50%',background:'radial-gradient(circle,rgba(255,255,255,0.02) 0%,transparent 60%)',pointerEvents:'none' }} />

        {/* Logo */}
        <div style={{ display:'flex',alignItems:'center',gap:'14px',marginBottom:'64px',position:'relative',zIndex:1 }}>
          <div style={{ width:'52px',height:'52px',background:'linear-gradient(135deg, #3b82f6, #6366f1)',borderRadius:'14px',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 32px rgba(59,130,246,0.4)' }}>
            <span style={{ fontSize:'24px' }}>🏦</span>
          </div>
          <span style={{ fontSize:'26px',fontWeight:'800',color:'#fff',letterSpacing:'-0.5px' }}>BankFlow</span>
        </div>

        {/* Headline */}
        <div style={{ position:'relative',zIndex:1,marginBottom:'52px' }}>
          <h2 style={{ fontSize:'40px',fontWeight:'800',color:'#fff',lineHeight:'1.15',margin:'0 0 18px',letterSpacing:'-1px' }}>
            Welcome back<br />
            <span style={{ background:'linear-gradient(90deg, #60a5fa, #a5b4fc)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>
              to your bank.
            </span>
          </h2>
          <p style={{ color:'rgba(255,255,255,0.6)',fontSize:'16px',lineHeight:'1.7',margin:0,maxWidth:'320px' }}>
            Sign in to manage your finances, track transactions, and transfer money securely.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display:'flex',flexDirection:'column',gap:'16px',position:'relative',zIndex:1,width:'100%' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ display:'flex',alignItems:'center',gap:'16px',padding:'16px 20px',background:'rgba(255,255,255,0.07)',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width:'40px',height:'40px',flexShrink:0,background:'rgba(255,255,255,0.1)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <s.icon size={18} color="#93c5fd" />
              </div>
              <div>
                <p style={{ margin:'0 0 2px',fontWeight:'800',color:'#fff',fontSize:'16px' }}>{s.value}</p>
                <p style={{ margin:0,color:'rgba(255,255,255,0.5)',fontSize:'12px' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        flex: 1,
        background: dark ? '#0f172a' : '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 40px',
        overflowY: 'auto',
        transition: 'background 0.3s ease',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Header */}
          <div style={{ marginBottom: '36px' }}>
            <h1 style={{ margin: '0 0 8px', fontSize: '30px', fontWeight: '800', color: dark ? '#f8fafc' : '#0f172a', letterSpacing: '-0.5px' }}>Sign in</h1>
            <p style={{ margin: 0, color: dark ? '#94a3b8' : '#64748b', fontSize: '15px' }}>Use your email, phone, Aadhaar, or PAN card to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Login ID */}
            <LoginField
              id="login-id" label="Email, Phone, Aadhaar, or PAN" name="loginId"
              type="text" value={form.loginId} onChange={handleChange}
              placeholder="Email, phone, Aadhaar, or PAN number"
              icon={<Mail size={16} color="#94a3b8" />}
              error={errors.loginId} activeField={activeField} setActiveField={setActiveField}
              autoComplete="username"
            />

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                <label htmlFor="login-password" style={{ fontSize: '13px', fontWeight: '600', color: dark ? '#cbd5e1' : '#374151' }}>Password</label>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <Lock size={16} color="#94a3b8" />
                </div>
                <input
                  id="login-password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••" autoComplete="current-password"
                  onFocus={() => setActiveField('password')}
                  onBlur={() => setActiveField(null)}
                  style={{
                    width: '100%', padding: '13px 44px 13px 40px',
                    border: `2px solid ${errors.password ? '#ef4444' : activeField === 'password' ? '#6366f1' : dark ? '#334155' : '#e2e8f0'}`,
                    borderRadius: '12px', fontSize: '15px', color: dark ? '#f8fafc' : '#1e293b',
                    background: dark ? '#1e293b' : '#fff', outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxShadow: activeField === 'password' ? '0 0 0 4px rgba(99,102,241,0.1)' : 'none',
                  }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#ef4444', fontWeight: '500' }}>{errors.password}</p>}
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              style={{
                marginTop:'4px',
                width:'100%',padding:'15px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color:'#fff',border:'none',borderRadius:'12px',
                fontSize:'15px',fontWeight:'700',cursor: loading ? 'not-allowed' : 'pointer',
                display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.35)',
                transition:'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseOver={e => { if(!loading){ e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(99,102,241,0.45)'; }}}
              onMouseOut={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=loading?'none':'0 4px 20px rgba(99,102,241,0.35)'; }}
            >
              {loading ? (
                <>
                  <div style={{ width:'16px',height:'16px',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite' }} />
                  Signing in...
                </>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '28px', color: dark ? '#94a3b8' : '#64748b', fontSize: '14px' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#6366f1', fontWeight: '700', textDecoration: 'none' }}
              onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}>
              Create one
            </Link>
          </p>

          <p style={{ textAlign: 'center', marginTop: '40px', color: dark ? '#475569' : '#cbd5e1', fontSize: '12px' }}>
            © {new Date().getFullYear()} BankFlow · Secure Banking
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

function LoginField({ id, label, name, type, value, onChange, placeholder, icon, error, activeField, setActiveField, autoComplete }) {
  const { dark } = useDarkMode();
  const active = activeField === name;
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', marginBottom: '7px', fontSize: '13px', fontWeight: '600', color: dark ? '#cbd5e1' : '#374151' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}>{icon}</div>
        <input
          id={id} name={name} type={type} value={value}
          onChange={onChange} placeholder={placeholder} autoComplete={autoComplete}
          onFocus={() => setActiveField(name)} onBlur={() => setActiveField(null)}
          style={{
            width: '100%', padding: '13px 14px 13px 40px',
            border: `2px solid ${error ? '#ef4444' : active ? '#6366f1' : dark ? '#334155' : '#e2e8f0'}`,
            borderRadius: '12px', fontSize: '15px', color: dark ? '#f8fafc' : '#1e293b',
            background: dark ? '#1e293b' : '#fff', outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: active ? '0 0 0 4px rgba(99,102,241,0.1)' : 'none',
          }}
        />
      </div>
      {error && <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#ef4444', fontWeight: '500' }}>{error}</p>}
    </div>
  );
}
