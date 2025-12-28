const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  refereeName: {
    type: String,
    required: true,
    trim: true
  },
  refereeWhatsApp: {
    type: String,
    required: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit WhatsApp number']
  },
  referee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'registered', 'active', 'completed'],
    default: 'pending'
  },
  // Track successful purchases by referee
  purchases: [{
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    orderAmount: Number,
    rewardAmount: Number,
    rewardedAt: Date
  }],
  totalRewardEarned: {
    type: Number,
    default: 0
  },
  activatedAt: {
    type: Date
  },
  registeredAt: {
    type: Date
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add purchase reward
referralSchema.methods.addPurchaseReward = function(orderId, orderAmount, rewardAmount) {
  this.purchases.push({
    orderId,
    orderAmount,
    rewardAmount,
    rewardedAt: new Date()
  });

  this.totalRewardEarned += rewardAmount;

  if (this.status === 'pending') {
    this.status = 'active';
    this.activatedAt = new Date();
  }
};

module.exports = mongoose.model('Referral', referralSchema);
