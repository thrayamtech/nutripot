const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: {
    type: String,
    required: true
  },
  color: {
    name: String,
    hexCode: String
  },
  price: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'Razorpay']
  },
  paymentInfo: {
    id: String,
    status: String,
    paidAt: Date,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paymentMethod: String
  },
  razorpayOrderId: String,
  isRefunded: {
    type: Boolean,
    default: false
  },
  refundedAt: Date,
  refundInfo: {
    refundId: String,
    amount: Number,
    status: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0
  },
  couponCode: {
    type: String,
    uppercase: true
  },
  discount: {
    type: Number,
    default: 0
  },
  pointsUsed: {
    type: Number,
    default: 0
  },
  pointsDiscount: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  // Loyalty rewards
  rewardsEligible: {
    type: Boolean,
    default: true
  },
  rewardsCredited: {
    type: Boolean,
    default: false
  },
  rewardsAmount: {
    type: Number,
    default: 0
  },
  referralRewardCredited: {
    type: Boolean,
    default: false
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded', 'Payment Failed'],
    default: 'Pending'
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date,
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date,
  cancelledAt: Date,
  statusHistory: [{
    status: String,
    note: String,
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  trackingNumber: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `ORD${year}${month}${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
