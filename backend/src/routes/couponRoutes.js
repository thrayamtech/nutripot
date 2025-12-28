const express = require('express');
const router = express.Router();
const {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/auth');

// Public route for validating coupons during checkout
router.post('/validate', validateCoupon);

module.exports = router;
