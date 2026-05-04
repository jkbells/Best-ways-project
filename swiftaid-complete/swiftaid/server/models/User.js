/**
 * User Model
 * Stores patient/user profile, emergency contacts, and medical info
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const emergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  relationship: { type: String, default: 'Family' },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      match: [/^\+?[\d\s-]{10,15}$/, 'Invalid phone number'],
    },
    email: { type: String, sparse: true, lowercase: true },
    password: { type: String, select: false }, // optional for OTP-only flow

    // Medical profile
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    allergies: [String],
    medicalConditions: [String],

    emergencyContacts: [emergencyContactSchema],

    // App state
    isActive: { type: Boolean, default: true },
    fcmToken: String, // Push notification token

    // OTP flow (mock)
    otp: String,
    otpExpiry: Date,
  },
  { timestamps: true }
);

// Hash password before save (if using password auth)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Don't return password in JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
