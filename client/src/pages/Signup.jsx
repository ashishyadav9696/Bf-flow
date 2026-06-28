import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../redux/slices/authSlice.js';
import { validateEmail, validatePassword, validatePasswordMatch, validateName, validatePhoneNumber, validateAadhaarNumber, validatePanNumber } from '../utils/validators.js';
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight, CheckCircle2, Shield, Zap, Globe, Fingerprint, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDarkMode } from '../context/DarkModeContext.jsx';

const features = [
  { icon: Shield, title: 'Bank-grade Security', desc: 'AES-256 encryption & OTP-verified access' },
  { icon: Zap, title: 'Instant Transfers', desc: 'Send money in seconds, anywhere' },
  { icon: Globe, title: 'Always Accessible', desc: '24/7 access from any device' },
];

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, token } = useSelector((state) => state.auth);
  const { dark } = useDarkMode();

  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '', aadhaarNumber: '', panNumber: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [step, setStep] = useState(1); // 1 = personal info, 2 = credentials

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    const nameErr = validateName(form.name);
    const emailErr = validateEmail(form.email);
    const phoneErr = validatePhoneNumber(form.phoneNumber);
    const aadhaarErr = validateAadhaarNumber(form.aadhaarNumber);
    const panErr = validatePanNumber(form.panNumber);
    if (nameErr) newErrors.name = nameErr;
    if (emailErr) newErrors.email = emailErr;
    if (phoneErr) newErrors.phoneNumber = phoneErr;
    if (aadhaarErr) newErrors.aadhaarNumber = aadhaarErr;
    if (panErr) newErrors.panNumber = panErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    const passErr = validatePassword(form.password);
    const confirmErr = validatePasswordMatch(form.password, form.confirmPassword);
    if (passErr) newErrors.password = passErr;
    if (confirmErr) newErrors.confirmPassword = confirmErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    const result = await dispatch(registerUser({
      name: form.name.trim(),
      email: form.email,
      phoneNumber: form.phoneNumber.trim(),
      aadhaarNumber: form.aadhaarNumber.trim(),
      panNumber: form.panNumber.trim().toUpperCase(),
      password: form.password,
    }));
    if (result.meta.requestStatus === 'fulfilled') {
      const message = result.payload?.message || 'Registration successful!';
      const devOtp = result.payload?.data?.devOtp || null;
      toast.success(message, { duration: 6000 });
      navigate('/verify-email', { state: { email: form.email, fromSignup: true, devOtp } });
    }
  };

  const passwordStrength = (pwd) => {
    if (pwd.length < 6) return { level: 0, label: '', color: '' };
    if (pwd.length < 8) return { level: 1, label: 'Weak', color: '#ef4444' };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { level: 2, label: 'Fair', color: '#f59e0b' };
    return { level: 3, label: 'Strong', color: '#22c55e' };
  };

  const strength = passwordStrength(form.password);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: '0 0 42%',
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 58, 95, 0.85) 40%, rgba(29, 78, 216, 0.75) 100%), url("/assets/images/banking_aesthetic_bg.png") center/cover no-repeat',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '60px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-120px', right: '-80px',
          width: '380px', height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.35) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', left: '-60px',
          width: '300px', height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '60px', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '52px', height: '52px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(59,130,246,0.4)',
          }}>
            <span style={{ fontSize: '24px' }}>🏦</span>
          </div>
          <span style={{ fontSize: '26px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>BankFlow</span>
        </div>

        {/* Headline */}
        <div style={{ position: 'relative', zIndex: 1, marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '42px', fontWeight: '800', color: '#fff',
            lineHeight: '1.1', margin: '0 0 18px',
            letterSpacing: '-1px',
          }}>
            Your finances,<br />
            <span style={{
              background: 'linear-gradient(90deg, #60a5fa, #a5b4fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>reimagined.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '16px', lineHeight: '1.7', margin: 0, maxWidth: '320px' }}>
            Join thousands of users managing their money smarter with BankFlow's secure digital banking platform.
          </p>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1, width: '100%' }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '44px', height: '44px', flexShrink: 0,
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                <f.icon size={20} color="#93c5fd" />
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontWeight: '700', color: '#fff', fontSize: '14px' }}>{f.title}</p>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom trust badge */}
        <div style={{
          marginTop: '56px', position: 'relative', zIndex: 1,
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 18px',
          background: 'rgba(255,255,255,0.07)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.12)',
        }}>
          <CheckCircle2 size={18} color="#4ade80" />
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
            <strong style={{ color: '#fff' }}>100% Secure</strong> — OTP verified & end-to-end encrypted
          </p>
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
        <div style={{ width: '100%', maxWidth: '440px' }}>

          {/* Header */}
          <div style={{ marginBottom: '36px' }}>
            <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '600', color: '#6366f1', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Step {step} of 2
            </p>
            <h1 style={{ margin: '0 0 8px', fontSize: '30px', fontWeight: '800', color: dark ? '#f8fafc' : '#0f172a', letterSpacing: '-0.5px' }}>
              {step === 1 ? 'Create your account' : 'Set your password'}
            </h1>
            <p style={{ margin: 0, color: dark ? '#94a3b8' : '#64748b', fontSize: '15px' }}>
              {step === 1 ? 'Enter your personal details to get started.' : 'Choose a strong password to secure your account.'}
            </p>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
            {[1, 2].map((s) => (
              <div key={s} style={{
                height: '4px', borderRadius: '2px', flex: 1,
                background: s <= step ? 'linear-gradient(90deg, #3b82f6, #6366f1)' : dark ? '#334155' : '#e2e8f0',
                transition: 'background 0.4s ease',
              }} />
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <FormField
                id="signup-name" label="Full Name" name="name" type="text"
                value={form.name} onChange={handleChange} placeholder="John Doe"
                icon={<User size={16} color="#94a3b8" />}
                error={errors.name} activeField={activeField} setActiveField={setActiveField}
                autoComplete="name"
              />
              <FormField
                id="signup-email" label="Email Address" name="email" type="email"
                value={form.email} onChange={handleChange} placeholder="you@example.com"
                icon={<Mail size={16} color="#94a3b8" />}
                error={errors.email} activeField={activeField} setActiveField={setActiveField}
                autoComplete="email"
                hint="OTP will be sent to this email address"
              />
              <FormField
                id="signup-phone" label="Phone Number" name="phoneNumber" type="tel"
                value={form.phoneNumber} onChange={handleChange} placeholder="10-digit number"
                icon={<Phone size={16} color="#94a3b8" />}
                error={errors.phoneNumber} activeField={activeField} setActiveField={setActiveField}
                autoComplete="tel" maxLength={10}
              />
              <FormField
                id="signup-aadhaar" label="Aadhaar Number" name="aadhaarNumber" type="text"
                value={form.aadhaarNumber} onChange={handleChange} placeholder="12-digit Aadhaar number"
                icon={<Fingerprint size={16} color="#94a3b8" />}
                error={errors.aadhaarNumber} activeField={activeField} setActiveField={setActiveField}
                maxLength={12}
              />
              <FormField
                id="signup-pan" label="PAN Card Number" name="panNumber" type="text"
                value={form.panNumber} onChange={handleChange} placeholder="10-character PAN number"
                icon={<FileText size={16} color="#94a3b8" />}
                error={errors.panNumber} activeField={activeField} setActiveField={setActiveField}
                maxLength={10}
              />

              <button
                id="signup-next-btn"
                onClick={handleNext}
                style={{
                  marginTop: '8px',
                  width: '100%', padding: '15px',
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  color: '#fff', border: 'none', borderRadius: '12px',
                  fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(99,102,241,0.45)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.35)'; }}
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Email recap */}
              <div style={{
                padding: '14px 16px',
                background: dark ? 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.15))' : 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.08))',
                border: dark ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(99,102,241,0.2)',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <Mail size={16} color="#6366f1" />
                <div>
                  <p style={{ margin: 0, fontSize: '11px', color: dark ? '#94a3b8' : '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>OTP will be sent to</p>
                  <p style={{ margin: 0, fontSize: '14px', color: dark ? '#f8fafc' : '#1e293b', fontWeight: '700' }}>{form.email}</p>
                </div>
              </div>

              <PasswordField
                id="signup-password" label="Password" name="password"
                value={form.password} onChange={handleChange}
                show={showPassword} toggleShow={() => setShowPassword(!showPassword)}
                placeholder="Min. 6 characters"
                error={errors.password} activeField={activeField} setActiveField={setActiveField}
                autoComplete="new-password"
              />

              {/* Password strength */}
              {form.password && (
                <div style={{ marginTop: '-12px' }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                    {[1, 2, 3].map((l) => (
                      <div key={l} style={{
                        height: '4px', borderRadius: '2px', flex: 1,
                        background: l <= strength.level ? strength.color : dark ? '#334155' : '#e2e8f0',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  {strength.label && (
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: strength.color }}>
                      {strength.label} password
                    </p>
                  )}
                </div>
              )}

              <PasswordField
                id="signup-confirm" label="Confirm Password" name="confirmPassword"
                value={form.confirmPassword} onChange={handleChange}
                show={showConfirm} toggleShow={() => setShowConfirm(!showConfirm)}
                placeholder="Repeat your password"
                error={errors.confirmPassword} activeField={activeField} setActiveField={setActiveField}
                autoComplete="new-password"
              />

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    flex: '0 0 auto', padding: '15px 24px',
                    background: dark ? '#1e293b' : '#fff', color: dark ? '#cbd5e1' : '#475569',
                    border: dark ? '2px solid #334155' : '2px solid #e2e8f0', borderRadius: '12px',
                    fontSize: '15px', fontWeight: '600', cursor: 'pointer',
                    transition: 'border-color 0.2s, color 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = dark ? '#334155' : '#e2e8f0'; e.currentTarget.style.color = dark ? '#cbd5e1' : '#475569'; }}
                >
                  Back
                </button>
                <button
                  id="signup-submit-btn"
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1, padding: '15px',
                    background: loading
                      ? 'linear-gradient(135deg, #94a3b8, #94a3b8)'
                      : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    color: '#fff', border: 'none', borderRadius: '12px',
                    fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.35)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseOver={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(99,102,241,0.45)'; }}}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 20px rgba(99,102,241,0.35)'; }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: '16px', height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                      }} />
                      Creating account...
                    </>
                  ) : (
                    <>Create Account & Send OTP <ArrowRight size={18} /></>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Sign in link */}
          <p style={{ textAlign: 'center', marginTop: '28px', color: dark ? '#94a3b8' : '#64748b', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6366f1', fontWeight: '700', textDecoration: 'none' }}
              onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
            >
              Sign in
            </Link>
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

/* ─── Reusable FormField ─── */
function FormField({ id, label, name, type, value, onChange, placeholder, icon, error, activeField, setActiveField, autoComplete, maxLength, hint }) {
  const { dark } = useDarkMode();
  const active = activeField === name;
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', marginBottom: '7px', fontSize: '13px', fontWeight: '600', color: dark ? '#cbd5e1' : '#374151' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}>
          {icon}
        </div>
        <input
          id={id} name={name} type={type} value={value}
          onChange={onChange} placeholder={placeholder}
          autoComplete={autoComplete} maxLength={maxLength}
          onFocus={() => setActiveField(name)}
          onBlur={() => setActiveField(null)}
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
      {hint && !error && (
        <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#6366f1', fontWeight: '500' }}>
          📧 {hint}
        </p>
      )}
      {error && <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#ef4444', fontWeight: '500' }}>{error}</p>}
    </div>
  );
}

/* ─── Reusable PasswordField ─── */
function PasswordField({ id, label, name, value, onChange, show, toggleShow, placeholder, error, activeField, setActiveField, autoComplete }) {
  const { dark } = useDarkMode();
  const active = activeField === name;
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', marginBottom: '7px', fontSize: '13px', fontWeight: '600', color: dark ? '#cbd5e1' : '#374151' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <Lock size={16} color="#94a3b8" />
        </div>
        <input
          id={id} name={name} type={show ? 'text' : 'password'}
          value={value} onChange={onChange} placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setActiveField(name)}
          onBlur={() => setActiveField(null)}
          style={{
            width: '100%', padding: '13px 44px 13px 40px',
            border: `2px solid ${error ? '#ef4444' : active ? '#6366f1' : dark ? '#334155' : '#e2e8f0'}`,
            borderRadius: '12px', fontSize: '15px', color: dark ? '#f8fafc' : '#1e293b',
            background: dark ? '#1e293b' : '#fff', outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: active ? '0 0 0 4px rgba(99,102,241,0.1)' : 'none',
          }}
        />
        <button
          type="button" onClick={toggleShow}
          style={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
            color: '#94a3b8', display: 'flex', alignItems: 'center',
          }}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {error && <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#ef4444', fontWeight: '500' }}>{error}</p>}
    </div>
  );
}
