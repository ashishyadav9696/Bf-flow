import User from '../models/User.js';

/**
 * GET /api/account/balance
 * Return user's balance and account number
 */
export const getBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('balance accountNumber name');
    res.status(200).json({
      success: true,
      data: {
        balance: user.balance,
        accountNumber: user.accountNumber,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/account/details
 * Return full user profile (no password)
 */
export const getAccountDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/account/details
 * Update user's profile name
 */
export const updateAccountDetails = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ success: true, message: 'Profile updated successfully.', data: { user } });
  } catch (error) {
    next(error);
  }
};
