require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Product = require('../src/models/Product');

connectDB();

// Array of varied saree images from Unsplash
const sareeImages = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c',
  'https://images.unsplash.com/photo-1583391733956-6c78276477e5',
  'https://images.unsplash.com/photo-1590736969955-71cc94901144',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb',
  'https://images.unsplash.com/photo-1596461123401-4c5d46d77eff',
  'https://images.unsplash.com/photo-1583391265337-f5c8e5640b80',
  'https://images.unsplash.com/photo-1610030551994-cac5ec1d76e0',
  'https://images.unsplash.com/photo-1603569283847-aa295f0d016a',
  'https://images.unsplash.com/photo-1583391265337-f5c8e5640b81',
  'https://images.unsplash.com/photo-1583391733981-5f5c1b34e90a',
  'https://images.unsplash.com/photo-1596461123522-e4d49838bb90',
  'https://images.unsplash.com/photo-1610030469671-11c1b0e2825f',
  'https://images.unsplash.com/photo-1583391733956-6c78276477e2',
  'https://images.unsplash.com/photo-1617627143684-8d3f9b4e7f1c',
  'https://images.unsplash.com/photo-1583391733971-2b830b8f8e75',
  'https://images.unsplash.com/photo-1610030469664-3f4f5f8b0d1d',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bc',
  'https://images.unsplash.com/photo-1590736969955-71cc94901145',
  'https://images.unsplash.com/photo-1583391733956-6c78276477e3',
  'https://images.unsplash.com/photo-1583391265337-f5c8e5640b82'
];

const imageDescriptions = [
  'Front View',
  'Drape Detail',
  'Border Pattern',
  'Pallu Design',
  'Full Length View',
  'Close-up Texture',
  'Pleats Detail',
  'Blouse Piece',
  'Side Angle',
  'Back View'
];

const updateProductImages = async () => {
  try {
    const products = await Product.find({});
    console.log(`Found ${products.length} products to update`);

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      // Create 5 unique images for each product
      const startIndex = (i * 5) % sareeImages.length;
      const productImages = [];

      for (let j = 0; j < 5; j++) {
        const imageIndex = (startIndex + j) % sareeImages.length;
        productImages.push({
          url: `${sareeImages[imageIndex]}?w=800&q=80`,
          alt: `${product.name} - ${imageDescriptions[j % imageDescriptions.length]}`
        });
      }

      product.images = productImages;
      product.mainImageIndex = 0; // First image is main, second will be hover

      await product.save();
      console.log(`✓ Updated ${i + 1}/${products.length}: ${product.name}`);
    }

    console.log('\n✅ All products updated successfully with 5 images each!');
    console.log('- Main image (index 0): Primary display image');
    console.log('- Hover image (index 1): Shows on hover');
    console.log('- Gallery images (all 5): Available in product detail view');

    process.exit(0);
  } catch (error) {
    console.error('Error updating products:', error);
    process.exit(1);
  }
};

updateProductImages();
