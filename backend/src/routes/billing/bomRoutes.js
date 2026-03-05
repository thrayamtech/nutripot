const express = require('express');
const router = express.Router();
const {
  getBOMs,
  getBOM,
  getBOMByProduct,
  createBOM,
  updateBOM,
  duplicateBOM,
  deleteBOM,
  checkAvailability
} = require('../../controllers/billing/bomController');
const { protect, authorize } = require('../../middleware/auth');

router.get('/', protect, authorize('admin'), getBOMs);
router.get('/:id', protect, authorize('admin'), getBOM);
router.get('/product/:productId', protect, authorize('admin'), getBOMByProduct);
router.get('/:id/availability', protect, authorize('admin'), checkAvailability);
router.post('/', protect, authorize('admin'), createBOM);
router.post('/:id/duplicate', protect, authorize('admin'), duplicateBOM);
router.put('/:id', protect, authorize('admin'), updateBOM);
router.delete('/:id', protect, authorize('admin'), deleteBOM);

module.exports = router;
