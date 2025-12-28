const express = require('express');
const router = express.Router();
const {
  getRazorpayKey,
  createRazorpayOrder,
  verifyPayment,
  razorpayWebhook,
  createRefund
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/razorpay-key', getRazorpayKey);
router.post('/webhook', razorpayWebhook); // Webhook must be public but verified internally

// Protected routes
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);

// Admin routes
router.post('/refund/:orderId', protect, authorize('admin'), createRefund);

module.exports = router;
