const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./src/models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@jeha.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email: admin@jeha.com');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@jeha.com',
      password: 'Admin@123',
      phone: '9999999999',
      role: 'admin',
      isActive: true
    });

    console.log('Admin user created successfully!');
    console.log('----------------------------');
    console.log('Email: admin@jeha.com');
    console.log('Password: Admin@123');
    console.log('----------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
