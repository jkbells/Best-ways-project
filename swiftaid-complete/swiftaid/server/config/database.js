/**
 * MongoDB connection using Mongoose
 * Implements retry logic and connection event logging
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/swiftaid';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    // Retry after 5 seconds in dev; exit in production
    if (process.env.NODE_ENV === 'production') process.exit(1);
    setTimeout(connectDB, 5000);
  }
};

mongoose.connection.on('disconnected', () =>
  console.warn('⚠️  MongoDB disconnected. Attempting reconnect...')
);

module.exports = connectDB;
