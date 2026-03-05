const express = require('express');
const router = express.Router();
const {
  getRawMaterialStockReport,
  getFinishedGoodsStockReport,
  getPurchaseRegister,
  getSalesRegister,
  getGSTSummary,
  getGSTR1Report,
  getGSTR2Report,
  getProfitLossReport,
  getSupplierOutstanding,
  getCustomerOutstanding,
  getStockLedgerReport
} = require('../../controllers/billing/reportController');
const { protect, authorize } = require('../../middleware/auth');

// Stock Reports
router.get('/stock/raw-materials', protect, authorize('admin'), getRawMaterialStockReport);
router.get('/stock/finished-goods', protect, authorize('admin'), getFinishedGoodsStockReport);
router.get('/stock/ledger', protect, authorize('admin'), getStockLedgerReport);

// Transaction Registers
router.get('/purchase-register', protect, authorize('admin'), getPurchaseRegister);
router.get('/sales-register', protect, authorize('admin'), getSalesRegister);

// GST Reports
router.get('/gst/summary', protect, authorize('admin'), getGSTSummary);
router.get('/gst/gstr1', protect, authorize('admin'), getGSTR1Report);
router.get('/gst/gstr2', protect, authorize('admin'), getGSTR2Report);

// Financial Reports
router.get('/profit-loss', protect, authorize('admin'), getProfitLossReport);
router.get('/supplier-outstanding', protect, authorize('admin'), getSupplierOutstanding);
router.get('/customer-outstanding', protect, authorize('admin'), getCustomerOutstanding);

module.exports = router;
