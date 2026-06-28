/**
 * Format a number as Indian Rupees with ₹ symbol and comma notation
 * @param {number} amount
 * @param {Object} options - Intl.NumberFormat options override
 * @returns {string}
 */
export const formatCurrency = (amount, options = {}) => {
  if (amount === null || amount === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(Number(amount));
};

/**
 * Format number as compact currency (e.g., ₹1.2L, ₹2.5Cr)
 * @param {number} amount
 * @returns {string}
 */
export const formatCompactCurrency = (amount) => {
  const num = Number(amount);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return formatCurrency(num);
};

/**
 * Mask an account number — show only last 4 digits
 * @param {string} accountNumber - e.g., "BNK123456789"
 * @returns {string} - e.g., "BNK ●●●● ●●●● 6789"
 */
export const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return '●●●● ●●●● ●●●●';
  const last4 = accountNumber.slice(-4);
  return `●●●● ●●●● ${last4}`;
};

/**
 * Format a date as a human-readable string
 * @param {string|Date} dateStr
 * @returns {string}
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format a date as date + time string
 * @param {string|Date} dateStr
 * @returns {string}
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};
