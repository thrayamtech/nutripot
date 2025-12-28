const express = require('express');
const router = express.Router();
const siteSettingController = require('../controllers/siteSettingController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/public', siteSettingController.getPublicSettings);

// Admin routes
router.get('/', protect, admin, siteSettingController.getAllSettings);
router.get('/:key', protect, admin, siteSettingController.getSetting);
router.post('/', protect, admin, siteSettingController.updateSetting);
router.post('/bulk', protect, admin, siteSettingController.bulkUpdateSettings);
router.delete('/:key', protect, admin, siteSettingController.deleteSetting);

module.exports = router;
