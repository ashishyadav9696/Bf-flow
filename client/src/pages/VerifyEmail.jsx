import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Building2, Mail, RefreshCw, CheckCircle } from 'lucide-react';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import { useDarkMode } from '../context/DarkModeContext.jsx';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const { dark } = useDarkMode();

  const [otp, setOtp] = useState(Array(6).fill(''));
  const [devOtp, setDevOtp] = useState(location.state?.devOtp || null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/signup');
      return;
    }
    inputRefs.current[0]?.focus();

    // Auto-request OTP on mount if we don't have it and didn't come from signup flow (e.g. login redirect)
    if (!location.state?.fromSignup) {
      handleResend();
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleInput = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Please enter all 6 digits'); return; }
    setLoading(true);
    try {
      await api.post('/auth/verify-email', { email, otp: code });
      setVerified(true);
      toast.success('Email verified! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const response = await api.post('/auth/resend-otp', { email, purpose: 'verify' });
      setOtp(Array(6).fill(''));
      setTimeLeft(300);
      
      const newDevOtp = response.data?.data?.devOtp;
      if (newDevOtp) {
        setDevOtp(newDevOtp);
        toast.success(`OTP: ${newDevOtp}`);
      } else {
        toast.success('New OTP sent to your email!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">BankFlow</h1>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800/80 rounded-2xl shadow-2xl p-8">
          {verified ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Email Verified!</h2>
              <p className="text-gray-500 dark:text-slate-400 text-sm">Redirecting you to login...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Mail size={24} className="text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Your Email</h2>
                <p className="text-gray-500 dark:text-slate-400 text-sm mt-2 mb-4">
                  We sent a 6-digit code to<br />
                  <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
                </p>
                {devOtp && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded-xl text-sm text-yellow-800 dark:text-yellow-400">
                    <strong>[Dev Mode]</strong> OTP is: <span className="font-mono font-bold text-accent">{devOtp}</span>
                  </div>
                )}
              </div>

              {/* OTP Inputs */}
              <div className="flex gap-2 justify-center mb-4" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    id={`verify-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInput(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-11 h-13 text-center text-xl font-bold border-2 rounded-xl
                      transition-all duration-200 outline-none
                      ${digit ? 'border-accent bg-accent/5 text-accent' : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100'}
                      focus:border-accent focus:bg-accent/5`}
                    style={{ height: '52px' }}
                    disabled={loading}
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="text-center mb-6">
                {timeLeft > 0 ? (
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Expires in{' '}
                    <span className={`font-bold ${timeLeft <= 60 ? 'text-red-500' : 'text-accent'}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-red-500 font-medium">OTP has expired</p>
                )}
              </div>

              <button
                id="verify-email-btn"
                onClick={handleVerify}
                disabled={loading || otp.join('').length !== 6}
                className="btn-primary w-full mb-3"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Verifying...
                  </span>
                ) : 'Verify Email'}
              </button>

              <button
                id="resend-otp-btn"
                onClick={handleResend}
                disabled={resending || timeLeft > 0}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium
                  text-gray-600 dark:text-slate-400 hover:text-accent dark:hover:text-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-4">
                <Link to="/login" className="text-accent font-semibold hover:underline">
                  Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
