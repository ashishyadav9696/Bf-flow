/**
 * Admin seed script — creates an admin user if one doesn't exist.
 * Run: node scripts/seed.js
 *
 * NOTE: We pass the plain-text password here.
 * The User model's pre-save hook (bcrypt salt 12) handles hashing automatically.
 * Never manually hash before calling User.create() — that causes double-hashing.
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { generateAccountNumber } from '../utils/generateAccountNumber.js';

dotenv.config();

const ADMIN_PASSWORD = 'Admin@123456';

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Remove any existing admin to allow re-seeding cleanly
    await User.deleteMany({ isAdmin: true });

    const accountNumber = await generateAccountNumber();

    // Pass PLAIN password — pre-save hook hashes it
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@bankflow.com',
      phoneNumber: '9999999999',
      password: ADMIN_PASSWORD,
      accountNumber,
      balance: 0,
      isAdmin: true,
      isVerified: true,
      isSuspended: false,
    });

    await admin.save(); // triggers pre-save bcrypt hook

    console.log('🎉 Admin user created successfully!');
    console.log('   Email   :', admin.email);
    console.log('   Password:', ADMIN_PASSWORD);
    console.log('   Account :', admin.accountNumber);
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
