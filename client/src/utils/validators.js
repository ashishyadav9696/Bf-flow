/**
 * Validate email format
 * @param {string} email
 * @returns {string|null} Error message or null
 */
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
  return null;
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {string|null}
 */
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

/**
 * Validate that two passwords match
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {string|null}
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};

/**
 * Validate full name
 * @param {string} name
 * @returns {string|null}
 */
export const validateName = (name) => {
  if (!name || !name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (name.trim().length > 50) return 'Name cannot exceed 50 characters';
  return null;
};

/**
 * Validate monetary amount
 * @param {string|number} amount
 * @param {number} maxBalance - Optional max balance check
 * @returns {string|null}
 */
export const validateAmount = (amount, maxBalance = null) => {
  if (!amount && amount !== 0) return 'Amount is required';
  const num = parseFloat(amount);
  if (isNaN(num)) return 'Please enter a valid amount';
  if (num <= 0) return 'Amount must be greater than ₹0';
  if (num < 1) return 'Minimum amount is ₹1';
  if (maxBalance !== null && num > maxBalance) return `Insufficient balance. Maximum: ₹${maxBalance.toLocaleString('en-IN')}`;
  return null;
};

/**
 * Validate account number format
 * @param {string} accountNumber
 * @returns {string|null}
 */
export const validateAccountNumber = (accountNumber) => {
  if (!accountNumber) return 'Account number is required';
  if (!accountNumber.startsWith('BNK')) return 'Invalid account number format';
  if (accountNumber.length !== 12) return 'Account number must be 12 characters (BNK + 9 digits)';
  return null;
};

/**
 * Validate OTP format
 * @param {string} otp
 * @returns {string|null}
 */
export const validateOTP = (otp) => {
  if (!otp) return 'OTP is required';
  if (otp.length !== 6) return 'OTP must be 6 digits';
  if (!/^\d{6}$/.test(otp)) return 'OTP must contain only digits';
  return null;
};

/**
 * Validate phone number format (10-digit)
 * @param {string} phoneNumber
 * @returns {string|null} Error message or null
 */
export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return 'Phone number is required';
  if (!/^[0-9]{10}$/.test(phoneNumber)) return 'Please enter a valid 10-digit phone number';
  return null;
};

/**
 * Validate Aadhaar number format (12-digit)
 * @param {string} aadhaarNumber
 * @returns {string|null} Error message or null
 */
export const validateAadhaarNumber = (aadhaarNumber) => {
  if (!aadhaarNumber) return 'Aadhaar number is required';
  if (!/^[0-9]{12}$/.test(aadhaarNumber)) return 'Please enter a valid 12-digit Aadhaar number';
  return null;
};

/**
 * Validate PAN card number format (10-character alphanumeric)
 * @param {string} panNumber
 * @returns {string|null} Error message or null
 */
export const validatePanNumber = (panNumber) => {
  if (!panNumber) return 'PAN card number is required';
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(panNumber)) return 'Please enter a valid 10-character PAN card number (e.g. ABCDE1234F)';
  return null;
};
