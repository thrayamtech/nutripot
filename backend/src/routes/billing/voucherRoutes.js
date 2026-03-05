const express = require('express');
const router = express.Router();
const {
  getVouchers,
  getVoucher,
  createPaymentVoucher,
  createReceiptVoucher,
  createJournalVoucher,
  createExpenseVoucher,
  updateVoucher,
  deleteVoucher,
  getExpenseSummary
} = require('../../controllers/billing/voucherController');
const { protect, authorize } = require('../../middleware/auth');

router.get('/', protect, authorize('admin'), getVouchers);
router.get('/expense-summary', protect, authorize('admin'), getExpenseSummary);
router.get('/:id', protect, authorize('admin'), getVoucher);
router.post('/payment', protect, authorize('admin'), createPaymentVoucher);
router.post('/receipt', protect, authorize('admin'), createReceiptVoucher);
router.post('/journal', protect, authorize('admin'), createJournalVoucher);
router.post('/expense', protect, authorize('admin'), createExpenseVoucher);
router.put('/:id', protect, authorize('admin'), updateVoucher);
router.delete('/:id', protect, authorize('admin'), deleteVoucher);

module.exports = router;
