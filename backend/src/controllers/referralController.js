const Referral = require('../models/Referral');
const User = require('../models/User');
const LoyaltySettings = require('../models/LoyaltySettings');

// @desc    Add friend referral by name and WhatsApp
// @route   POST /api/referral/add-friend
// @access  Private
exports.addFriend = async (req, res) => {
  try {
    const { name, whatsapp, notes } = req.body;

    // Validate input
    if (!name || !whatsapp) {
      return res.status(400).json({
        success: false,
        message: 'Friend name and WhatsApp number are required'
      });
    }

    // Validate WhatsApp format (10 digits)
    const whatsappRegex = /^[0-9]{10}$/;
    if (!whatsappRegex.test(whatsapp)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit WhatsApp number'
      });
    }

    // Check if user is trying to refer their own number
    const currentUser = await User.findById(req.user._id);
    if (currentUser.phone === whatsapp) {
      return res.status(400).json({
        success: false,
        message: 'You cannot refer your own phone number'
      });
    }

    // Check if this friend already referred by this user
    const existingReferral = await Referral.findOne({
      referrer: req.user._id,
      refereeWhatsApp: whatsapp
    });

    if (existingReferral) {
      return res.status(400).json({
        success: false,
        message: 'You have already referred this friend'
      });
    }

    // Check if friend already registered
    const registeredFriend = await User.findOne({ phone: whatsapp });

    // Create referral
    const referral = await Referral.create({
      referrer: req.user._id,
      refereeName: name,
      refereeWhatsApp: whatsapp,
      referee: registeredFriend ? registeredFriend._id : null,
      status: registeredFriend ? 'registered' : 'pending',
      registeredAt: registeredFriend ? new Date() : null,
      notes: notes || ''
    });

    // If friend already registered, link them
    if (registeredFriend && !registeredFriend.referredBy) {
      registeredFriend.referredBy = req.user._id;
      await registeredFriend.save();
    }

    res.status(201).json({
      success: true,
      message: 'Friend added successfully',
      referral: {
        id: referral._id,
        name: referral.refereeName,
        whatsapp: referral.refereeWhatsApp,
        status: referral.status,
        createdAt: referral.createdAt
      }
    });
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add friend',
      error: error.message
    });
  }
};

// @desc    Get user's referrals with rewards breakdown
// @route   GET /api/referral/my-referrals
// @access  Private
exports.getMyReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({ referrer: req.user._id })
      .populate('referee', 'name email phone')
      .sort({ createdAt: -1 });

    const referralList = referrals.map(r => ({
      id: r._id,
      friendName: r.refereeName,
      whatsapp: r.refereeWhatsApp,
      status: r.status,
      registeredUser: r.referee,
      totalRewardEarned: r.totalRewardEarned,
      purchaseCount: r.purchases.length,
      purchases: r.purchases.map(p => ({
        orderId: p.orderId,
        orderAmount: p.orderAmount,
        rewardAmount: p.rewardAmount,
        rewardedAt: p.rewardedAt
      })),
      createdAt: r.createdAt,
      registeredAt: r.registeredAt,
      activatedAt: r.activatedAt,
      notes: r.notes
    }));

    const stats = {
      totalReferrals: referrals.length,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
      registeredReferrals: referrals.filter(r => r.status === 'registered').length,
      activeReferrals: referrals.filter(r => r.status === 'active' || r.status === 'completed').length,
      totalRewardsEarned: referrals.reduce((sum, r) => sum + r.totalRewardEarned, 0)
    };

    res.status(200).json({
      success: true,
      stats,
      referrals: referralList
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referrals',
      error: error.message
    });
  }
};

// @desc    Check if phone number has pending referral
// @route   POST /api/referral/check-phone
// @access  Public
exports.checkPhoneReferral = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const referral = await Referral.findOne({
      refereeWhatsApp: phone,
      status: 'pending'
    }).populate('referrer', 'name');

    if (referral) {
      return res.status(200).json({
        success: true,
        hasReferral: true,
        referral: {
          referrerName: referral.referrer.name,
          friendName: referral.refereeName
        }
      });
    }

    res.status(200).json({
      success: true,
      hasReferral: false
    });
  } catch (error) {
    console.error('Check phone referral error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check phone referral',
      error: error.message
    });
  }
};

// @desc    Link user to referral on registration
// @route   POST /api/referral/link-user
// @access  Private
exports.linkUserToReferral = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Check if user already has a referrer
    if (user.referredBy) {
      return res.status(400).json({
        success: false,
        message: 'User already linked to a referrer'
      });
    }

    // Find pending referral for this phone number
    const referral = await Referral.findOne({
      refereeWhatsApp: user.phone,
      status: 'pending'
    }).populate('referrer', 'name');

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'No pending referral found for this phone number'
      });
    }

    // Link user to referral
    referral.referee = user._id;
    referral.status = 'registered';
    referral.registeredAt = new Date();
    await referral.save();

    // Update user's referredBy field
    user.referredBy = referral.referrer._id;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Successfully linked to referrer',
      referrer: {
        name: referral.referrer.name
      }
    });
  } catch (error) {
    console.error('Link user to referral error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to link user to referral',
      error: error.message
    });
  }
};

// @desc    Delete a pending referral
// @route   DELETE /api/referral/:id
// @access  Private
exports.deleteReferral = async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id);

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    // Check if user owns this referral
    if (referral.referrer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this referral'
      });
    }

    // Only allow deletion of pending referrals
    if (referral.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only delete pending referrals'
      });
    }

    await referral.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Referral deleted successfully'
    });
  } catch (error) {
    console.error('Delete referral error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete referral',
      error: error.message
    });
  }
};

// @desc    Get all referrals (Admin)
// @route   GET /api/referral/admin/all
// @access  Private/Admin
exports.getAllReferrals = async (req, res) => {
  try {
    const { status, search } = req.query;

    // Build query
    let query = {};
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { refereeName: { $regex: search, $options: 'i' } },
        { refereeWhatsApp: { $regex: search, $options: 'i' } }
      ];
    }

    const referrals = await Referral.find(query)
      .populate('referrer', 'name email phone')
      .populate('referee', 'name email phone')
      .sort({ createdAt: -1 });

    const referralList = referrals.map(r => ({
      id: r._id,
      referrer: {
        id: r.referrer._id,
        name: r.referrer.name,
        email: r.referrer.email,
        phone: r.referrer.phone
      },
      friendName: r.refereeName,
      friendWhatsApp: r.refereeWhatsApp,
      registeredUser: r.referee ? {
        id: r.referee._id,
        name: r.referee.name,
        email: r.referee.email,
        phone: r.referee.phone
      } : null,
      status: r.status,
      totalRewardEarned: r.totalRewardEarned,
      purchaseCount: r.purchases.length,
      purchases: r.purchases,
      createdAt: r.createdAt,
      registeredAt: r.registeredAt,
      activatedAt: r.activatedAt,
      notes: r.notes
    }));

    const stats = {
      total: referrals.length,
      pending: referrals.filter(r => r.status === 'pending').length,
      registered: referrals.filter(r => r.status === 'registered').length,
      active: referrals.filter(r => r.status === 'active').length,
      completed: referrals.filter(r => r.status === 'completed').length,
      totalRewardsDistributed: referrals.reduce((sum, r) => sum + r.totalRewardEarned, 0)
    };

    res.status(200).json({
      success: true,
      stats,
      referrals: referralList
    });
  } catch (error) {
    console.error('Get all referrals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referrals',
      error: error.message
    });
  }
};
