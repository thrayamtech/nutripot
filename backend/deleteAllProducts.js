require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const deleteAllProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await Product.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} products`);

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

deleteAllProducts();
