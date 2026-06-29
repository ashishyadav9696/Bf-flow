import nodemailer from 'nodemailer';

/**
 * Create Nodemailer transporter using SMTP environment variables
 */
const createTransporter = () => {
  const port = parseInt(process.env.SMTP_PORT) || 587;
  const isSecure = port === 465;
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: isSecure, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Avoid self-signed cert errors in dev
    },
    connectionTimeout: 30000, // 30 seconds — enough for Gmail SSL on port 465
    greetingTimeout: 30000,   // 30 seconds
  });
};

/**
 * Check if SMTP credentials are actually configured (not placeholder values)
 */
const isSmtpConfigured = () => {
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  return (
    user.length > 0 &&
    !user.includes('your_email') &&
    pass.length > 0 &&
    !pass.includes('your_') &&
    !pass.includes('app_password')
  );
};

/**
 * Styled HTML email wrapper template
 */
const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>BankFlow Notification</title>
  <style>
    body { margin: 0; padding: 0; background: #F1F5F9; font-family: 'Segoe UI', Arial, sans-serif; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%); padding: 32px 40px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 40px; }
    .otp-box { background: #F1F5F9; border: 2px dashed #2563EB; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #1E3A5F; font-family: 'Courier New', monospace; }
    .otp-timer { color: #6B7280; font-size: 13px; margin-top: 8px; }
    .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #F1F5F9; }
    .info-label { color: #6B7280; font-size: 14px; }
    .info-value { color: #1E3A5F; font-weight: 600; font-size: 14px; }
    .amount-positive { color: #16A34A; font-size: 22px; font-weight: 800; }
    .amount-negative { color: #DC2626; font-size: 22px; font-weight: 800; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-success { background: #DCFCE7; color: #16A34A; }
    .badge-warning { background: #FEF3C7; color: #D97706; }
    .badge-danger { background: #FEE2E2; color: #DC2626; }
    .footer { background: #F8FAFC; padding: 24px 40px; text-align: center; border-top: 1px solid #E2E8F0; }
    .footer p { color: #9CA3AF; font-size: 12px; margin: 0; }
    .warning-box { background: #FFF7ED; border-left: 4px solid #F59E0B; padding: 16px 20px; border-radius: 8px; margin: 20px 0; }
    .warning-box p { color: #92400E; font-size: 13px; margin: 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #1E3A5F, #2563EB); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏦 BankFlow</h1>
      <p>Secure Banking for Everyone</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} BankFlow. This is an automated email — please do not reply.</p>
      <p style="margin-top:8px;">If you did not perform this action, contact support immediately.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Send OTP email for verification, transfer, or withdrawal
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} purpose - 'verify' | 'transfer' | 'withdraw'
 */
export const sendOTPEmail = async (email, otp, purpose) => {
  if (!isSmtpConfigured()) {
    throw new Error('SMTP_NOT_CONFIGURED');
  }

  const purposeConfig = {
    verify: { title: 'Email Verification OTP', subtitle: 'Verify your account to get started', icon: '✉️' },
    transfer: { title: 'Transfer Authorization OTP', subtitle: 'Confirm your money transfer', icon: '💸' },
    withdraw: { title: 'Withdrawal Authorization OTP', subtitle: 'Confirm your withdrawal', icon: '🏧' },
  };

  const config = purposeConfig[purpose] || purposeConfig.verify;

  const content = `
    <h2 style="color:#1E3A5F; margin:0 0 8px;">${config.icon} ${config.title}</h2>
    <p style="color:#6B7280; margin:0 0 24px;">${config.subtitle}</p>
    <p style="color:#374151;">Please use the following One-Time Password to complete your action:</p>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <p class="otp-timer">⏱️ This OTP expires in <strong>5 minutes</strong></p>
    </div>
    <div class="warning-box">
      <p>🔒 <strong>Security Notice:</strong> Never share this OTP with anyone. BankFlow will never ask for your OTP via phone or chat.</p>
    </div>
    <p style="color:#6B7280; font-size:13px;">If you did not request this OTP, please ignore this email and ensure your account is secure.</p>
  `;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"BankFlow Security" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `${otp} is your BankFlow OTP — ${config.title}`,
    html: emailWrapper(content),
  });
};

/**
 * Send transaction alert email
 * @param {string} email - Recipient email
 * @param {Object} txData - Transaction data { type, amount, balance, description, counterparty, status, isFraudulent, fraudReason }
 */
export const sendTransactionAlert = async (email, txData) => {
  const { type, amount, balance, description, counterparty, status, isFraudulent, fraudReason } = txData;

  const typeConfig = {
    deposit: { label: 'Money Deposited', icon: '💰', amountClass: 'amount-positive', sign: '+' },
    withdrawal: { label: 'Money Withdrawn', icon: '🏧', amountClass: 'amount-negative', sign: '-' },
    transfer_debit: { label: 'Money Transferred', icon: '↗️', amountClass: 'amount-negative', sign: '-' },
    transfer_credit: { label: 'Money Received', icon: '↙️', amountClass: 'amount-positive', sign: '+' },
  };

  const config = typeConfig[type] || typeConfig.deposit;
  const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  const formattedBalance = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(balance);

  const fraudAlert = isFraudulent ? `
    <div style="background:#FEE2E2; border-left:4px solid #DC2626; padding:16px 20px; border-radius:8px; margin:20px 0;">
      <p style="color:#991B1B; font-weight:700; margin:0 0 4px;">⚠️ FRAUD ALERT</p>
      <p style="color:#DC2626; font-size:13px; margin:0;">This transaction has been flagged: ${fraudReason}</p>
    </div>
  ` : '';

  const statusBadge = status === 'flagged'
    ? '<span class="badge badge-warning">⚠️ Flagged</span>'
    : status === 'completed'
    ? '<span class="badge badge-success">✅ Completed</span>'
    : `<span class="badge badge-danger">${status}</span>`;

  const content = `
    <h2 style="color:#1E3A5F; margin:0 0 8px;">${config.icon} ${config.label}</h2>
    <p style="color:#6B7280; margin:0 0 24px;">Transaction notification for your BankFlow account</p>
    ${fraudAlert}
    <div style="background:#F8FAFC; border-radius:12px; padding:24px; margin:20px 0;">
      <div class="${config.amountClass}" style="text-align:center; margin-bottom:16px;">${config.sign}${formattedAmount}</div>
      <div class="info-row"><span class="info-label">Status</span>${statusBadge}</div>
      ${counterparty ? `<div class="info-row"><span class="info-label">Counterparty</span><span class="info-value">${counterparty}</span></div>` : ''}
      ${description ? `<div class="info-row"><span class="info-label">Description</span><span class="info-value">${description}</span></div>` : ''}
      <div class="info-row"><span class="info-label">Available Balance</span><span class="info-value">${formattedBalance}</span></div>
      <div class="info-row" style="border-bottom:none;"><span class="info-label">Date & Time</span><span class="info-value">${new Date().toLocaleString('en-IN')}</span></div>
    </div>
    <p style="color:#6B7280; font-size:13px;">If you did not authorize this transaction, please contact our support team immediately.</p>
  `;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"BankFlow Alerts" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Transaction Alert: ${config.label} — ${formattedAmount}`,
    html: emailWrapper(content),
  });
};
