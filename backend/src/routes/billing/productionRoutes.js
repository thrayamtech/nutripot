const express = require('express');
const router = express.Router();
const {
  getProductionOrders,
  getProductionOrder,
  createProductionOrder,
  startProduction,
  recordConsumption,
  completeProduction,
  cancelProduction,
  deleteProductionOrder
} = require('../../controllers/billing/productionController');
const { protect, authorize } = require('../../middleware/auth');

router.get('/', protect, authorize('admin'), getProductionOrders);
router.get('/:id', protect, authorize('admin'), getProductionOrder);
router.post('/', protect, authorize('admin'), createProductionOrder);
router.put('/:id/start', protect, authorize('admin'), startProduction);
router.put('/:id/consumption', protect, authorize('admin'), recordConsumption);
router.put('/:id/complete', protect, authorize('admin'), completeProduction);
router.put('/:id/cancel', protect, authorize('admin'), cancelProduction);
router.delete('/:id', protect, authorize('admin'), deleteProductionOrder);

module.exports = router;
