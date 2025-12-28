const mongoose = require('mongoose');

const loyaltySettingsSchema = new mongoose.Schema({
  // Purchase reward settings
  purchaseRewardEnabled: {
    type: Boolean,
    default: true
  },
  purchaseRewardPercentage: {
    type: Number,
    default: 5,
    min: 0,
    max: 100
  },

  // Referral reward settings
  referralRewardEnabled: {
    type: Boolean,
    default: true
  },
  referralRewardPercentage: {
    type: Number,
    default: 5,
    min: 0,
    max: 100
  },

  // Reward eligibility
  refundPeriodDays: {
    type: Number,
    default: 7,
    min: 0
  },
  minOrderAmountForReward: {
    type: Number,
    default: 0
  },

  // Point redemption settings
  pointRedemptionEnabled: {
    type: Boolean,
    default: true
  },
  pointValue: {
    type: Number,
    default: 1, // 1 point = 1 rupee
    min: 0.01
  },
  minPointsForRedemption: {
    type: Number,
    default: 50
  },
  maxRedemptionPercentage: {
    type: Number,
    default: 50, // Can use max 50% of order value in points
    min: 0,
    max: 100
  },

  // Referral settings
  referralCodeExpiry: {
    type: Number,
    default: 365, // Days until referral code expires
    min: 0
  },
  maxReferralsPerUser: {
    type: Number,
    default: 0 // 0 means unlimited
  },

  // First purchase bonus
  firstPurchaseBonusEnabled: {
    type: Boolean,
    default: false
  },
  firstPurchaseBonusPoints: {
    type: Number,
    default: 100
  },

  // Other settings
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
loyaltySettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();

  if (!settings) {
    settings = await this.create({});
  }

  return settings;
};

module.exports = mongoose.model('LoyaltySettings', loyaltySettingsSchema);
