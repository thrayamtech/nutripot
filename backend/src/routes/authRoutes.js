const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleWishlist,
  checkMobile,
  loginWithOTP,
  registerWithOTP
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/check-mobile', checkMobile);
router.post('/login-otp', loginWithOTP);
router.post('/register-otp', registerWithOTP);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.post('/address', protect, addAddress);
router.put('/address/:addressId', protect, updateAddress);
router.delete('/address/:addressId', protect, deleteAddress);
router.post('/wishlist/:productId', protect, toggleWishlist);

module.exports = router;
