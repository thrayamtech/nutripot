require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

connectDB();

const users = [
  {
    name: 'Admin User',
    email: 'admin@saree.com',
    password: 'admin123',
    role: 'admin',
    phone: '9876543210',
    isActive: true
  },
  {
    name: 'Test Customer',
    email: 'customer@test.com',
    password: 'customer123',
    role: 'customer',
    phone: '9876543211',
    isActive: true
  }
];

const categories = [
  {
    name: 'Silk Sarees',
    slug: 'silk-sarees',
    description: 'Premium silk sarees for special occasions',
    image: 'silk-category.jpg'
  },
  {
    name: 'Cotton Sarees',
    slug: 'cotton-sarees',
    description: 'Comfortable cotton sarees for everyday wear',
    image: 'cotton-category.jpg'
  },
  {
    name: 'Mul Mul Cotton',
    slug: 'mul-mul-cotton',
    description: 'Lightweight and breathable mul mul cotton sarees',
    image: 'mulcotton-category.jpg'
  },
  {
    name: 'Kanjivaram Sarees',
    slug: 'kanjivaram-sarees',
    description: 'Traditional Kanjivaram silk sarees',
    image: 'kanjivaram-category.jpg'
  },
  {
    name: 'Designer Sarees',
    slug: 'designer-sarees',
    description: 'Contemporary designer sarees',
    image: 'designer-category.jpg'
  }
];

