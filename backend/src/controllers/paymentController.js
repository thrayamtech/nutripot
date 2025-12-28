const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Get Razorpay Key ID for frontend
// @route   GET /api/payment/razorpay-key
// @access  Public
exports.getRazorpayKey = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency,
      receipt: receipt || `order_${Date.now()}`,
      notes: notes || {}
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order: razorpayOrder
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order',
      error: error.message
    });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details'
      });
    }

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== 'captured' && payment.status !== 'authorized') {
      return res.status(400).json({
        success: false,
        message: 'Payment not successful'
      });
    }

    // Find and update the order
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order with payment details
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentInfo = {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentMethod: payment.method,
      status: payment.status
    };
    order.orderStatus = 'Processing';
    order.statusHistory.push({
      status: 'Processing',
      note: 'Payment received successfully'
    });

    await order.save();

    // Clear user's cart after successful payment
    await Cart.findOneAndUpdate(
      { user: order.user },
      { items: [], totalAmount: 0 }
    );

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

// @desc    Razorpay webhook handler
// @route   POST /api/payment/webhook
// @access  Public (but verified)
exports.razorpayWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSignature || !webhookSecret) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook request'
      });
    }

    // Create expected signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      console.error('Webhook signature mismatch');
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log('Razorpay webhook event:', event);

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
        break;

      case 'order.paid':
        await handleOrderPaid(payload.order.entity);
        break;

      case 'refund.created':
        await handleRefundCreated(payload.refund.entity);
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    res.status(200).json({
      success: true,
      message: 'Webhook processed'
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
};

// Helper function to handle payment captured event
async function handlePaymentCaptured(payment) {
  try {
    const order = await Order.findOne({
      'paymentInfo.razorpayOrderId': payment.order_id
    });

    if (order && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentInfo.status = 'captured';
      order.orderStatus = 'Processing';
      order.statusHistory.push({
        status: 'Processing',
        note: 'Payment captured via webhook'
      });
      await order.save();
      console.log(`Order ${order._id} marked as paid`);
    }
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

// Helper function to handle payment failed event
async function handlePaymentFailed(payment) {
  try {
    const order = await Order.findOne({
      'paymentInfo.razorpayOrderId': payment.order_id
    });

    if (order) {
      order.orderStatus = 'Payment Failed';
      order.statusHistory.push({
        status: 'Payment Failed',
        note: `Payment failed: ${payment.error_description || 'Unknown error'}`
      });

      // Restore product stock since payment failed
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          product.sold -= item.quantity;
          await product.save();
        }
      }

      await order.save();
      console.log(`Order ${order._id} marked as payment failed`);
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

// Helper function to handle order paid event
async function handleOrderPaid(razorpayOrder) {
  try {
    const order = await Order.findOne({
      razorpayOrderId: razorpayOrder.id
    });

    if (order && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.orderStatus = 'Processing';
      order.statusHistory.push({
        status: 'Processing',
        note: 'Order paid via webhook'
      });
      await order.save();
      console.log(`Order ${order._id} marked as paid via order.paid event`);
    }
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}

// Helper function to handle refund created event
async function handleRefundCreated(refund) {
  try {
    const order = await Order.findOne({
      'paymentInfo.razorpayPaymentId': refund.payment_id
    });

    if (order) {
      order.isRefunded = true;
      order.refundedAt = Date.now();
      order.refundInfo = {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      };
      order.statusHistory.push({
        status: 'Refunded',
        note: `Refund initiated: ₹${refund.amount / 100}`
      });
      await order.save();
      console.log(`Order ${order._id} refund created`);
    }
  } catch (error) {
    console.error('Error handling refund created:', error);
  }
}

// @desc    Create refund
// @route   POST /api/payment/refund/:orderId
// @access  Private/Admin
exports.createRefund = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order is not paid yet'
      });
    }

    if (order.isRefunded) {
      return res.status(400).json({
        success: false,
        message: 'Order is already refunded'
      });
    }

    const { amount, notes } = req.body;
    const refundAmount = amount || order.totalPrice;

    // Create refund in Razorpay
    const refund = await razorpay.payments.refund(
      order.paymentInfo.razorpayPaymentId,
      {
        amount: Math.round(refundAmount * 100), // Amount in paise
        notes: notes || { reason: 'Refund requested by admin' }
      }
    );

    // Update order
    order.isRefunded = true;
    order.refundedAt = Date.now();
    order.refundInfo = {
      refundId: refund.id,
      amount: refundAmount,
      status: refund.status
    };
    order.orderStatus = 'Refunded';
    order.statusHistory.push({
      status: 'Refunded',
      note: `Refund of ₹${refundAmount} initiated`
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Refund created successfully',
      refund,
      order
    });
  } catch (error) {
    console.error('Refund creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create refund',
      error: error.message
    });
  }
};
