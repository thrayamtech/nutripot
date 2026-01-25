require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');
const securityHeaders = require('./src/middleware/securityHeaders');

// Initialize express
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(securityHeaders); // Security headers (CSP, HSTS, XFO, etc.)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(morgan('dev'));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/cart', require('./src/routes/cartRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/payment', require('./src/routes/paymentRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/upload', require('./src/routes/uploadRoutes'));
app.use('/api/sliders', require('./src/routes/sliderRoutes'));
app.use('/api/settings', require('./src/routes/siteSettingRoutes'));
app.use('/api/coupons', require('./src/routes/couponRoutes'));
app.use('/api/wallet', require('./src/routes/walletRoutes'));
app.use('/api/referral', require('./src/routes/referralRoutes'));
app.use('/api/loyalty', require('./src/routes/loyaltyRoutes'));
app.use('/api/analytics', require('./src/routes/analytics'));
app.use('/api/reels', require('./src/routes/reelRoutes'));
app.use('/api/seo', require('./src/routes/seoRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});
