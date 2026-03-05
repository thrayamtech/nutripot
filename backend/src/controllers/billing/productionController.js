const ProductionOrder = require('../../models/billing/ProductionOrder');
const BOM = require('../../models/billing/BOM');
const Product = require('../../models/Product');
const RawMaterial = require('../../models/billing/RawMaterial');
const StockLedger = require('../../models/billing/StockLedger');

// @desc    Get all production orders
// @route   GET /api/billing/production
// @access  Private/Admin
exports.getProductionOrders = async (req, res) => {
  try {
    const { search, product, status, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {};
    if (search) {
      query.productionNumber = { $regex: search, $options: 'i' };
    }
    if (product) query.product = product;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const productionOrders = await ProductionOrder.find(query)
      .populate('product', 'name price stock images')
      .populate('bom', 'bomCode name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ProductionOrder.countDocuments(query);

    res.status(200).json({
      success: true,
      count: productionOrders.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      productionOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single production order
// @route   GET /api/billing/production/:id
// @access  Private/Admin
exports.getProductionOrder = async (req, res) => {
  try {
    const productionOrder = await ProductionOrder.findById(req.params.id)
      .populate('product', 'name price stock images')
      .populate('bom')
      .populate('consumption.rawMaterial', 'name code unit currentStock')
      .populate('createdBy', 'name');

    if (!productionOrder) {
      return res.status(404).json({
        success: false,
        message: 'Production order not found'
      });
    }

    res.status(200).json({
      success: true,
      productionOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create production order
// @route   POST /api/billing/production
// @access  Private/Admin
exports.createProductionOrder = async (req, res) => {
  try {
    const { product, bom, plannedQuantity } = req.body;

    // Validate product
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Validate BOM
    const bomDoc = await BOM.findById(bom).populate('items.rawMaterial');
    if (!bomDoc) {
      return res.status(404).json({
        success: false,
        message: 'BOM not found'
      });
    }

    if (!bomDoc.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot use inactive BOM'
      });
    }

    // Prepare consumption list from BOM
    const consumption = bomDoc.items.map(item => ({
      rawMaterial: item.rawMaterial._id,
      name: item.rawMaterial.name,
      code: item.rawMaterial.code,
      plannedQuantity: item.effectiveQuantity * plannedQuantity,
      actualQuantity: 0,
      unit: item.unit,
      costPerUnit: item.costPerUnit
    }));

    const productionOrder = await ProductionOrder.create({
      product,
      productName: productDoc.name,
      bom,
      plannedQuantity,
      consumption,
      expectedCompletionDate: req.body.expectedCompletionDate,
      laborCost: req.body.laborCost || bomDoc.laborCost * plannedQuantity,
      overheadCost: req.body.overheadCost || bomDoc.overheadCost * plannedQuantity,
      notes: req.body.notes,
      createdBy: req.user._id
    });

    const populatedOrder = await ProductionOrder.findById(productionOrder._id)
      .populate('product', 'name price')
      .populate('bom', 'bomCode name')
      .populate('consumption.rawMaterial', 'name code unit currentStock');

    res.status(201).json({
      success: true,
      message: 'Production order created successfully',
      productionOrder: populatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Start production
// @route   PUT /api/billing/production/:id/start
// @access  Private/Admin
exports.startProduction = async (req, res) => {
  try {
    const productionOrder = await ProductionOrder.findById(req.params.id)
      .populate('consumption.rawMaterial');

    if (!productionOrder) {
      return res.status(404).json({
        success: false,
        message: 'Production order not found'
      });
    }

    if (productionOrder.status !== 'Draft' && productionOrder.status !== 'Planned') {
      return res.status(400).json({
        success: false,
        message: 'Production can only be started from Draft or Planned status'
      });
    }

    // Check raw material availability
    for (const item of productionOrder.consumption) {
      const rawMaterial = await RawMaterial.findById(item.rawMaterial);
      if (rawMaterial.currentStock < item.plannedQuantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}. Required: ${item.plannedQuantity}, Available: ${rawMaterial.currentStock}`
        });
      }
    }

    productionOrder.status = 'In Progress';
    productionOrder.startDate = new Date();
    await productionOrder.save();

    res.status(200).json({
      success: true,
      message: 'Production started successfully',
      productionOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Record material consumption
// @route   PUT /api/billing/production/:id/consumption
// @access  Private/Admin
exports.recordConsumption = async (req, res) => {
  try {
    const { consumption } = req.body;

    const productionOrder = await ProductionOrder.findById(req.params.id);
    if (!productionOrder) {
      return res.status(404).json({
        success: false,
        message: 'Production order not found'
      });
    }

    if (productionOrder.status !== 'In Progress') {
      return res.status(400).json({
        success: false,
        message: 'Consumption can only be recorded for in-progress production'
      });
    }

    if (productionOrder.materialsConsumed) {
      return res.status(400).json({
        success: false,
        message: 'Materials already consumed for this production'
      });
    }

    // Update consumption and deduct stock
    for (const item of consumption) {
      const rawMaterial = await RawMaterial.findById(item.rawMaterial);
      if (!rawMaterial) continue;

      if (rawMaterial.currentStock < item.actualQuantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${rawMaterial.name}. Available: ${rawMaterial.currentStock}`
        });
      }

      // Update production order consumption
      const consumptionItem = productionOrder.consumption.find(
        c => c.rawMaterial.toString() === item.rawMaterial
      );
      if (consumptionItem) {
        consumptionItem.actualQuantity = item.actualQuantity;
        consumptionItem.totalCost = item.actualQuantity * consumptionItem.costPerUnit;
      }

      // Deduct stock
      const newStock = rawMaterial.currentStock - item.actualQuantity;
      await RawMaterial.findByIdAndUpdate(item.rawMaterial, {
        currentStock: newStock
      });

      // Create stock ledger entry
      await StockLedger.create({
        transactionType: 'Production Consumption',
        referenceNumber: productionOrder.productionNumber,
        referenceId: productionOrder._id,
        rawMaterial: item.rawMaterial,
        itemType: 'RawMaterial',
        itemName: rawMaterial.name,
        itemCode: rawMaterial.code,
        unit: rawMaterial.unit,
        inQuantity: 0,
        outQuantity: item.actualQuantity,
        balanceQuantity: newStock,
        rate: consumptionItem ? consumptionItem.costPerUnit : rawMaterial.costPrice,
        remarks: `Consumed in production ${productionOrder.productionNumber}`,
        createdBy: req.user._id
      });
    }

    productionOrder.materialsConsumed = true;
    await productionOrder.save();

    res.status(200).json({
      success: true,
      message: 'Consumption recorded successfully',
      productionOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Complete production
// @route   PUT /api/billing/production/:id/complete
// @access  Private/Admin
exports.completeProduction = async (req, res) => {
  try {
    const { completedQuantity, rejectedQuantity = 0 } = req.body;

    const productionOrder = await ProductionOrder.findById(req.params.id);
    if (!productionOrder) {
      return res.status(404).json({
        success: false,
        message: 'Production order not found'
      });
    }

    if (productionOrder.status !== 'In Progress') {
      return res.status(400).json({
        success: false,
        message: 'Only in-progress production can be completed'
      });
    }

    if (!productionOrder.materialsConsumed) {
      return res.status(400).json({
        success: false,
        message: 'Please record material consumption before completing production'
      });
    }

    // Update product stock
    const product = await Product.findById(productionOrder.product);
    const newProductStock = product.stock + completedQuantity;

    await Product.findByIdAndUpdate(productionOrder.product, {
      stock: newProductStock
    });

    // Create stock ledger entry for finished goods
    await StockLedger.create({
      transactionType: 'Production Output',
      referenceNumber: productionOrder.productionNumber,
      referenceId: productionOrder._id,
      product: productionOrder.product,
      itemType: 'Product',
      itemName: productionOrder.productName,
      unit: 'pieces',
      inQuantity: completedQuantity,
      outQuantity: 0,
      balanceQuantity: newProductStock,
      rate: productionOrder.costPerUnit,
      remarks: `Produced from ${productionOrder.productionNumber}`,
      createdBy: req.user._id
    });

    // Update production order
    productionOrder.completedQuantity = completedQuantity;
    productionOrder.rejectedQuantity = rejectedQuantity;
    productionOrder.completionDate = new Date();
    productionOrder.finishedGoodsAdded = true;

    if (completedQuantity >= productionOrder.plannedQuantity) {
      productionOrder.status = 'Completed';
    } else {
      productionOrder.status = 'Partially Completed';
    }

    await productionOrder.save();

    res.status(200).json({
      success: true,
      message: 'Production completed successfully',
      productionOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel production
// @route   PUT /api/billing/production/:id/cancel
// @access  Private/Admin
exports.cancelProduction = async (req, res) => {
  try {
    const productionOrder = await ProductionOrder.findById(req.params.id);

    if (!productionOrder) {
      return res.status(404).json({
        success: false,
        message: 'Production order not found'
      });
    }

    if (productionOrder.materialsConsumed) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel production after materials have been consumed'
      });
    }

    productionOrder.status = 'Cancelled';
    productionOrder.notes = `${productionOrder.notes || ''}\nCancelled: ${req.body.reason || 'No reason provided'}`;
    await productionOrder.save();

    res.status(200).json({
      success: true,
      message: 'Production cancelled successfully',
      productionOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete production order
// @route   DELETE /api/billing/production/:id
// @access  Private/Admin
exports.deleteProductionOrder = async (req, res) => {
  try {
    const productionOrder = await ProductionOrder.findById(req.params.id);

    if (!productionOrder) {
      return res.status(404).json({
        success: false,
        message: 'Production order not found'
      });
    }

    if (productionOrder.status !== 'Draft' && productionOrder.status !== 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Only draft or cancelled production orders can be deleted'
      });
    }

    await productionOrder.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Production order deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
