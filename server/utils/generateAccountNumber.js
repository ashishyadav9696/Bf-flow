import User from '../models/User.js';

/**
 * Generate a unique 12-character account number in format: BNK + 9 random digits
 * Checks database for uniqueness before returning.
 * @returns {Promise<string>} Unique account number
 */
export const generateAccountNumber = async () => {
  let accountNumber;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Generate 9 random digits
    const randomDigits = Math.floor(100000000 + Math.random() * 900000000).toString();
    accountNumber = `BNK${randomDigits}`;

    // Check uniqueness in DB
    const existingUser = await User.findOne({ accountNumber });
    if (!existingUser) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique account number. Please try again.');
  }

  return accountNumber;
};
