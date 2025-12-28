require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Product = require('../src/models/Product');

connectDB();

// Working image URLs with variety - using different high-quality sources
const sareeImageSets = [
  // Set 1 - Royal Blue/Purple Sarees
  [
    'https://images.pexels.com/photos/3755021/pexels-photo-3755021.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8170562/pexels-photo-8170562.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8442857/pexels-photo-8442857.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8381916/pexels-photo-8381916.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8381869/pexels-photo-8381869.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  // Set 2 - Red/Pink Sarees
  [
    'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3738386/pexels-photo-3738386.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8381920/pexels-photo-8381920.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8381875/pexels-photo-8381875.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8381868/pexels-photo-8381868.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  // Set 3 - Green Sarees
  [
    'https://images.pexels.com/photos/8381917/pexels-photo-8381917.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8381870/pexels-photo-8381870.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8442862/pexels-photo-8442862.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8381863/pexels-photo-8381863.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3755022/pexels-photo-3755022.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  // Set 4 - Yellow/Gold Sarees
  [
    'https://images.pexels.com/photos/8381919/pexels-photo-8381919.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8381867/pexels-photo-8381867.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8170559/pexels-photo-8170559.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8381866/pexels-photo-8381866.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3738382/pexels-photo-3738382.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  // Set 5 - Orange/Coral Sarees
  [
    'https://images.pexels.com/photos/8381918/pexels-photo-8381918.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8381864/pexels-photo-8381864.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8442859/pexels-photo-8442859.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8381921/pexels-photo-8381921.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3738384/pexels-photo-3738384.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  // Set 6 - Multi-color/Printed Sarees
  [
    'https://images.pexels.com/photos/8381865/pexels-photo-8381865.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8170558/pexels-photo-8170558.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8442856/pexels-photo-8442856.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8381871/pexels-photo-8381871.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3738387/pexels-photo-3738387.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  // Set 7 - Maroon/Burgundy Sarees
  [
    'https://images.pexels.com/photos/8381872/pexels-photo-8381872.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8170560/pexels-photo-8170560.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8442858/pexels-photo-8442858.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3738383/pexels-photo-3738383.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8381873/pexels-photo-8381873.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  // Set 8 - Navy/Blue Sarees
  [
    'https://images.pexels.com/photos/8170561/pexels-photo-8170561.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8381874/pexels-photo-8381874.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8442860/pexels-photo-8442860.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3738385/pexels-photo-3738385.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8381876/pexels-photo-8381876.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  // Set 9 - Cream/Beige Sarees
  [
    'https://images.pexels.com/photos/8381877/pexels-photo-8381877.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8442861/pexels-photo-8442861.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8381878/pexels-photo-8381878.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3755023/pexels-photo-3755023.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8381879/pexels-photo-8381879.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  // Set 10 - Black/Dark Sarees
  [
    'https://images.pexels.com/photos/8381880/pexels-photo-8381880.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3738388/pexels-photo-3738388.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8381881/pexels-photo-8381881.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8170563/pexels-photo-8170563.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8381882/pexels-photo-8381882.jpeg?auto=compress&cs=tinysrgb&w=800'
  ]
];

const imageDescriptions = [
  'Full View - Main Display',
  'Drape & Border Detail',
  'Pallu & Design Pattern',
  'Close-up Texture & Work',
  'Back View & Blouse Piece'
];

const updateProductImages = async () => {
  try {
    const products = await Product.find({});
    console.log(`Found ${products.length} products to update\n`);

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      // Use different image sets for different products
      const imageSetIndex = i % sareeImageSets.length;
      const imageSet = sareeImageSets[imageSetIndex];

      const productImages = imageSet.map((url, index) => ({
        url: url,
        alt: `${product.name} - ${imageDescriptions[index]}`
      }));

      product.images = productImages;
      product.mainImageIndex = 0; // First image is main, second will be hover

      await product.save();
      console.log(`✓ Updated ${i + 1}/${products.length}: ${product.name}`);
      console.log(`  Image Set: ${imageSetIndex + 1} (${imageSet.length} images)`);
    }

    console.log('\n✅ All products updated successfully with working Pexels images!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📸 Image Structure:');
    console.log('   • Image 0 (Main): Primary display on listings');
    console.log('   • Image 1 (Hover): Shows on hover effect');
    console.log('   • Images 2-4: Gallery thumbnails');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating products:', error);
    process.exit(1);
  }
};

updateProductImages();
