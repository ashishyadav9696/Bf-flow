import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { sendTransactionAlert } from '../utils/sendEmail.js';

/**
 * Verify the OTP token from x-otp-token header
 * Returns decoded payload or throws
 */
const verifyOTPToken = (token, purpose) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.verified || decoded.purpose !== purpose) {
      throw new Error('Invalid OTP token for this operation.');
    }
    return decoded;
  } catch (err) {
    throw new Error('OTP verification required. Please verify your OTP first.');
  }
};

/**
 * POST /api/account/deposit
 * Add funds to user's account
 */
export const deposit = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { amount, description } = req.body;
    const parsedAmount = parseFloat(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number.' });
    }

    const { isFraudulent, reason } = req.fraudResult || {};

    // Increment user balance atomically
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { balance: parsedAmount } },
      { new: true }
    );

    // Create transaction record
    const transaction = await Transaction.create({
      receiver: req.user._id,
      amount: parsedAmount,
      type: 'deposit',
      status: isFraudulent ? 'flagged' : 'completed',
      description: description || 'Deposit',
      isFraudulent: isFraudulent || false,
      fraudReason: reason || null,
    });

    // Send email notification (non-blocking)
    sendTransactionAlert(req.user.email, {
      type: 'deposit',
      amount: parsedAmount,
      balance: user.balance,
      description: description || 'Deposit',
      status: isFraudulent ? 'flagged' : 'completed',
      isFraudulent: isFraudulent || false,
      fraudReason: reason,
    }).catch((err) => console.error('Failed to send deposit email:', err.message));

    res.status(200).json({
      success: true,
      message: `₹${parsedAmount.toLocaleString('en-IN')} deposited successfully.`,
      data: {
        balance: user.balance,
        transaction,
        ...(isFraudulent && { fraudWarning: reason }),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/account/withdraw
 * Subtract funds from user's account (requires OTP)
 */
export const withdraw = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { amount, description } = req.body;
    const parsedAmount = parseFloat(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number.' });
    }

    // Verify OTP token
    const otpToken = req.headers['x-otp-token'];
    if (!otpToken) {
      return res.status(401).json({ success: false, message: 'OTP verification required for withdrawal.' });
    }
    verifyOTPToken(otpToken, 'withdraw');

    // Fetch fresh balance
    const currentUser = await User.findById(req.user._id);
    if (parsedAmount > currentUser.balance) {
      return res.status(400).json({ success: false, message: 'Insufficient balance.' });
    }

    const { isFraudulent, reason } = req.fraudResult || {};

    // Decrement balance atomically
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { balance: -parsedAmount } },
      { new: true }
    );

    const transaction = await Transaction.create({
      sender: req.user._id,
      amount: parsedAmount,
      type: 'withdrawal',
      status: isFraudulent ? 'flagged' : 'completed',
      description: description || 'Withdrawal',
      isFraudulent: isFraudulent || false,
      fraudReason: reason || null,
    });

    sendTransactionAlert(req.user.email, {
      type: 'withdrawal',
      amount: parsedAmount,
      balance: user.balance,
      description: description || 'Withdrawal',
      status: isFraudulent ? 'flagged' : 'completed',
      isFraudulent: isFraudulent || false,
      fraudReason: reason,
    }).catch((err) => console.error('Failed to send withdrawal email:', err.message));

    res.status(200).json({
      success: true,
      message: `₹${parsedAmount.toLocaleString('en-IN')} withdrawn successfully.`,
      data: {
        balance: user.balance,
        transaction,
        ...(isFraudulent && { fraudWarning: reason }),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/account/transfer
 * Transfer funds between accounts (requires OTP verification)
 */
export const transfer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { receiverAccountNumber, amount, description } = req.body;
    const parsedAmount = parseFloat(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number.' });
    }

    // Verify OTP token
    const otpToken = req.headers['x-otp-token'];
    if (!otpToken) {
      return res.status(401).json({ success: false, message: 'OTP verification required for transfer.' });
    }
    verifyOTPToken(otpToken, 'transfer');

    // Find receiver
    const receiver = await User.findOne({ accountNumber: receiverAccountNumber });
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver account not found.' });
    }

    if (receiver._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot transfer to your own account.' });
    }

    // Check sender balance
    const sender = await User.findById(req.user._id);
    if (parsedAmount > sender.balance) {
      return res.status(400).json({ success: false, message: 'Insufficient balance.' });
    }

    const { isFraudulent, reason } = req.fraudResult || {};

    let senderTx, receiverTx;

    try {
      // Atomic balance update using Mongoose transactions (sessions)
      const session = await User.startSession();
      try {
        session.startTransaction();

        await User.findByIdAndUpdate(sender._id, { $inc: { balance: -parsedAmount } }, { session });
        await User.findByIdAndUpdate(receiver._id, { $inc: { balance: parsedAmount } }, { session });

        const txStatus = isFraudulent ? 'flagged' : 'completed';

        // Debit transaction for sender
        [senderTx] = await Transaction.create([{
          sender: sender._id,
          receiver: receiver._id,
          amount: parsedAmount,
          type: 'transfer',
          status: txStatus,
          description: description || `Transfer to ${receiver.name}`,
          isFraudulent: isFraudulent || false,
          fraudReason: reason || null,
        }], { session });

        // Credit transaction for receiver
        [receiverTx] = await Transaction.create([{
          sender: sender._id,
          receiver: receiver._id,
          amount: parsedAmount,
          type: 'transfer',
          status: txStatus,
          description: description || `Transfer from ${sender.name}`,
          isFraudulent: isFraudulent || false,
          fraudReason: reason || null,
        }], { session });

        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    } catch (err) {
      // If standalone Mongo, fall back to non-transactional updates
      if (err.message.includes('replica set') || err.message.includes('mongos')) {
        console.warn('[DEV] Fallback to non-transactional updates (standalone MongoDB)');
        
        await User.findByIdAndUpdate(sender._id, { $inc: { balance: -parsedAmount } });
        await User.findByIdAndUpdate(receiver._id, { $inc: { balance: parsedAmount } });

        const txStatus = isFraudulent ? 'flagged' : 'completed';

        senderTx = await Transaction.create({
          sender: sender._id,
          receiver: receiver._id,
          amount: parsedAmount,
          type: 'transfer',
          status: txStatus,
          description: description || `Transfer to ${receiver.name}`,
          isFraudulent: isFraudulent || false,
          fraudReason: reason || null,
        });

        receiverTx = await Transaction.create({
          sender: sender._id,
          receiver: receiver._id,
          amount: parsedAmount,
          type: 'transfer',
          status: txStatus,
          description: description || `Transfer from ${sender.name}`,
          isFraudulent: isFraudulent || false,
          fraudReason: reason || null,
        });
      } else {
        throw err;
      }
    }

    // Fetch updated sender balance
    const updatedSender = await User.findById(sender._id);

    // Send email notifications (non-blocking)
    sendTransactionAlert(sender.email, {
      type: 'transfer_debit',
      amount: parsedAmount,
      balance: updatedSender.balance,
      counterparty: receiver.name,
      description: description || `Transfer to ${receiver.name}`,
      status: isFraudulent ? 'flagged' : 'completed',
      isFraudulent: isFraudulent || false,
      fraudReason: reason,
    }).catch((err) => console.error('Sender email error:', err.message));

    sendTransactionAlert(receiver.email, {
      type: 'transfer_credit',
      amount: parsedAmount,
      balance: receiver.balance + parsedAmount,
      counterparty: sender.name,
      description: description || `Transfer from ${sender.name}`,
      status: 'completed',
      isFraudulent: false,
    }).catch((err) => console.error('Receiver email error:', err.message));

    res.status(200).json({
      success: true,
      message: `₹${parsedAmount.toLocaleString('en-IN')} transferred to ${receiver.name} successfully.`,
      data: {
        balance: updatedSender.balance,
        transaction: senderTx,
        receiver: { name: receiver.name, accountNumber: receiver.accountNumber },
        ...(isFraudulent && { fraudWarning: reason }),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/account/validate-receiver/:accountNumber
 * Validate receiver account number and return name
 */
export const validateReceiver = async (req, res, next) => {
  try {
    const { accountNumber } = req.params;
    const receiver = await User.findOne({ accountNumber, isVerified: true }).select('name accountNumber');
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }
    res.status(200).json({ success: true, data: { receiver } });
  } catch (error) {
    next(error);
  }
};
