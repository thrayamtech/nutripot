const RawMaterial = require('../../models/billing/RawMaterial');
const RawMaterialCategory = require('../../models/billing/RawMaterialCategory');
const StockLedger = require('../../models/billing/StockLedger');

// ==================== RAW MATERIAL CATEGORIES ====================

// @desc    Get all raw material categories
// @route   GET /api/billing/raw-material-categories
// @access  Private/Admin
exports.getCategories = async (req, res) => {
  try {
    const categories = await RawMaterialCategory.find({ isActive: true }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create raw material category
// @route   POST /api/billing/raw-material-categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const existingCategory = await RawMaterialCategory.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = await RawMaterialCategory.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update raw material category
// @route   PUT /api/billing/raw-material-categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    let category = await RawMaterialCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    category = await RawMaterialCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete raw material category
// @route   DELETE /api/billing/raw-material-categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await RawMaterialCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const materialsCount = await RawMaterial.countDocuments({ category: req.params.id });
    if (materialsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${materialsCount} associated raw materials`
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== RAW MATERIALS ====================

// @desc    Get all raw materials
// @route   GET /api/billing/raw-materials
// @access  Private/Admin
exports.getRawMaterials = async (req, res) => {
  try {
    const { search, category, isActive, lowStock, page = 1, limit = 50 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$currentStock', '$minimumStock'] };
    }

    const skip = (page - 1) * limit;
    const rawMaterials = await RawMaterial.find(query)
      .populate('category', 'name')
      .populate('defaultSupplier', 'name code')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await RawMaterial.countDocuments(query);

    res.status(200).json({
      success: true,
      count: rawMaterials.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      rawMaterials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single raw material
// @route   GET /api/billing/raw-materials/:id
// @access  Private/Admin
exports.getRawMaterial = async (req, res) => {
  try {
    const rawMaterial = await RawMaterial.findById(req.params.id)
      .populate('category', 'name')
      .populate('defaultSupplier', 'name code phone');

    if (!rawMaterial) {
      return res.status(404).json({
        success: false,
        message: 'Raw material not found'
      });
    }

    res.status(200).json({
      success: true,
      rawMaterial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create raw material
// @route   POST /api/billing/raw-materials
// @access  Private/Admin
exports.createRawMaterial = async (req, res) => {
  try {
    const { code } = req.body;

    const existingMaterial = await RawMaterial.findOne({ code: code.toUpperCase() });
    if (existingMaterial) {
      return res.status(400).json({
        success: false,
        message: 'Raw material with this code already exists'
      });
    }

    const rawMaterial = await RawMaterial.create({
      ...req.body,
      code: code.toUpperCase()
    });

    // Create opening stock entry if stock > 0
    if (rawMaterial.currentStock > 0) {
      await StockLedger.create({
        transactionType: 'Opening Stock',
        referenceNumber: `OPEN-${rawMaterial.code}`,
        referenceId: rawMaterial._id,
        rawMaterial: rawMaterial._id,
        itemType: 'RawMaterial',
        itemName: rawMaterial.name,
        itemCode: rawMaterial.code,
        unit: rawMaterial.unit,
        inQuantity: rawMaterial.currentStock,
        balanceQuantity: rawMaterial.currentStock,
        rate: rawMaterial.costPrice,
        remarks: 'Opening stock entry',
        createdBy: req.user._id
      });
    }

    const populatedMaterial = await RawMaterial.findById(rawMaterial._id)
      .populate('category', 'name')
      .populate('defaultSupplier', 'name code');

    res.status(201).json({
      success: true,
      message: 'Raw material created successfully',
      rawMaterial: populatedMaterial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update raw material
// @route   PUT /api/billing/raw-materials/:id
// @access  Private/Admin
exports.updateRawMaterial = async (req, res) => {
  try {
    let rawMaterial = await RawMaterial.findById(req.params.id);

    if (!rawMaterial) {
      return res.status(404).json({
        success: false,
        message: 'Raw material not found'
      });
    }

    // If code is being changed, check if new code exists
    if (req.body.code && req.body.code.toUpperCase() !== rawMaterial.code) {
      const existingMaterial = await RawMaterial.findOne({ code: req.body.code.toUpperCase() });
      if (existingMaterial) {
        return res.status(400).json({
          success: false,
          message: 'Raw material with this code already exists'
        });
      }
    }

    // Don't allow direct stock update - use adjustStock instead
    delete req.body.currentStock;

    rawMaterial = await RawMaterial.findByIdAndUpdate(
      req.params.id,
      { ...req.body, code: req.body.code ? req.body.code.toUpperCase() : rawMaterial.code },
      { new: true, runValidators: true }
    ).populate('category', 'name').populate('defaultSupplier', 'name code');

    res.status(200).json({
      success: true,
      message: 'Raw material updated successfully',
      rawMaterial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete raw material
// @route   DELETE /api/billing/raw-materials/:id
// @access  Private/Admin
exports.deleteRawMaterial = async (req, res) => {
  try {
    const rawMaterial = await RawMaterial.findById(req.params.id);

    if (!rawMaterial) {
      return res.status(404).json({
        success: false,
        message: 'Raw material not found'
      });
    }

    // Check for transactions
    const ledgerCount = await StockLedger.countDocuments({ rawMaterial: req.params.id });
    if (ledgerCount > 1) { // More than just opening stock
      return res.status(400).json({
        success: false,
        message: 'Cannot delete raw material with stock transactions. Consider deactivating instead.'
      });
    }

    await StockLedger.deleteMany({ rawMaterial: req.params.id });
    await rawMaterial.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Raw material deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get low stock items
// @route   GET /api/billing/raw-materials/low-stock
// @access  Private/Admin
exports.getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await RawMaterial.find({
      isActive: true,
      $expr: { $lte: ['$currentStock', '$minimumStock'] }
    })
      .populate('category', 'name')
      .populate('defaultSupplier', 'name code phone')
      .sort({ currentStock: 1 });

    res.status(200).json({
      success: true,
      count: lowStockItems.length,
      rawMaterials: lowStockItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Adjust stock
// @route   PUT /api/billing/raw-materials/:id/adjust-stock
// @access  Private/Admin
exports.adjustStock = async (req, res) => {
  try {
    const { adjustmentQuantity, reason } = req.body;

    if (!adjustmentQuantity || adjustmentQuantity === 0) {
      return res.status(400).json({
        success: false,
        message: 'Adjustment quantity is required and cannot be zero'
      });
    }

    const rawMaterial = await RawMaterial.findById(req.params.id);
    if (!rawMaterial) {
      return res.status(404).json({
        success: false,
        message: 'Raw material not found'
      });
    }

    const newStock = rawMaterial.currentStock + adjustmentQuantity;
    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot go below zero'
      });
    }

    rawMaterial.currentStock = newStock;
    await rawMaterial.save();

    // Create stock ledger entry
    await StockLedger.create({
      transactionType: 'Stock Adjustment',
      referenceNumber: `ADJ-${Date.now()}`,
      referenceId: rawMaterial._id,
      rawMaterial: rawMaterial._id,
      itemType: 'RawMaterial',
      itemName: rawMaterial.name,
      itemCode: rawMaterial.code,
      unit: rawMaterial.unit,
      inQuantity: adjustmentQuantity > 0 ? adjustmentQuantity : 0,
      outQuantity: adjustmentQuantity < 0 ? Math.abs(adjustmentQuantity) : 0,
      balanceQuantity: newStock,
      rate: rawMaterial.costPrice,
      remarks: reason || 'Stock adjustment',
      createdBy: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Stock adjusted successfully',
      rawMaterial: {
        ...rawMaterial.toObject(),
        currentStock: newStock
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get stock ledger for a raw material
// @route   GET /api/billing/raw-materials/:id/ledger
// @access  Private/Admin
exports.getStockLedger = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 50 } = req.query;

    const rawMaterial = await RawMaterial.findById(req.params.id);
    if (!rawMaterial) {
      return res.status(404).json({
        success: false,
        message: 'Raw material not found'
      });
    }

    const query = { rawMaterial: req.params.id };
    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) query.transactionDate.$gte = new Date(startDate);
      if (endDate) query.transactionDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const ledger = await StockLedger.find(query)
      .sort({ transactionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StockLedger.countDocuments(query);

    res.status(200).json({
      success: true,
      rawMaterial: {
        name: rawMaterial.name,
        code: rawMaterial.code,
        currentStock: rawMaterial.currentStock,
        unit: rawMaterial.unit
      },
      count: ledger.length,
      total,
      pages: Math.ceil(total / limit),
      ledger
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
