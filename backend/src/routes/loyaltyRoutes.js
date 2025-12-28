const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getLoyaltySettings,
  updateLoyaltySettings,
  processPendingRewards,
  calculateRewards
} = require('../controllers/loyaltyController');

// Public routes
router.get('/settings', getLoyaltySettings);
router.post('/calculate-rewards', calculateRewards);

// Admin routes
router.put('/settings', protect, admin, updateLoyaltySettings);
router.post('/process-rewards', protect, admin, processPendingRewards);

module.exports = router;
