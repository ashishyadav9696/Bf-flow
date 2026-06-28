import { checkFraud } from '../utils/fraudRules.js';
import User from '../models/User.js';
import { sendTransactionAlert } from '../utils/sendEmail.js';

/**
 * Fraud detection middleware.
 * Runs fraud rules on the incoming transaction.
 * Attaches fraud result to req.fraudResult for use in controllers.
 * Does NOT block the transaction — marks it as flagged.
 */
export const detectFraud = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { amount, type, receiverId } = req.body;

    // Fetch current balance fresh from DB
    const user = await User.findById(userId).select('balance email name');

    const fraudResult = await checkFraud({
      userId,
      amount: parseFloat(amount),
      type,
      currentBalance: user.balance,
      receiverId: receiverId || null,
    });

    req.fraudResult = fraudResult;

    // If fraudulent, send alert email asynchronously (don't block)
    if (fraudResult.isFraudulent) {
      sendTransactionAlert(user.email, {
        type,
        amount: parseFloat(amount),
        balance: user.balance,
        status: 'flagged',
        isFraudulent: true,
        fraudReason: fraudResult.reason,
      }).catch((err) => console.error('Failed to send fraud alert email:', err.message));
    }

    next();
  } catch (error) {
    // Don't block transaction if fraud check itself fails — log and proceed
    console.error('Fraud detection error:', error.message);
    req.fraudResult = { isFraudulent: false, reason: null };
    next();
  }
};
