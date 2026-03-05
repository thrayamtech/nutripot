const express = require('express');
const router = express.Router();
const {
  // Purchase Orders
  getPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  updatePOStatus,
  deletePurchaseOrder,
  // Purchase Invoices
  getPurchaseInvoices,
  getPurchaseInvoice,
  createPurchaseInvoice,
  createFromPO,
  recordPayment,
  deletePurchaseInvoice
} = require('../../controllers/billing/purchaseController');
const { protect, authorize } = require('../../middleware/auth');

// Purchase Orders
router.get('/orders', protect, authorize('admin'), getPurchaseOrders);
router.get('/orders/:id', protect, authorize('admin'), getPurchaseOrder);
router.post('/orders', protect, authorize('admin'), createPurchaseOrder);
router.put('/orders/:id', protect, authorize('admin'), updatePurchaseOrder);
router.put('/orders/:id/status', protect, authorize('admin'), updatePOStatus);
router.delete('/orders/:id', protect, authorize('admin'), deletePurchaseOrder);

// Purchase Invoices
router.get('/invoices', protect, authorize('admin'), getPurchaseInvoices);
router.get('/invoices/:id', protect, authorize('admin'), getPurchaseInvoice);
router.post('/invoices', protect, authorize('admin'), createPurchaseInvoice);
router.post('/invoices/from-po/:poId', protect, authorize('admin'), createFromPO);
router.put('/invoices/:id/payment', protect, authorize('admin'), recordPayment);
router.delete('/invoices/:id', protect, authorize('admin'), deletePurchaseInvoice);

module.exports = router;
