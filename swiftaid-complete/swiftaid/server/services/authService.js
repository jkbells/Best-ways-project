/**
 * Auth Service
 * Business logic for OTP generation, verification, and JWT issuance
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate a 6-digit OTP (mock — in production, use Twilio/Firebase)
const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

// Sign a JWT token
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * Send OTP to phone (mock implementation)
 * In production: integrate Twilio, Firebase Auth, or Telenor SMS API
 */
const sendOTP = async (phone) => {
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Upsert user — create if first time, update OTP if exists
  const user = await User.findOneAndUpdate(
    { phone },
    { otp, otpExpiry },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // MOCK: log OTP to console (replace with actual SMS in production)
  console.log(`📱 [MOCK SMS] OTP for ${phone}: ${otp}`);

  return { userId: user._id, otp }; // Return OTP in dev for testing
};

/**
 * Verify OTP and return JWT
 */
const verifyOTP = async (phone, otp) => {
  const user = await User.findOne({ phone });

  if (!user) throw new Error('User not found. Please request a new OTP.');
  if (!user.otp || !user.otpExpiry) throw new Error('No OTP found. Please request a new one.');
  if (new Date() > user.otpExpiry) throw new Error('OTP expired. Please request a new one.');
  if (user.otp !== otp) throw new Error('Invalid OTP. Please try again.');

  // Clear OTP after successful verification
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id);
  return { user, token };
};

module.exports = { sendOTP, verifyOTP, signToken };
