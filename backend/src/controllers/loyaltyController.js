const LoyaltySettings = require('../models/LoyaltySettings');
const Wallet = require('../models/Wallet');
const Referral = require('../models/Referral');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get loyalty settings
// @route   GET /api/loyalty/settings
// @access  Public
exports.getLoyaltySettings = async (req, res) => {
  try {
    const settings = await LoyaltySettings.getSettings();

    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get loyalty settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty settings',
      error: error.message
    });
  }
};

// @desc    Update loyalty settings (Admin)
// @route   PUT /api/loyalty/settings
// @access  Private/Admin
exports.updateLoyaltySettings = async (req, res) => {
  try {
    const settings = await LoyaltySettings.getSettings();

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (settings.schema.paths[key]) {
        settings[key] = req.body[key];
      }
    });

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Loyalty settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update loyalty settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update loyalty settings',
      error: error.message
    });
  }
};

// @desc    Process pending rewards (Called by cron job or manually)
// @route   POST /api/loyalty/process-rewards
// @access  Private/Admin
exports.processPendingRewards = async (req, res) => {
  try {
    const settings = await LoyaltySettings.getSettings();
    const now = new Date();

    // Find orders that are eligible for rewards
    const eligibleOrders = await Order.find({
      isPaid: true,
      rewardsEligible: true,
      rewardsCredited: false,
      isRefunded: false,
      orderStatus: { $nin: ['Cancelled', 'Refunded'] }
    }).populate('user');

    const processedOrders = [];
    const errors = [];

    for (const order of eligibleOrders) {
      try {
        // Check if refund period has passed
        const orderDate = order.paidAt || order.createdAt;
        const refundPeriodEnd = new Date(orderDate);
        refundPeriodEnd.setDate(refundPeriodEnd.getDate() + settings.refundPeriodDays);

        if (now >= refundPeriodEnd) {
          // Calculate reward amount (excluding points discount from reward calculation)
          const eligibleAmount = order.totalPrice - (order.pointsDiscount || 0);

          if (eligibleAmount >= settings.minOrderAmountForReward) {
            const rewardAmount = Math.floor((eligibleAmount * settings.purchaseRewardPercentage) / 100);

            // Credit purchase reward to user wallet
            if (rewardAmount > 0 && settings.purchaseRewardEnabled) {
              let wallet = await Wallet.findOne({ user: order.user._id });
              if (!wallet) {
                wallet = await Wallet.create({ user: order.user._id });
              }

              wallet.addTransaction({
                type: 'purchase_reward',
                amount: rewardAmount,
                orderId: order._id,
                description: `Purchase reward for order ${order.orderNumber}`,
                status: 'completed'
              });

              await wallet.save();

              // Update order
              order.rewardsCredited = true;
              order.rewardsAmount = rewardAmount;
            }

            // Process referral reward if applicable
            if (order.user.referredBy && settings.referralRewardEnabled) {
              const referralRewardAmount = Math.floor((eligibleAmount * settings.referralRewardPercentage) / 100);

              if (referralRewardAmount > 0 && !order.referralRewardCredited) {
                // Find referral record
                const referral = await Referral.findOne({
                  referrer: order.user.referredBy,
                  referee: order.user._id
                });

                if (referral) {
                  // Credit reward to referrer's wallet
                  let referrerWallet = await Wallet.findOne({ user: order.user.referredBy });
                  if (!referrerWallet) {
                    referrerWallet = await Wallet.create({ user: order.user.referredBy });
                  }

                  referrerWallet.addTransaction({
                    type: 'referral_reward',
                    amount: referralRewardAmount,
                    orderId: order._id,
                    referralId: referral._id,
                    description: `Referral reward from ${order.user.name}'s purchase`,
                    status: 'completed'
                  });

                  await referrerWallet.save();

                  // Update referral record
                  referral.addPurchaseReward(order._id, eligibleAmount, referralRewardAmount);
                  await referral.save();

                  // Update order
                  order.referralRewardCredited = true;
                }
              }
            }

            await order.save();
            processedOrders.push({
              orderNumber: order.orderNumber,
              rewardAmount: order.rewardsAmount
            });
          }
        }
      } catch (orderError) {
        console.error(`Error processing order ${order.orderNumber}:`, orderError);
        errors.push({
          orderNumber: order.orderNumber,
          error: orderError.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Pending rewards processed',
      processed: processedOrders.length,
      processedOrders,
      errors
    });
  } catch (error) {
    console.error('Process pending rewards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process pending rewards',
      error: error.message
    });
  }
};

// @desc    Calculate potential rewards for order
// @route   POST /api/loyalty/calculate-rewards
// @access  Public
exports.calculateRewards = async (req, res) => {
  try {
    const { orderAmount, pointsUsed = 0 } = req.body;

    if (!orderAmount || orderAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order amount'
      });
    }

    const settings = await LoyaltySettings.getSettings();

    // Calculate points discount
    const pointsDiscount = pointsUsed * settings.pointValue;

    // Calculate eligible amount (order amount - points discount)
    const eligibleAmount = orderAmount - pointsDiscount;

    // Calculate purchase reward
    const purchaseReward = settings.purchaseRewardEnabled
      ? Math.floor((eligibleAmount * settings.purchaseRewardPercentage) / 100)
      : 0;

    // Calculate referral reward (if user was referred)
    let referralReward = 0;
    if (req.user && req.user.referredBy && settings.referralRewardEnabled) {
      referralReward = Math.floor((eligibleAmount * settings.referralRewardPercentage) / 100);
    }

    res.status(200).json({
      success: true,
      rewards: {
        orderAmount,
        pointsUsed,
        pointsDiscount,
        eligibleAmount,
        purchaseReward,
        referralReward,
        refundPeriodDays: settings.refundPeriodDays
      }
    });
  } catch (error) {
    console.error('Calculate rewards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate rewards',
      error: error.message
    });
  }
};
