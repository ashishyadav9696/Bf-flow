import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Shield, RefreshCw } from 'lucide-react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

const OTP_LENGTH = 6;
const TIMER_SECONDS = 5 * 60; // 5 minutes

/**
 * OTP Modal Component.
 * Handles OTP input, countdown timer, resend, and verification.
 *
 * Props:
 *   isOpen: boolean
 *   onClose: () => void
 *   purpose: 'transfer' | 'withdraw'
 *   onVerified: (otpToken: string) => void
 *   userEmail: string
 */
export default function OTPModal({ isOpen, onClose, purpose, onVerified, userEmail }) {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const inputRefs = useRef([]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeLeft(TIMER_SECONDS);
      setOtpSent(false);
      setDevOtp(null);
      sendOTP();
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, otpSent]);

  // Auto-focus first input when opened
  useEffect(() => {
    if (isOpen && otpSent) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen, otpSent]);

  const sendOTP = async () => {
    try {
      setSendingOtp(true);
      const response = await api.post('/auth/send-otp', { purpose });
      setOtpSent(true);
      setTimeLeft(TIMER_SECONDS);
      
      const newDevOtp = response.data?.devOtp;
      if (newDevOtp) {
        setDevOtp(newDevOtp);
        toast.success(`OTP: ${newDevOtp}`);
      } else {
        toast.success(`OTP sent to ${userEmail}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleInput = (index, value) => {
    // Allow only digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // take only last character
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every(Boolean) && newOtp.length === OTP_LENGTH) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      const digits = pasted.split('');
      setOtp(digits);
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (otpString) => {
    const code = otpString || otp.join('');
    if (code.length !== OTP_LENGTH) {
      toast.error('Please enter all 6 digits');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/verify-otp', { otp: code, purpose });
      const { otpToken } = response.data.data;
      toast.success('OTP verified!');
      onVerified(otpToken);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800/80 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Verify OTP</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {purpose === 'transfer' ? 'Transfer Authorization' : 'Withdrawal Authorization'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-6 text-center">
          We sent a 6-digit OTP to<br />
          <span className="font-semibold text-gray-900 dark:text-white">{userEmail}</span>
        </p>

        {devOtp && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded-xl text-sm text-yellow-800 dark:text-yellow-400 text-center animate-fade-in">
            <strong>[Dev Mode]</strong> OTP is: <span className="font-mono font-bold text-accent">{devOtp}</span>
          </div>
        )}

        {/* OTP Input Boxes */}
        <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              id={`otp-input-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-11 h-13 text-center text-xl font-bold border-2 rounded-xl
                transition-all duration-200 outline-none
               ${digit
                  ? 'border-accent bg-accent/5 text-accent'
                  : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100'
                }
                focus:border-accent focus:bg-accent/5`}
              style={{ height: '52px' }}
              disabled={loading || sendingOtp}
              aria-label={`OTP digit ${index + 1}`}
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

        {/* Submit Button */}
        <button
          id="otp-verify-btn"
          onClick={() => handleVerify()}
          disabled={otp.join('').length !== OTP_LENGTH || loading || timeLeft === 0}
          className="btn-primary w-full mb-3"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Verifying...
            </span>
          ) : (
            'Verify OTP'
          )}
        </button>

        {/* Resend OTP */}
        <button
          id="otp-resend-btn"
          onClick={sendOTP}
          disabled={sendingOtp || (timeLeft > 0 && otpSent)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium
            text-gray-600 dark:text-slate-400 hover:text-accent dark:hover:text-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RefreshCw size={14} className={sendingOtp ? 'animate-spin' : ''} />
          {sendingOtp ? 'Sending OTP...' : timeLeft === 0 ? 'Resend OTP' : 'Resend OTP (after timer expires)'}
        </button>
      </div>
    </div>
  );
}
