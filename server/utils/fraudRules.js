import Transaction from '../models/Transaction.js';

/**
 * Rule-based fraud detection engine.
 * Evaluates a transaction against multiple fraud rules.
 *
 * Rules:
 *  1. Amount > ₹1,00,000 in a single transaction
 *  2. More than 5 transactions by same user in last 10 minutes
 *  3. Withdrawal > 50% of current balance
 *  4. Transfer to same account as 3+ previous transfers within 1 hour
 *
 * @param {Object} params
 * @param {string} params.userId - ID of the user initiating the transaction
 * @param {number} params.amount - Transaction amount
 * @param {string} params.type - 'deposit' | 'withdrawal' | 'transfer'
 * @param {number} params.currentBalance - User's current balance before transaction
 * @param {string} [params.receiverId] - Receiver's user ID (for transfers)
 * @returns {Promise<{ isFraudulent: boolean, reason: string | null }>}
 */
export const checkFraud = async ({ userId, amount, type, currentBalance, receiverId }) => {
  // Rule 1: Large single transaction
  if (amount > 100000) {
    return {
      isFraudulent: true,
      reason: `Large transaction detected: ₹${amount.toLocaleString('en-IN')} exceeds the ₹1,00,000 single-transaction limit.`,
    };
  }

  // Rule 2: Frequency check — more than 5 transactions in last 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentCount = await Transaction.countDocuments({
    $or: [{ sender: userId }, { receiver: userId }],
    timestamp: { $gte: tenMinutesAgo },
  });

  if (recentCount >= 5) {
    return {
      isFraudulent: true,
      reason: `High-frequency activity detected: ${recentCount} transactions within 10 minutes.`,
    };
  }

  // Rule 3: Withdrawal > 50% of current balance
  if (type === 'withdrawal' && currentBalance > 0) {
    const withdrawalPercentage = (amount / currentBalance) * 100;
    if (withdrawalPercentage > 50) {
      return {
        isFraudulent: true,
        reason: `Suspicious withdrawal: ₹${amount.toLocaleString('en-IN')} is ${withdrawalPercentage.toFixed(1)}% of your current balance.`,
      };
    }
  }

  // Rule 4: Transfer to same account 3+ times within 1 hour
  if (type === 'transfer' && receiverId) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const repeatTransferCount = await Transaction.countDocuments({
      sender: userId,
      receiver: receiverId,
      type: 'transfer',
      timestamp: { $gte: oneHourAgo },
    });

    if (repeatTransferCount >= 3) {
      return {
        isFraudulent: true,
        reason: `Repeated transfers detected: ${repeatTransferCount + 1} transfers to the same account within 1 hour.`,
      };
    }
  }

  return { isFraudulent: false, reason: null };
};
