const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Wallet = require('../models/Wallet');
const LoyaltySettings = require('../models/LoyaltySettings');
const Razorpay = require('razorpay');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, discount, pointsUsed, pointsDiscount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items'
      });
    }

    // Calculate prices
    let itemsPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.name}`
        });
      }

      const price = product.discountPrice || product.price;
      itemsPrice += price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price
      });

      // Update product stock and sold count
      product.stock -= item.quantity;
      product.sold += item.quantity;
      await product.save();
    }

    const shippingPrice = itemsPrice > 999 ? 0 : 50;
    const taxPrice = 0; // Tax can be added if needed

    // Apply coupon discount if provided
    let discountAmount = 0;
    let appliedCouponCode = null;

    if (couponCode && discount) {
      // Validate coupon one more time on backend
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

      if (coupon) {
        const subtotal = itemsPrice + shippingPrice;
        const validation = coupon.isValid(subtotal);

        if (validation.valid) {
          const calculatedDiscount = coupon.calculateDiscount(subtotal);

          // Use the discount from frontend but verify it matches backend calculation
          if (Math.abs(calculatedDiscount - discount) <= 1) { // Allow 1 rupee difference for rounding
            discountAmount = discount;
            appliedCouponCode = coupon.code;

            // Increment coupon usage count
            coupon.usedCount += 1;
            await coupon.save();
          }
        }
      }
    }

    // Handle wallet points deduction with comprehensive validation
    let pointsDiscountAmount = 0;
    let usedPoints = 0;

    if (pointsUsed && pointsUsed > 0) {
      // Get loyalty settings
      const loyaltySettings = await LoyaltySettings.getSettings();

      if (!loyaltySettings.pointRedemptionEnabled) {
        return res.status(400).json({
          success: false,
          message: 'Point redemption is currently disabled'
        });
      }

      // Get user wallet
      let wallet = await Wallet.findOne({ user: req.user.id });
      if (!wallet) {
        return res.status(400).json({
          success: false,
          message: 'Wallet not found'
        });
      }

      // SECURITY: Verify user has enough points
      if (wallet.balance < pointsUsed) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient wallet balance'
        });
      }

      // SECURITY: Verify minimum points requirement
      if (pointsUsed < loyaltySettings.minPointsForRedemption) {
        return res.status(400).json({
          success: false,
          message: `Minimum ${loyaltySettings.minPointsForRedemption} points required for redemption`
        });
      }

      // SECURITY: Calculate and verify discount amount matches point value
      const calculatedDiscount = pointsUsed * loyaltySettings.pointValue;
      if (Math.abs(calculatedDiscount - pointsDiscount) > 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid points discount amount'
        });
      }

      // SECURITY: Calculate order subtotal for max redemption validation
      const orderSubtotal = itemsPrice + shippingPrice - discountAmount;

      // SECURITY: Verify points don't exceed maximum redemption percentage
      const maxAllowedDiscount = (orderSubtotal * loyaltySettings.maxRedemptionPercentage) / 100;

      if (pointsDiscount > maxAllowedDiscount) {
        return res.status(400).json({
          success: false,
          message: `Points can only cover up to ${loyaltySettings.maxRedemptionPercentage}% of order value (max ₹${Math.floor(maxAllowedDiscount)})`
        });
      }

      // SECURITY: Ensure points discount doesn't exceed order subtotal
      if (pointsDiscount > orderSubtotal) {
        return res.status(400).json({
          success: false,
          message: 'Points discount cannot exceed order amount'
        });
      }

      // SECURITY: Validate pointsUsed is a positive integer
      if (!Number.isInteger(pointsUsed) || pointsUsed < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid points amount'
        });
      }

      pointsDiscountAmount = pointsDiscount;
      usedPoints = pointsUsed;

      // Deduct points from wallet (this will be recorded as redemption transaction)
      // Note: We'll create the transaction after order is created to link the order ID
    }

    const totalPrice = itemsPrice + shippingPrice + taxPrice - discountAmount - pointsDiscountAmount;

    // Create Razorpay order for online payments
    let razorpayOrderId = null;
    if (paymentMethod !== 'COD') {
      try {
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(totalPrice * 100), // Amount in paise
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          notes: {
            user_id: req.user.id,
            payment_method: paymentMethod
          }
        });
        razorpayOrderId = razorpayOrder.id;
      } catch (error) {
        console.error('Razorpay order creation error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to create payment order'
        });
      }
    }

    // Calculate expected rewards
    const loyaltySettings = await LoyaltySettings.getSettings();
    const eligibleAmount = totalPrice; // Total after all discounts including points
    let expectedRewards = 0;

    if (loyaltySettings.purchaseRewardEnabled && eligibleAmount >= loyaltySettings.minOrderAmountForReward) {
      expectedRewards = Math.floor((eligibleAmount * loyaltySettings.purchaseRewardPercentage) / 100);
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      couponCode: appliedCouponCode,
      discount: discountAmount,
      pointsUsed: usedPoints,
      pointsDiscount: pointsDiscountAmount,
      totalPrice,
      rewardsEligible: true,
      rewardsAmount: expectedRewards,
      razorpayOrderId,
      isPaid: paymentMethod === 'COD' ? false : false, // Online payments verified later
      statusHistory: [{
        status: 'Pending',
        note: paymentMethod === 'COD' ? 'Order placed - COD' : 'Order placed - awaiting payment'
      }]
    });

    // Deduct points from wallet if used
    if (usedPoints > 0) {
      let wallet = await Wallet.findOne({ user: req.user.id });
      if (!wallet) {
        wallet = await Wallet.create({ user: req.user.id });
      }

      wallet.addTransaction({
        type: 'redemption',
        amount: -usedPoints,
        orderId: order._id,
        description: `Points redeemed for order ${order.orderNumber}`,
        status: 'completed'
      });

      await wallet.save();
    }

    // Clear user's cart only for COD, for online payment clear after successful payment
    if (paymentMethod === 'COD') {
      await Cart.findOneAndUpdate(
        { user: req.user.id },
        { items: [], totalAmount: 0 }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      _id: order._id,
      razorpayOrderId,
      totalPrice,
      order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Make sure user owns order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by status
    if (req.query.status) {
      query.orderStatus = req.query.status;
    }

    // Filter by payment status
    if (req.query.isPaid) {
      query.isPaid = req.query.isPaid === 'true';
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      note: note || `Order status updated to ${status}`
    });

    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    if (status === 'Cancelled') {
      order.cancelledAt = Date.now();

      // Restore product stock
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          product.sold -= item.quantity;
          await product.save();
        }
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update order to paid (Admin)
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
exports.updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentInfo = {
      id: req.body.id,
      status: req.body.status
    };

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order marked as paid',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Can't cancel if already shipped or delivered
    if (['Shipped', 'Delivered'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order that has been shipped or delivered'
      });
    }

    order.orderStatus = 'Cancelled';
    order.cancelledAt = Date.now();
    order.statusHistory.push({
      status: 'Cancelled',
      note: req.body.reason || 'Cancelled by user'
    });

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        product.sold -= item.quantity;
        await product.save();
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
