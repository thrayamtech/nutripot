const express = require('express');
const router = express.Router();
const {
  // Categories
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  // Raw Materials
  getRawMaterials,
  getRawMaterial,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  getLowStockItems,
  adjustStock,
  getStockLedger
} = require('../../controllers/billing/rawMaterialController');
const { protect, authorize } = require('../../middleware/auth');

// Raw Material Categories
router.get('/categories', protect, authorize('admin'), getCategories);
router.post('/categories', protect, authorize('admin'), createCategory);
router.put('/categories/:id', protect, authorize('admin'), updateCategory);
router.delete('/categories/:id', protect, authorize('admin'), deleteCategory);

// Raw Materials
router.get('/', protect, authorize('admin'), getRawMaterials);
router.get('/low-stock', protect, authorize('admin'), getLowStockItems);
router.get('/:id', protect, authorize('admin'), getRawMaterial);
router.get('/:id/ledger', protect, authorize('admin'), getStockLedger);
router.post('/', protect, authorize('admin'), createRawMaterial);
router.put('/:id', protect, authorize('admin'), updateRawMaterial);
router.put('/:id/adjust-stock', protect, authorize('admin'), adjustStock);
router.delete('/:id', protect, authorize('admin'), deleteRawMaterial);

module.exports = router;
