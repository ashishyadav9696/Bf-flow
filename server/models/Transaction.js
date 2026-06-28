import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be positive'],
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'transfer'],
    required: [true, 'Transaction type is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'flagged', 'failed'],
    default: 'pending',
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  isFraudulent: {
    type: Boolean,
    default: false,
  },
  fraudReason: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying by user and date
transactionSchema.index({ sender: 1, timestamp: -1 });
transactionSchema.index({ receiver: 1, timestamp: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
