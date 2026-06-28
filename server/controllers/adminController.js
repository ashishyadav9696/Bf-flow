import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

/**
 * GET /api/admin/users
 * Get all users with their balances (admin only)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { accountNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/transactions
 * Get all transactions (admin only) with filters
 */
export const getAllTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, status, startDate, endDate } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const filter = {};
    if (type && type !== 'all') filter.type = type;
    if (status && status !== 'all') filter.status = status;

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.timestamp.$lte = end;
      }
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('sender', 'name accountNumber email')
        .populate('receiver', 'name accountNumber email')
        .sort({ timestamp: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Transaction.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:id/suspend
 * Suspend or unsuspend a user
 */
export const toggleSuspendUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Cannot suspend an admin user.' });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isSuspended ? 'suspended' : 'unsuspended'} successfully.`,
      data: { user: user.toSafeObject() },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/fraud-alerts
 * Get all flagged (potentially fraudulent) transactions
 */
export const getFraudAlerts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find({ isFraudulent: true })
        .populate('sender', 'name accountNumber email')
        .populate('receiver', 'name accountNumber email')
        .sort({ timestamp: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Transaction.countDocuments({ isFraudulent: true }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/stats
 * Get aggregate stats for admin analytics dashboard
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalTransactions,
      fraudAlerts,
      volumeResult,
      recentTransactions,
      userGrowth,
    ] = await Promise.all([
      User.countDocuments({ isAdmin: false }),
      Transaction.countDocuments(),
      Transaction.countDocuments({ isFraudulent: true }),
      Transaction.aggregate([
        { $group: { _id: null, totalVolume: { $sum: '$amount' } } },
      ]),
      // Last 30 days daily transaction volume
      Transaction.aggregate([
        {
          $match: {
            timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            count: { $sum: 1 },
            volume: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // User registrations last 30 days
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalTransactions,
          fraudAlerts,
          totalVolume: volumeResult[0]?.totalVolume || 0,
        },
        charts: {
          recentTransactions,
          userGrowth,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
