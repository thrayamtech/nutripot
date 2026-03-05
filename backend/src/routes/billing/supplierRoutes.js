const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierLedger
} = require('../../controllers/billing/supplierController');
const { protect, authorize } = require('../../middleware/auth');

router.get('/', protect, authorize('admin'), getSuppliers);
router.get('/:id', protect, authorize('admin'), getSupplier);
router.get('/:id/ledger', protect, authorize('admin'), getSupplierLedger);
router.post('/', protect, authorize('admin'), createSupplier);
router.put('/:id', protect, authorize('admin'), updateSupplier);
router.delete('/:id', protect, authorize('admin'), deleteSupplier);

module.exports = router;
