import { Building2 } from 'lucide-react';

/**
 * Full-screen loading spinner with optional message.
 * Used during auth initialization and data fetching.
 */
export default function Loader({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary to-accent flex flex-col items-center justify-center z-50">
      {/* Logo */}
      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 animate-pulse-slow">
        <Building2 size={32} className="text-white" />
      </div>

      {/* Spinner */}
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
      </div>

      {/* Message */}
      <p className="text-white/80 text-sm font-medium animate-pulse">{message}</p>
      <p className="text-white/50 text-xs mt-1">BankFlow</p>
    </div>
  );
}
