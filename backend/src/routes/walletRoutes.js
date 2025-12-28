const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getWallet,
  getTransactions,
  getWalletStats,
  redeemPoints
} = require('../controllers/walletController');

// All routes require authentication
router.use(protect);

router.get('/', getWallet);
router.get('/transactions', getTransactions);
router.get('/stats', getWalletStats);
router.post('/redeem', redeemPoints);

module.exports = router;
