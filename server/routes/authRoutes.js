import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  verifyEmail,
  resendOTP,
  sendTransactionOTP,
  verifyTransactionOTP,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('phoneNumber').matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit phone number'),
  body('aadhaarNumber').matches(/^[0-9]{12}$/).withMessage('Please enter a valid 12-digit Aadhaar number'),
  body('panNumber').matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i).withMessage('Please enter a valid 10-character PAN card number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('loginId').notEmpty().withMessage('Email or phone number is required').trim(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);

// Protected routes (require auth)
router.get('/me', protect, getMe);
router.post('/send-otp', protect, sendTransactionOTP);
router.post('/verify-otp', protect, verifyTransactionOTP);

export default router;
