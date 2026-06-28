import { useState } from 'react';
import { X, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

const alertConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    iconColor: 'text-green-500',
    closeHover: 'hover:bg-green-100',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    iconColor: 'text-red-500',
    closeHover: 'hover:bg-red-100',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    iconColor: 'text-yellow-500',
    closeHover: 'hover:bg-yellow-100',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    iconColor: 'text-blue-500',
    closeHover: 'hover:bg-blue-100',
  },
};

/**
 * Dismissible alert banner component.
 * Props:
 *   type: 'success' | 'error' | 'warning' | 'info'
 *   message: string
 *   dismissible: boolean (default true)
 */
export default function AlertBanner({ type = 'info', message, dismissible = true, className = '' }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !message) return null;

  const config = alertConfig[type] || alertConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${config.bg} ${config.border} ${config.text}
        animate-slide-up mb-4 ${className}`}
      role="alert"
    >
      <Icon size={18} className={`${config.iconColor} flex-shrink-0 mt-0.5`} />
      <p className="text-sm font-medium flex-1">{message}</p>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center ${config.closeHover} transition-colors duration-150`}
          aria-label="Dismiss alert"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
