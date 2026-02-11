/**
 * MongoDB connection config
 * Pratik Pokhrel, 101487514
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Uses Atlas connection string from .env, or falls back to local MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_app');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
