const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/emp-portal');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    // Run initial data hygiene and organization code sync
    const initDatabase = require('./dbInit');
    await initDatabase();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
