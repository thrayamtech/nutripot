const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  addFriend,
  getMyReferrals,
  checkPhoneReferral,
  linkUserToReferral,
  deleteReferral,
  getAllReferrals
} = require('../controllers/referralController');

// Public routes
router.post('/check-phone', checkPhoneReferral);

// Protected routes
router.use(protect);

router.post('/add-friend', addFriend);
router.get('/my-referrals', getMyReferrals);
router.post('/link-user', linkUserToReferral);
router.delete('/:id', deleteReferral);

// Admin routes
router.get('/admin/all', admin, getAllReferrals);

module.exports = router;