const createProducts = (categoryIds) => [
  {
    name: 'Royal Blue Kanjivaram Silk Saree',
    description: 'Exquisite Kanjivaram silk saree with intricate gold zari work. Perfect for weddings and special occasions.',
    price: 8999,
    discountPrice: 6499,
    category: categoryIds[3],
    fabric: 'Kanjivaram Silk',
    colors: [
      { name: 'Royal Blue', hexCode: '#4169E1' },
      { name: 'Maroon', hexCode: '#800000' },
      { name: 'Emerald Green', hexCode: '#50C878' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500', alt: 'Royal Blue Kanjivaram Silk Saree - Front View' },
      { url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=500', alt: 'Saree Detail - Zari Work' },
      { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500', alt: 'Saree Pallu Design' },
      { url: 'https://images.unsplash.com/photo-1583391733981-5f5c1b34e90a?w=500', alt: 'Full Drape View' },
      { url: 'https://images.unsplash.com/photo-1610030469671-11c1b0e2825f?w=500', alt: 'Blouse Piece Detail' }
    ],
    mainImageIndex: 0,
    stock: 25,
    isFeatured: true,
    tags: ['wedding', 'silk', 'traditional'],
    specifications: {
      length: '6.5 meters',
      width: '1.2 meters',
      blousePiece: true,
      washCare: 'Dry clean only',
      occasion: ['Wedding', 'Festival', 'Party']
    }
  },
  {
    name: 'Elegant Mul Mul Cotton Saree',
    description: 'Soft and lightweight mul mul cotton saree with beautiful prints. Ideal for daily wear.',
    price: 1299,
    discountPrice: 999,
    category: categoryIds[2],
    fabric: 'Mul Mul Cotton',
    colors: [
      { name: 'Peach', hexCode: '#FFE5B4' },
      { name: 'White', hexCode: '#FFFFFF' },
      { name: 'Light Pink', hexCode: '#FFB6C1' },
      { name: 'Mint Green', hexCode: '#98FF98' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500', alt: 'Mul Mul Cotton Saree' }
    ],
    stock: 50,
    isFeatured: true,
    tags: ['casual', 'cotton', 'comfortable'],
    specifications: {
      length: '6 meters',
      width: '1.1 meters',
      blousePiece: true,
      washCare: 'Hand wash with mild detergent',
      occasion: ['Casual', 'Office', 'Daily Wear']
    }
  },
  {
    name: 'Classic Red Banarasi Silk Saree',
    description: 'Traditional Banarasi silk saree with golden border. A timeless piece for special occasions.',
    price: 12999,
    discountPrice: 9999,
    category: categoryIds[0],
    fabric: 'Banarasi',
    colors: [
      { name: 'Red', hexCode: '#DC143C' },
      { name: 'Gold', hexCode: '#FFD700' }
    ],
    sizes: ['Free Size'],
    images: [
      { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500', alt: 'Banarasi Silk Saree' }
    ],
    stock: 15,
    isFeatured: true,
    tags: ['wedding', 'silk', 'traditional', 'bridal'],
    specifications: {
      length: '6.5 meters',
      width: '1.2 meters',
      blousePiece: true,
      washCare: 'Dry clean only',
      occasion: ['Wedding', 'Festival']
    }
  },
  {
    name: 'Pastel Green Cotton Saree',
    description: 'Comfortable cotton saree in refreshing pastel green with contrast border.',
    price: 1599,
    discountPrice: 1199,
    category: categoryIds[1],
    fabric: 'Cotton',
    colors: [
      { name: 'Pastel Green', hexCode: '#98FB98' }
    ],
    sizes: ['Free Size'],
    images: [
      { url: 'https://images.unsplash.com/photo-1596461123401-4c5d46d77eff?w=500', alt: 'Cotton Saree' }
    ],
    stock: 40,
    tags: ['casual', 'cotton', 'summer'],
    specifications: {
      length: '6 meters',
      width: '1.1 meters',
      blousePiece: true,
      washCare: 'Machine wash cold',
      occasion: ['Casual', 'Office', 'College']
    }
  },
  {
    name: 'Designer Georgette Saree with Sequins',
    description: 'Modern designer georgette saree with sequin work. Perfect for parties and gatherings.',
    price: 3999,
    discountPrice: 2999,
    category: categoryIds[4],
    fabric: 'Georgette',
    colors: [
      { name: 'Navy Blue', hexCode: '#000080' },
      { name: 'Black', hexCode: '#000000' },
      { name: 'Wine Red', hexCode: '#722F37' },
      { name: 'Royal Purple', hexCode: '#7851A9' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1583391265337-f5c8e5640b80?w=500', alt: 'Designer Georgette Saree' }
    ],
    stock: 30,
    isFeatured: true,
    tags: ['party', 'designer', 'modern'],
    specifications: {
      length: '6 meters',
      width: '1.1 meters',
      blousePiece: true,
      washCare: 'Dry clean recommended',
      occasion: ['Party', 'Cocktail', 'Evening']
    }
  },
  {
    name: 'Pink Linen Saree',
    description: 'Breathable linen saree in soft pink shade. Great for summer wear.',
    price: 1899,
    discountPrice: 1499,
    category: categoryIds[1],
    fabric: 'Linen',
    colors: [
      { name: 'Pink', hexCode: '#FFC0CB' }
    ],
    sizes: ['Free Size'],
    images: [
      { url: 'https://images.unsplash.com/photo-1610030551994-cac5ec1d76e0?w=500', alt: 'Linen Saree' }
    ],
    stock: 35,
    tags: ['summer', 'linen', 'comfortable'],
    specifications: {
      length: '6 meters',
      width: '1.1 meters',
      blousePiece: true,
      washCare: 'Hand wash or dry clean',
      occasion: ['Casual', 'Office', 'Day Events']
    }
  },
  {
    name: 'Maroon Art Silk Saree',
    description: 'Elegant art silk saree with beautiful embroidery work.',
    price: 2499,
    discountPrice: 1899,
    category: categoryIds[0],
    fabric: 'Art Silk',
    colors: [
      { name: 'Maroon', hexCode: '#800000' }
    ],
    sizes: ['Free Size'],
    images: [
      { url: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=500', alt: 'Art Silk Saree' }
    ],
    stock: 28,
    tags: ['festive', 'embroidery', 'elegant'],
    specifications: {
      length: '6 meters',
      width: '1.1 meters',
      blousePiece: true,
      washCare: 'Dry clean only',
      occasion: ['Festival', 'Function', 'Party']
    }
  },
  {
    name: 'Cream Net Saree with Embroidery',
    description: 'Delicate net saree with intricate embroidery. Perfect for elegant occasions.',
    price: 4999,
    discountPrice: 3999,
    category: categoryIds[4],
    fabric: 'Net',
    colors: [
      { name: 'Cream', hexCode: '#FFFDD0' },
      { name: 'Ivory', hexCode: '#FFFFF0' },
      { name: 'Champagne', hexCode: '#F7E7CE' }
    ],
    sizes: ['M', 'L', 'XL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1583391265337-f5c8e5640b81?w=500', alt: 'Net Saree' }
    ],
    stock: 20,
    tags: ['designer', 'embroidery', 'party'],
    specifications: {
      length: '6 meters',
      width: '1.1 meters',
      blousePiece: true,
      washCare: 'Dry clean only',
      occasion: ['Wedding', 'Reception', 'Party']
    }
  },
  {
    name: 'Turquoise Silk Saree with Zari',
    description: 'Stunning turquoise silk saree with traditional zari work.',
    price: 7999,
    discountPrice: 5999,
    category: categoryIds[0],
    fabric: 'Silk',
    colors: [
      { name: 'Turquoise', hexCode: '#40E0D0' },
      { name: 'Teal', hexCode: '#008080' }
    ],
    sizes: ['S', 'M', 'L'],
    images: [
      { url: 'https://images.unsplash.com/photo-1583391733981-5f5c1b34e90a?w=500', alt: 'Turquoise Silk Saree' }
    ],
    stock: 18,
    isFeatured: true,
    tags: ['silk', 'festive', 'zari'],
    specifications: {
      length: '6.5 meters',
      width: '1.2 meters',
      blousePiece: true,
      washCare: 'Dry clean only',
      occasion: ['Festival', 'Wedding', 'Party']
    }
  },
  {
    name: 'Lavender Chiffon Saree',
    description: 'Elegant lavender chiffon saree with delicate embellishments.',
    price: 2999,
    discountPrice: 2199,
    category: categoryIds[4],
    fabric: 'Chiffon',
    colors: [
      { name: 'Lavender', hexCode: '#E6E6FA' },
      { name: 'Light Purple', hexCode: '#DDA0DD' }
    ],
    sizes: ['Free Size'],
    images: [
      { url: 'https://images.unsplash.com/photo-1596461123522-e4d49838bb90?w=500', alt: 'Chiffon Saree' }
    ],
    stock: 32,
    isFeatured: true,
    tags: ['party', 'chiffon', 'elegant'],
    specifications: {
      length: '6 meters',
      width: '1.1 meters',
      blousePiece: true,
      washCare: 'Hand wash gently',
      occasion: ['Party', 'Evening', 'Reception']
    }
  },
  {
    name: 'Mustard Yellow Cotton Saree',
    description: 'Vibrant mustard yellow cotton saree with block prints.',
    price: 1399,
    discountPrice: 1099,
    category: categoryIds[1],
    fabric: 'Cotton',
    colors: [
      { name: 'Mustard Yellow', hexCode: '#FFDB58' }
    ],
    sizes: ['Free Size'],
    images: [
      { url: 'https://images.unsplash.com/photo-1610030469671-11c1b0e2825f?w=500', alt: 'Cotton Saree' }
    ],
    stock: 45,
    tags: ['casual', 'summer', 'prints'],
    specifications: {
      length: '6 meters',
      width: '1.1 meters',
      blousePiece: true,
      washCare: 'Machine wash',
      occasion: ['Casual', 'Office', 'Daily']
    }
  },
  {
    name: 'Black Georgette Saree with Gold Print',
    description: 'Classic black georgette with elegant gold foil print work.',
    price: 3499,
    discountPrice: 2699,
    category: categoryIds[4],
    fabric: 'Georgette',
    colors: [
      { name: 'Black', hexCode: '#000000' },
      { name: 'Black Gold', hexCode: '#1A1A1A' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500', alt: 'Black Georgette Saree' }
    ],
    stock: 22,
    isFeatured: true,
    tags: ['party', 'modern', 'elegant'],
    specifications: {
      length: '6 meters',
      width: '1.1 meters',
      blousePiece: true,
      washCare: 'Dry clean only',
      occasion: ['Party', 'Cocktail', 'Evening']
    }
  },
  {
    name: 'Orange Kanjivaram Temple Border Saree',
    description: 'Traditional orange Kanjivaram with exquisite temple border design.',
    price: 9999,
    discountPrice: 7499,
    category: categoryIds[3],
    fabric: 'Kanjivaram Silk',
    colors: [
      { name: 'Orange', hexCode: '#FF8C00' },
      { name: 'Rust Orange', hexCode: '#D2691E' }
    ],
    sizes: ['Free Size'],
    images: [
      { url: 'https://images.unsplash.com/photo-1617627143684-8d3f9b4e7f1c?w=500', alt: 'Kanjivaram Saree' }
    ],
    stock: 12,
    isFeatured: true,
    tags: ['wedding', 'traditional', 'temple'],
    specifications: {
      length: '6.5 meters',
      width: '1.2 meters',
      blousePiece: true,
      washCare: 'Dry clean only',
      occasion: ['Wedding', 'Festival', 'Temple']
    }
  },
  {
    name: 'Baby Pink Organza Saree',
    description: 'Soft baby pink organza saree with floral embroidery.',
    price: 3299,
    discountPrice: 2499,
    category: categoryIds[4],
    fabric: 'Net',
    colors: [
      { name: 'Baby Pink', hexCode: '#F4C2C2' },
      { name: 'Rose Pink', hexCode: '#FF66CC' }
    ],
    sizes: ['M', 'L', 'XL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1583391733971-2b830b8f8e75?w=500', alt: 'Organza Saree' }
    ],
    stock: 28,
    tags: ['party', 'floral', 'feminine'],
    specifications: {
      length: '6 meters',
      width: '1.1 meters',
      blousePiece: true,
      washCare: 'Dry clean recommended',
      occasion: ['Party', 'Reception', 'Sangeet']
    }
  },
  {
    name: 'Sea Green Handloom Cotton Saree',
    description: 'Beautiful handloom cotton saree in refreshing sea green.',
    price: 1799,
    discountPrice: 1399,
    category: categoryIds[1],
    fabric: 'Cotton',
    colors: [
      { name: 'Sea Green', hexCode: '#2E8B57' },
      { name: 'Jade Green', hexCode: '#00A86B' }
    ],
    sizes: ['Free Size'],
    images: [
      { url: 'https://images.unsplash.com/photo-1610030469664-3f4f5f8b0d1d?w=500', alt: 'Handloom Saree' }
    ],
    stock: 38,
    tags: ['handloom', 'eco-friendly', 'casual'],
    specifications: {
      length: '6 meters',
      width: '1.1 meters',
      blousePiece: true,
      washCare: 'Hand wash',
      occasion: ['Casual', 'Office', 'Day Events']
    }
  },
  {
    name: 'Burgundy Banarasi Silk Saree',
    description: 'Rich burgundy Banarasi with intricate brocade work.',
    price: 14999,
    discountPrice: 11999,
    category: categoryIds[0],
    fabric: 'Banarasi',
    colors: [
      { name: 'Burgundy', hexCode: '#800020' },
      { name: 'Deep Maroon', hexCode: '#5C2C2C' }
    ],
    sizes: ['Free Size'],
    images: [
      { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bc?w=500', alt: 'Banarasi Saree' }
    ],
    stock: 10,
    isFeatured: true,
    tags: ['bridal', 'luxury', 'traditional'],
    specifications: {
      length: '6.5 meters',
      width: '1.2 meters',
      blousePiece: true,
      washCare: 'Dry clean only',
      occasion: ['Wedding', 'Bridal', 'Festival']
    }
  },
  {
    name: 'Mint Green Mul Mul Cotton Printed Saree',
    description: 'Fresh mint green mul mul cotton with beautiful floral prints.',
    price: 1199,
    discountPrice: 899,
    category: categoryIds[2],
    fabric: 'Mul Mul Cotton',
    colors: [
      { name: 'Mint Green', hexCode: '#98FF98' },
      { name: 'Aqua Mint', hexCode: '#7FFFD4' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1590736969955-71cc94901145?w=500', alt: 'Mul Mul Saree' }
    ],
    stock: 55,
    tags: ['summer', 'printed', 'comfortable'],
    specifications: {
      length: '6 meters',
      width: '1.1 meters',
      blousePiece: true,
      washCare: 'Machine wash cold',
      occasion: ['Casual', 'Daily', 'Office']
    }
  },
  {
    name: 'Navy Blue Silk Saree with Silver Zari',
    description: 'Sophisticated navy blue silk with elegant silver zari border.',
    price: 8499,
    discountPrice: 6299,
    category: categoryIds[0],
    fabric: 'Silk',
    colors: [
      { name: 'Navy Blue', hexCode: '#000080' },
      { name: 'Midnight Blue', hexCode: '#191970' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e3?w=500', alt: 'Navy Silk Saree' }
    ],
    stock: 20,
    isFeatured: true,
    tags: ['formal', 'silk', 'elegant'],
    specifications: {
      length: '6.5 meters',
      width: '1.2 meters',
      blousePiece: true,
      washCare: 'Dry clean only',
      occasion: ['Wedding', 'Party', 'Formal']
    }
  },
  {
    name: 'Coral Pink Designer Saree with Sequins',
    description: 'Trendy coral pink designer saree with sequin and stone work.',
    price: 4499,
    discountPrice: 3299,
    category: categoryIds[4],
    fabric: 'Georgette',
    colors: [
      { name: 'Coral Pink', hexCode: '#FF7F50' },
      { name: 'Peach', hexCode: '#FFE5B4' },
      { name: 'Salmon', hexCode: '#FA8072' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1583391265337-f5c8e5640b82?w=500', alt: 'Designer Saree' }
    ],
    stock: 25,
    isFeatured: true,
    tags: ['party', 'trendy', 'modern'],
    specifications: {
      length: '6 meters',
      width: '1.1 meters',
      blousePiece: true,
      washCare: 'Dry clean only',
      occasion: ['Party', 'Cocktail', 'Sangeet']
    }
  },
  {
    name: 'White Mul Mul Cotton Saree with Gold Border',
    description: 'Pure white mul mul cotton with elegant gold border detail.',
    price: 1499,
    discountPrice: 1149,
    category: categoryIds[2],
    fabric: 'Mul Mul Cotton',
    colors: [
      { name: 'White', hexCode: '#FFFFFF' },
      { name: 'Off White', hexCode: '#FAF9F6' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [
      { url: 'https://images.unsplash.com/photo-1590736969955-71cc94901146?w=500', alt: 'White Mul Mul Saree' }
    ],
    stock: 42,
    tags: ['classic', 'elegant', 'versatile'],
    specifications: {
      length: '6 meters',
      width: '1.1 meters',
      blousePiece: true,
      washCare: 'Hand wash',
      occasion: ['Casual', 'Office', 'Formal']
    }
  }
];

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();

    // Drop indexes to avoid unique constraint issues
    try {
      await Category.collection.dropIndexes();
      await Product.collection.dropIndexes();
    } catch (err) {
      // Ignore if indexes don't exist
    }

    console.log('Data cleared!');

    // Insert users using save to trigger password hashing
    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`${createdUsers.length} users created!`);

    // Insert categories using save to trigger pre-save hooks
    const createdCategories = [];
    for (const catData of categories) {
      const category = new Category(catData);
      await category.save();
      createdCategories.push(category);
    }
    console.log(`${createdCategories.length} categories created!`);

    // Get category IDs
    const categoryIds = createdCategories.map(cat => cat._id);

    // Insert products using save to trigger pre-save hooks
    const products = createProducts(categoryIds);
    const createdProducts = [];
    for (const prodData of products) {
      const product = new Product(prodData);
      await product.save();
      createdProducts.push(product);
    }
    console.log(`${createdProducts.length} products created!`);

    console.log('\nSeed data imported successfully!');
    console.log('\nDefault Admin Credentials:');
    console.log('Email: admin@saree.com');
    console.log('Password: admin123');
    console.log('\nDefault Customer Credentials:');
    console.log('Email: customer@test.com');
    console.log('Password: customer123');

    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();

    console.log('Data destroyed!');
    process.exit();
  } catch (error) {
    console.error('Error destroying data:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
