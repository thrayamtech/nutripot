const express = require('express');
const router = express.Router();
const {
  getSalesReturns,
  getSalesReturn,
  createSalesReturn,
  confirmSalesReturn,
  processRefund,
  deleteSalesReturn
} = require('../../controllers/billing/salesReturnController');
const { protect, authorize } = require('../../middleware/auth');

router.get('/', protect, authorize('admin'), getSalesReturns);
router.get('/:id', protect, authorize('admin'), getSalesReturn);
router.post('/', protect, authorize('admin'), createSalesReturn);
router.put('/:id/confirm', protect, authorize('admin'), confirmSalesReturn);
router.put('/:id/refund', protect, authorize('admin'), processRefund);
router.delete('/:id', protect, authorize('admin'), deleteSalesReturn);

module.exports = router;
