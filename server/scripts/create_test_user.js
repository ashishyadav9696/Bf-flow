import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { generateAccountNumber } from '../utils/generateAccountNumber.js';

dotenv.config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const testEmail = 'test@bankflow.com';
    const testAadhaar = '999988887777';
    const testPan = 'TESTP1234F';

    // Remove any conflicts to allow clean seeding
    await User.deleteMany({
      $or: [
        { email: testEmail },
        { aadhaarNumber: testAadhaar },
        { panNumber: testPan }
      ]
    });

    const accountNumber = await generateAccountNumber();

    const testUser = new User({
      name: 'Test User',
      email: testEmail,
      phoneNumber: '9876543210',
      password: 'Test@123456', // model pre-save hook will hash it automatically
      accountNumber,
      balance: 50000,
      aadhaarNumber: testAadhaar,
      panNumber: testPan,
      isVerified: true,
      isSuspended: false,
      isAdmin: false
    });

    await testUser.save();

    console.log('🎉 Test user created successfully!');
    console.log('   Email / Username :', testUser.email);
    console.log('   Password         : Test@123456');
    console.log('   Aadhaar Number   :', testUser.aadhaarNumber);
    console.log('   PAN Number       :', testUser.panNumber);
    console.log('   Account Number   :', testUser.accountNumber);
    console.log('   Opening Balance  : ₹' + testUser.balance);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create test user:', error.message);
    process.exit(1);
  }
};

createTestUser();
