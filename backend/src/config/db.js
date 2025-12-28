const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);

    if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.error('Network error: Please check your internet connection');
    } else if (error.message.includes('authentication')) {
      console.error('Authentication error: Please check your database credentials');
    } else if (error.message.includes('MongoServerError')) {
      console.error('Database error: Please check MongoDB Atlas configuration');
    }

    console.error('\nTroubleshooting steps:');
    console.error('1. Check if your IP is whitelisted in MongoDB Atlas (Network Access)');
    console.error('2. Verify database username and password');
    console.error('3. Ensure internet connection is stable');

    process.exit(1);
  }
};

module.exports = connectDB;
