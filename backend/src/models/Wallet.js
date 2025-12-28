const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['purchase_reward', 'referral_reward', 'redemption', 'refund', 'manual_adjustment'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  referralId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral'
  },
  description: {
    type: String,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  // For pending transactions that will be credited after refund period
  scheduledFor: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEarned: {
    type: Number,
    default: 0
  },
  totalRedeemed: {
    type: Number,
    default: 0
  },
  purchaseRewards: {
    type: Number,
    default: 0
  },
  referralRewards: {
    type: Number,
    default: 0
  },
  transactions: [walletTransactionSchema]
}, {
  timestamps: true
});

// Method to add transaction
walletSchema.methods.addTransaction = function(transactionData) {
  const newBalance = this.balance + transactionData.amount;

  const transaction = {
    ...transactionData,
    balanceAfter: newBalance
  };

  this.transactions.push(transaction);
  this.balance = newBalance;

  // Update totals based on transaction type
  if (transactionData.amount > 0) {
    this.totalEarned += transactionData.amount;
    if (transactionData.type === 'purchase_reward') {
      this.purchaseRewards += transactionData.amount;
    } else if (transactionData.type === 'referral_reward') {
      this.referralRewards += transactionData.amount;
    }
  } else {
    this.totalRedeemed += Math.abs(transactionData.amount);
  }

  return transaction;
};

// Method to get transaction history
walletSchema.methods.getTransactionHistory = function(limit = 50) {
  return this.transactions
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
};

module.exports = mongoose.model('Wallet', walletSchema);
