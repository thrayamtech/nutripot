const BOM = require('../../models/billing/BOM');
const Product = require('../../models/Product');
const RawMaterial = require('../../models/billing/RawMaterial');
const ProductionOrder = require('../../models/billing/ProductionOrder');

// @desc    Get all BOMs
// @route   GET /api/billing/bom
// @access  Private/Admin
exports.getBOMs = async (req, res) => {
  try {
    const { search, product, isActive, page = 1, limit = 50 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { bomCode: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    if (product) query.product = product;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (page - 1) * limit;
    const boms = await BOM.find(query)
      .populate('product', 'name price stock')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BOM.countDocuments(query);

    res.status(200).json({
      success: true,
      count: boms.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      boms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single BOM
// @route   GET /api/billing/bom/:id
// @access  Private/Admin
exports.getBOM = async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id)
      .populate('product', 'name price stock images')
      .populate('items.rawMaterial', 'name code unit currentStock costPrice')
      .populate('createdBy', 'name');

    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'BOM not found'
      });
    }

    res.status(200).json({
      success: true,
      bom
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get BOM by product
// @route   GET /api/billing/bom/product/:productId
// @access  Private/Admin
exports.getBOMByProduct = async (req, res) => {
  try {
    const bom = await BOM.findOne({
      product: req.params.productId,
      isActive: true
    })
      .populate('product', 'name price stock')
      .populate('items.rawMaterial', 'name code unit currentStock costPrice');

    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'No active BOM found for this product'
      });
    }

    res.status(200).json({
      success: true,
      bom
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create BOM
// @route   POST /api/billing/bom
// @access  Private/Admin
exports.createBOM = async (req, res) => {
  try {
    const { product, items, name } = req.body;

    // Validate product
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Validate and enrich items with raw material details
    for (let item of items) {
      const rawMaterial = await RawMaterial.findById(item.rawMaterial);
      if (!rawMaterial) {
        return res.status(404).json({
          success: false,
          message: `Raw material not found: ${item.rawMaterial}`
        });
      }

      item.name = rawMaterial.name;
      item.code = rawMaterial.code;
      item.unit = rawMaterial.unit;
      item.costPerUnit = rawMaterial.costPrice;
    }

    // Deactivate any existing active BOM for this product
    await BOM.updateMany(
      { product, isActive: true },
      { isActive: false }
    );

    const bom = await BOM.create({
      ...req.body,
      name: name || `BOM for ${productDoc.name}`,
      items,
      createdBy: req.user._id
    });

    const populatedBOM = await BOM.findById(bom._id)
      .populate('product', 'name price')
      .populate('items.rawMaterial', 'name code unit costPrice');

    res.status(201).json({
      success: true,
      message: 'BOM created successfully',
      bom: populatedBOM
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update BOM
// @route   PUT /api/billing/bom/:id
// @access  Private/Admin
exports.updateBOM = async (req, res) => {
  try {
    let bom = await BOM.findById(req.params.id);

    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'BOM not found'
      });
    }

    // Check if BOM is used in any production
    const productionCount = await ProductionOrder.countDocuments({
      bom: req.params.id,
      status: { $in: ['In Progress', 'Completed'] }
    });

    if (productionCount > 0 && req.body.items) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify items of a BOM that has been used in production. Create a new version instead.'
      });
    }

    // If items are being updated, enrich with raw material details
    if (req.body.items) {
      for (let item of req.body.items) {
        const rawMaterial = await RawMaterial.findById(item.rawMaterial);
        if (rawMaterial) {
          item.name = rawMaterial.name;
          item.code = rawMaterial.code;
          item.unit = rawMaterial.unit;
          item.costPerUnit = rawMaterial.costPrice;
        }
      }
    }

    bom = await BOM.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('product', 'name price')
      .populate('items.rawMaterial', 'name code unit costPrice');

    res.status(200).json({
      success: true,
      message: 'BOM updated successfully',
      bom
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Duplicate BOM (create new version)
// @route   POST /api/billing/bom/:id/duplicate
// @access  Private/Admin
exports.duplicateBOM = async (req, res) => {
  try {
    const originalBOM = await BOM.findById(req.params.id);

    if (!originalBOM) {
      return res.status(404).json({
        success: false,
        message: 'BOM not found'
      });
    }

    // Deactivate original
    originalBOM.isActive = false;
    await originalBOM.save();

    // Create new version
    const newBOM = await BOM.create({
      product: originalBOM.product,
      name: originalBOM.name,
      version: originalBOM.version + 1,
      items: originalBOM.items,
      laborCost: originalBOM.laborCost,
      overheadCost: originalBOM.overheadCost,
      outputQuantity: originalBOM.outputQuantity,
      unit: originalBOM.unit,
      notes: req.body.notes || originalBOM.notes,
      isActive: true,
      createdBy: req.user._id
    });

    const populatedBOM = await BOM.findById(newBOM._id)
      .populate('product', 'name price')
      .populate('items.rawMaterial', 'name code unit costPrice');

    res.status(201).json({
      success: true,
      message: 'BOM duplicated successfully',
      bom: populatedBOM
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete BOM
// @route   DELETE /api/billing/bom/:id
// @access  Private/Admin
exports.deleteBOM = async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id);

    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'BOM not found'
      });
    }

    // Check if BOM is used in any production
    const productionCount = await ProductionOrder.countDocuments({ bom: req.params.id });
    if (productionCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete BOM used in ${productionCount} production orders. Consider deactivating instead.`
      });
    }

    await bom.deleteOne();

    res.status(200).json({
      success: true,
      message: 'BOM deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Calculate material availability for BOM
// @route   GET /api/billing/bom/:id/availability
// @access  Private/Admin
exports.checkAvailability = async (req, res) => {
  try {
    const { quantity = 1 } = req.query;

    const bom = await BOM.findById(req.params.id)
      .populate('items.rawMaterial', 'name code unit currentStock minimumStock');

    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'BOM not found'
      });
    }

    const availability = [];
    let canProduce = true;
    let maxProducible = Infinity;

    for (const item of bom.items) {
      const requiredQty = item.effectiveQuantity * quantity;
      const availableQty = item.rawMaterial.currentStock;
      const shortfall = requiredQty - availableQty;
      const possibleUnits = Math.floor(availableQty / item.effectiveQuantity);

      if (shortfall > 0) {
        canProduce = false;
      }

      maxProducible = Math.min(maxProducible, possibleUnits);

      availability.push({
        rawMaterial: {
          _id: item.rawMaterial._id,
          name: item.rawMaterial.name,
          code: item.rawMaterial.code,
          unit: item.rawMaterial.unit
        },
        requiredQuantity: requiredQty,
        availableQuantity: availableQty,
        shortfall: shortfall > 0 ? shortfall : 0,
        isAvailable: shortfall <= 0
      });
    }

    res.status(200).json({
      success: true,
      requestedQuantity: parseInt(quantity),
      canProduce,
      maxProducible: maxProducible === Infinity ? 0 : maxProducible,
      materials: availability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
