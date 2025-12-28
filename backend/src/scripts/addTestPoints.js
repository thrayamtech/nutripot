const mongoose = require('mongoose');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const addTestPoints = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/saree-ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: 'jj@gmail.com' });

    if (!user) {
      console.log('User with email jj@gmail.com not found');
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.email})`);

    // Find or create wallet
    let wallet = await Wallet.findOne({ user: user._id });

    if (!wallet) {
      wallet = new Wallet({
        user: user._id,
        balance: 0,
        totalEarned: 0
      });
      console.log('Created new wallet for user');
    }

    console.log(`Current balance: ${wallet.balance} points`);

    // Add 5000 points as manual adjustment
    wallet.addTransaction({
      type: 'manual_adjustment',
      amount: 5000,
      description: 'Test points for wallet redemption testing',
      status: 'completed'
    });

    await wallet.save();

    console.log(`✅ Successfully added 5000 points to ${user.email}`);
    console.log(`New balance: ${wallet.balance} points`);
    console.log(`Total earned: ${wallet.totalEarned} points`);

    process.exit(0);
  } catch (error) {
    console.error('Error adding test points:', error);
    process.exit(1);
  }
};

addTestPoints();
