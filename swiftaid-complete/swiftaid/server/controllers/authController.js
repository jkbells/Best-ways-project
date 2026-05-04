/**
 * Auth Controller
 * Handles login (OTP request), OTP verification, and profile setup
 */

const { sendOTP, verifyOTP } = require('../services/authService');
const User = require('../models/User');

/**
 * POST /api/auth/send-otp
 * Body: { phone }
 */
exports.sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const result = await sendOTP(phone);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      // Only expose OTP in development for testing without SMS service
      ...(process.env.NODE_ENV !== 'production' && { otp: result.otp }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/verify-otp
 * Body: { phone, otp }
 */
exports.verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const { user, token } = await verifyOTP(phone, otp);

    // Determine if new user (needs profile setup)
    const isNewUser = !user.name || user.name === '';

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user,
      isNewUser,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/auth/setup-profile
 * Protected — sets name, blood group, emergency contacts after OTP
 */
exports.setupProfile = async (req, res, next) => {
  try {
    const { name, bloodGroup, allergies, emergencyContacts } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bloodGroup, allergies, emergencyContacts },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me — get current user
 */
exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};
