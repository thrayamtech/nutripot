const Wallet = require('../models/Wallet');
const User = require('../models/User');
const LoyaltySettings = require('../models/LoyaltySettings');

// @desc    Get user wallet
// @route   GET /api/wallet
// @access  Private
exports.getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = await Wallet.create({ user: req.user._id });
    }

    res.status(200).json({
      success: true,
      wallet
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet',
      error: error.message
    });
  }
};

// @desc    Get wallet transaction history
// @route   GET /api/wallet/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const { limit = 50, type } = req.query;

    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    let transactions = wallet.transactions;

    // Filter by type if specified
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }

    // Sort by date (newest first) and limit
    transactions = transactions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      transactions,
      total: transactions.length
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
};

// @desc    Get wallet statistics
// @route   GET /api/wallet/stats
// @access  Private
exports.getWalletStats = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(200).json({
        success: true,
        stats: {
          balance: 0,
          totalEarned: 0,
          totalRedeemed: 0,
          purchaseRewards: 0,
          referralRewards: 0,
          pendingRewards: 0
        }
      });
    }

    // Calculate pending rewards
    const pendingRewards = wallet.transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    res.status(200).json({
      success: true,
      stats: {
        balance: wallet.balance,
        totalEarned: wallet.totalEarned,
        totalRedeemed: wallet.totalRedeemed,
        purchaseRewards: wallet.purchaseRewards,
        referralRewards: wallet.referralRewards,
        pendingRewards
      }
    });
  } catch (error) {
    console.error('Get wallet stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet statistics',
      error: error.message
    });
  }
};

// @desc    Redeem points (for checkout)
// @route   POST /api/wallet/redeem
// @access  Private
exports.redeemPoints = async (req, res) => {
  try {
    const { points } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid points amount'
      });
    }

    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    if (wallet.balance < points) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    const settings = await LoyaltySettings.getSettings();

    if (!settings.pointRedemptionEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Point redemption is currently disabled'
      });
    }

    if (points < settings.minPointsForRedemption) {
      return res.status(400).json({
        success: false,
        message: `Minimum ${settings.minPointsForRedemption} points required for redemption`
      });
    }

    // Calculate discount value
    const discountValue = points * settings.pointValue;

    res.status(200).json({
      success: true,
      points,
      discountValue,
      remainingBalance: wallet.balance - points
    });
  } catch (error) {
    console.error('Redeem points error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to redeem points',
      error: error.message
    });
  }
};
