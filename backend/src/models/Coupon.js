const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please provide a coupon code'],
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: [true, 'Please provide discount value'],
    min: 0
  },
  minPurchase: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDiscount: {
    type: Number,
    min: 0
  },
  expiryDate: {
    type: Date
  },
  usageLimit: {
    type: Number,
    min: 0
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to check if coupon is valid
couponSchema.methods.isValid = function(orderTotal) {
  // Check if active
  if (!this.isActive) {
    return { valid: false, message: 'This coupon is not active' };
  }

  // Check if expired
  if (this.expiryDate && new Date() > new Date(this.expiryDate)) {
    return { valid: false, message: 'This coupon has expired' };
  }

  // Check usage limit
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'This coupon has reached its usage limit' };
  }

  // Check minimum purchase
  if (this.minPurchase && orderTotal < this.minPurchase) {
    return { valid: false, message: `Minimum purchase of ₹${this.minPurchase} required` };
  }

  return { valid: true };
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(orderTotal) {
  let discount = 0;

  if (this.discountType === 'percentage') {
    discount = (orderTotal * this.discountValue) / 100;

    // Apply max discount cap if exists
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    // Fixed discount
    discount = this.discountValue;

    // Don't allow discount to exceed order total
    if (discount > orderTotal) {
      discount = orderTotal;
    }
  }

  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

module.exports = mongoose.model('Coupon', couponSchema);
