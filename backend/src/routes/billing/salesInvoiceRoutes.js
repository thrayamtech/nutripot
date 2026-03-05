const express = require('express');
const router = express.Router();
const {
  getSalesInvoices,
  getSalesInvoice,
  createSalesInvoice,
  updateSalesInvoice,
  confirmSalesInvoice,
  recordPayment,
  deleteSalesInvoice,
  getInvoiceForPrint
} = require('../../controllers/billing/salesInvoiceController');
const { protect, authorize } = require('../../middleware/auth');

router.get('/', protect, authorize('admin'), getSalesInvoices);
router.get('/:id', protect, authorize('admin'), getSalesInvoice);
router.get('/:id/print', protect, authorize('admin'), getInvoiceForPrint);
router.post('/', protect, authorize('admin'), createSalesInvoice);
router.put('/:id', protect, authorize('admin'), updateSalesInvoice);
router.put('/:id/confirm', protect, authorize('admin'), confirmSalesInvoice);
router.put('/:id/payment', protect, authorize('admin'), recordPayment);
router.delete('/:id', protect, authorize('admin'), deleteSalesInvoice);

module.exports = router;
