require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const SiteSetting = require('../src/models/SiteSetting');

const disableReels = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Connected to database...');

    // Update or create the reels_enabled setting
    const result = await SiteSetting.findOneAndUpdate(
      { key: 'reels_enabled' },
      {
        key: 'reels_enabled',
        value: false,
        description: 'Enable or disable the product reels section on the home page'
      },
      { upsert: true, new: true }
    );

    console.log('✅ Reels section disabled successfully!');
    console.log('Setting:', result);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

disableReels();
