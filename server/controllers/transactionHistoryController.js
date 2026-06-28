import Transaction from '../models/Transaction.js';

/**
 * GET /api/transactions
 * Get paginated list of transactions for the authenticated user
 * Query params: page, limit, type, status, startDate, endDate
 */
export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      page = 1,
      limit = 10,
      type,
      status,
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query filter
    const filter = {
      $or: [{ sender: userId }, { receiver: userId }],
    };

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
        .skip(skip)
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
          limit: limitNum,
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/transactions/:id
 * Get a single transaction by ID
 */
export const getTransactionById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'name accountNumber email')
      .populate('receiver', 'name accountNumber email');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    res.status(200).json({ success: true, data: { transaction } });
  } catch (error) {
    next(error);
  }
};
