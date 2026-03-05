const express = require('express');
const router = express.Router();
const {
  getGRNs,
  getGRN,
  createGRN,
  confirmGRN,
  deleteGRN
} = require('../../controllers/billing/grnController');
const { protect, authorize } = require('../../middleware/auth');

router.get('/', protect, authorize('admin'), getGRNs);
router.get('/:id', protect, authorize('admin'), getGRN);
router.post('/', protect, authorize('admin'), createGRN);
router.put('/:id/confirm', protect, authorize('admin'), confirmGRN);
router.delete('/:id', protect, authorize('admin'), deleteGRN);

module.exports = router;
