const Supplier = require('../../models/billing/Supplier');
const PurchaseInvoice = require('../../models/billing/PurchaseInvoice');

// @desc    Get all suppliers
// @route   GET /api/billing/suppliers
// @access  Private/Admin
exports.getSuppliers = async (req, res) => {
  try {
    const { search, isActive, page = 1, limit = 50 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;
    const suppliers = await Supplier.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Supplier.countDocuments(query);

    res.status(200).json({
      success: true,
      count: suppliers.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      suppliers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single supplier
// @route   GET /api/billing/suppliers/:id
// @access  Private/Admin
exports.getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.status(200).json({
      success: true,
      supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create supplier
// @route   POST /api/billing/suppliers
// @access  Private/Admin
exports.createSupplier = async (req, res) => {
  try {
    const { code, name } = req.body;

    // Check if code already exists
    const existingSupplier = await Supplier.findOne({ code: code.toUpperCase() });
    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier with this code already exists'
      });
    }

    const supplier = await Supplier.create({
      ...req.body,
      code: code.toUpperCase(),
      currentBalance: req.body.openingBalance || 0
    });

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update supplier
// @route   PUT /api/billing/suppliers/:id
// @access  Private/Admin
exports.updateSupplier = async (req, res) => {
  try {
    let supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // If code is being changed, check if new code exists
    if (req.body.code && req.body.code.toUpperCase() !== supplier.code) {
      const existingSupplier = await Supplier.findOne({ code: req.body.code.toUpperCase() });
      if (existingSupplier) {
        return res.status(400).json({
          success: false,
          message: 'Supplier with this code already exists'
        });
      }
    }

    supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { ...req.body, code: req.body.code ? req.body.code.toUpperCase() : supplier.code },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete supplier
// @route   DELETE /api/billing/suppliers/:id
// @access  Private/Admin
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Check if supplier has invoices
    const invoicesCount = await PurchaseInvoice.countDocuments({ supplier: req.params.id });
    if (invoicesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete supplier with ${invoicesCount} associated invoices. Consider deactivating instead.`
      });
    }

    await supplier.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get supplier ledger
// @route   GET /api/billing/suppliers/:id/ledger
// @access  Private/Admin
exports.getSupplierLedger = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    const query = { supplier: req.params.id, status: 'Confirmed' };
    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) query.invoiceDate.$gte = new Date(startDate);
      if (endDate) query.invoiceDate.$lte = new Date(endDate);
    }

    const invoices = await PurchaseInvoice.find(query)
      .select('invoiceNumber invoiceDate totalAmount paidAmount balanceAmount paymentStatus')
      .sort({ invoiceDate: -1 });

    res.status(200).json({
      success: true,
      supplier: {
        name: supplier.name,
        code: supplier.code,
        currentBalance: supplier.currentBalance
      },
      invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
