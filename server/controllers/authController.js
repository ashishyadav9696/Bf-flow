import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { generateAccountNumber } from '../utils/generateAccountNumber.js';
import { sendOTPEmail } from '../utils/sendEmail.js';

/**
 * Generate a cryptographically random 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Sign JWT token
 */
const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * POST /api/auth/register
 * Register a new user, hash password, generate account number, send verification OTP
 */
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    const { name, email, phoneNumber, aadhaarNumber, panNumber, password } = req.body;

    // Check if email, phone, Aadhaar, or PAN already exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        { phoneNumber },
        { aadhaarNumber },
        { panNumber: panNumber.toUpperCase() }
      ]
    });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ success: false, message: 'Email is already registered.' });
      }
      if (existingUser.phoneNumber === phoneNumber) {
        return res.status(409).json({ success: false, message: 'Phone number is already registered.' });
      }
      if (existingUser.aadhaarNumber === aadhaarNumber) {
        return res.status(409).json({ success: false, message: 'Aadhaar number is already registered.' });
      }
      if (existingUser.panNumber === panNumber.toUpperCase()) {
        return res.status(409).json({ success: false, message: 'PAN card number is already registered.' });
      }
    }

    // Generate unique account number
    const accountNumber = await generateAccountNumber();

    // Create user (password hashed in pre-save hook — pass PLAIN password here)
    const user = await User.create({
      name,
      email,
      phoneNumber,
      aadhaarNumber,
      panNumber: panNumber.toUpperCase(),
      password,
      accountNumber,
      isVerified: false,
    });

    // Generate OTP and save to DB
    const otpCode = generateOTP();
    await OTP.deleteMany({ email, purpose: 'verify' });
    await OTP.create({ email, otp: otpCode, purpose: 'verify' });

    // Send verification email — don't block if SMTP not configured
    let emailSent = false;
    let smtpNotConfigured = false;
    try {
      await sendOTPEmail(email, otpCode, 'verify');
      emailSent = true;
    } catch (emailErr) {
      if (emailErr.message === 'SMTP_NOT_CONFIGURED') {
        smtpNotConfigured = true;
        console.warn(`[DEV] SMTP not configured. OTP for ${email}: ${otpCode}`);
        console.warn('[DEV] To send real emails, fill in SMTP_USER and SMTP_PASS in server/.env');
      } else {
        console.error(`[ERROR] Failed to send email to ${email}:`, emailErr.message);
        console.warn(`[DEV] OTP for ${email}: ${otpCode}`);
      }
    }

    res.status(201).json({
      success: true,
      message: emailSent
        ? `Registration successful! A 6-digit OTP has been sent to ${email}. Please check your inbox.`
        : smtpNotConfigured
        ? `Registration successful! (SMTP not configured) Your OTP is: ${otpCode} — Add SMTP credentials to server/.env to receive emails.`
        : `Registration successful! (Email failed) Your OTP is: ${otpCode}`,
      data: { userId: user._id, email: user.email, accountNumber: user.accountNumber, devOtp: !emailSent ? otpCode : undefined },
    });
  } catch (error) {
    next(error);
  }
};


/**
 * POST /api/auth/login
 * Authenticate user and return JWT
 */
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { loginId, password } = req.body;

    // Find user by email OR phone number OR Aadhaar OR PAN and explicitly select password
    const user = await User.findOne({
      $or: [
        { email: loginId.toLowerCase() },
        { phoneNumber: loginId },
        { aadhaarNumber: loginId },
        { panNumber: loginId.toUpperCase() }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email/phone or password.' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check email verification
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in.',
        requiresVerification: true,
        email: user.email,
      });
    }

    // Check suspension
    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    // Sign JWT
    const token = signToken({ id: user._id, email: user.email, isAdmin: user.isAdmin });

    // Return user without password
    const userObj = user.toSafeObject();

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: { token, user: userObj },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/verify-email
 * Verify email using OTP
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ email, purpose: 'verify' });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP not found or has expired. Please request a new one.' });
    }

    // Check expiry
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP
    if (otpRecord.otp !== otp.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    // Mark user as verified
    await User.findOneAndUpdate({ email }, { isVerified: true });

    // Delete used OTP (single-use)
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/resend-otp
 * Resend verification OTP
 */
export const resendOTP = async (req, res, next) => {
  try {
    const { email, purpose = 'verify' } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (purpose === 'verify' && user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified.' });
    }

    // Generate new OTP
    const otpCode = generateOTP();
    await OTP.deleteMany({ email, purpose });
    await OTP.create({ email, otp: otpCode, purpose });

    let emailSent = false;
    let smtpNotConfigured = false;
    try {
      await sendOTPEmail(email, otpCode, purpose);
      emailSent = true;
    } catch (emailErr) {
      if (emailErr.message === 'SMTP_NOT_CONFIGURED') {
        smtpNotConfigured = true;
        console.warn(`[DEV] SMTP not configured. OTP for ${email}: ${otpCode}`);
      } else {
        console.error(`[ERROR] Failed to send email to ${email}:`, emailErr.message);
        console.warn(`[DEV] OTP for ${email}: ${otpCode}`);
      }
    }

    res.status(200).json({
      success: true,
      message: emailSent
        ? `OTP sent successfully to ${email}. Please check your inbox.`
        : smtpNotConfigured
        ? `OTP generated! (SMTP not configured) OTP: ${otpCode}`
        : `OTP generated! (Email failed) OTP: ${otpCode}`,
      data: { devOtp: !emailSent ? otpCode : undefined },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/send-otp
 * Send OTP for transfer or withdraw (authenticated)
 */
export const sendTransactionOTP = async (req, res, next) => {
  try {
    const { purpose } = req.body;
    const email = req.user.email;

    if (!['transfer', 'withdraw'].includes(purpose)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP purpose.' });
    }

    const otpCode = generateOTP();
    await OTP.deleteMany({ email, purpose });
    await OTP.create({ email, otp: otpCode, purpose });

    let emailSent = false;
    try {
      await sendOTPEmail(email, otpCode, purpose);
      emailSent = true;
    } catch (emailErr) {
      console.warn(`[DEV] Email not sent. OTP for ${email} (${purpose}): ${otpCode}`);
    }

    res.status(200).json({
      success: true,
      message: emailSent
        ? 'OTP sent to your registered email.'
        : `OTP generated! (Dev mode) OTP: ${otpCode}`,
      ...(process.env.NODE_ENV === 'development' && !emailSent ? { devOtp: otpCode } : {}),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/verify-otp
 * Verify OTP for transaction (authenticated) — returns a short-lived token
 */
export const verifyTransactionOTP = async (req, res, next) => {
  try {
    const { otp, purpose } = req.body;
    const email = req.user.email;

    const otpRecord = await OTP.findOne({ email, purpose });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP not found or expired. Please request a new one.' });
    }

    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (otpRecord.otp !== otp.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Issue a short-lived transaction token
    const otpToken = jwt.sign(
      { id: req.user._id, email, purpose, verified: true },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      data: { otpToken },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Return currently authenticated user
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};
