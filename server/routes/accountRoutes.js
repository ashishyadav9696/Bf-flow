import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import { detectFraud } from '../middleware/fraudDetection.js';
import { getBalance, getAccountDetails, updateAccountDetails } from '../controllers/accountController.js';
import { deposit, withdraw, transfer, validateReceiver } from '../controllers/transactionController.js';

const router = express.Router();

// All account routes require authentication
router.use(protect);

// Balance and profile
router.get('/balance', getBalance);
router.get('/details', getAccountDetails);
router.patch('/details', updateAccountDetails);

// Validate receiver before transfer
router.get('/validate-receiver/:accountNumber', validateReceiver);

// Financial operations (with fraud detection middleware)
router.post(
  '/deposit',
  [body('amount').isNumeric().withMessage('Amount must be a number').custom(v => v > 0).withMessage('Amount must be positive')],
  detectFraud,
  deposit
);

router.post(
  '/withdraw',
  [body('amount').isNumeric().withMessage('Amount must be a number').custom(v => v > 0).withMessage('Amount must be positive')],
  detectFraud,
  withdraw
);

router.post(
  '/transfer',
  [
    body('receiverAccountNumber').notEmpty().withMessage('Receiver account number is required'),
    body('amount').isNumeric().withMessage('Amount must be a number').custom(v => v > 0).withMessage('Amount must be positive'),
  ],
  detectFraud,
  transfer
);

export default router;
