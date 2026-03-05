const PurchaseOrder = require('../../models/billing/PurchaseOrder');
const PurchaseInvoice = require('../../models/billing/PurchaseInvoice');
const Supplier = require('../../models/billing/Supplier');
const RawMaterial = require('../../models/billing/RawMaterial');

// ==================== PURCHASE ORDERS ====================

// @desc    Get all purchase orders
// @route   GET /api/billing/purchase-orders
// @access  Private/Admin
exports.getPurchaseOrders = async (req, res) => {
  try {
    const { search, supplier, status, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {};
    if (search) {
      query.poNumber = { $regex: search, $options: 'i' };
    }
    if (supplier) query.supplier = supplier;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) query.orderDate.$gte = new Date(startDate);
      if (endDate) query.orderDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const purchaseOrders = await PurchaseOrder.find(query)
      .populate('supplier', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PurchaseOrder.countDocuments(query);

    res.status(200).json({
      success: true,
      count: purchaseOrders.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      purchaseOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single purchase order
// @route   GET /api/billing/purchase-orders/:id
// @access  Private/Admin
exports.getPurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate('supplier')
      .populate('items.rawMaterial', 'name code unit currentStock')
      .populate('createdBy', 'name');

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    res.status(200).json({
      success: true,
      purchaseOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create purchase order
// @route   POST /api/billing/purchase-orders
// @access  Private/Admin
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { supplier, items, isInterState } = req.body;

    // Validate supplier
    const supplierDoc = await Supplier.findById(supplier);
    if (!supplierDoc) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Calculate totals
    let subtotal = 0;
    let totalDiscount = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

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

      // Calculate item amount
      let itemAmount = item.quantity * item.rate;
      let discountAmount = 0;

      if (item.discount > 0) {
        if (item.discountType === 'percentage') {
          discountAmount = (itemAmount * item.discount) / 100;
        } else {
          discountAmount = item.discount;
        }
      }

      item.taxableAmount = itemAmount - discountAmount;
      totalDiscount += discountAmount;

      // Calculate GST
      const gstAmount = (item.taxableAmount * item.gstRate) / 100;
      if (isInterState) {
        item.igst = gstAmount;
        item.cgst = 0;
        item.sgst = 0;
        totalIGST += gstAmount;
      } else {
        item.cgst = gstAmount / 2;
        item.sgst = gstAmount / 2;
        item.igst = 0;
        totalCGST += gstAmount / 2;
        totalSGST += gstAmount / 2;
      }

      item.amount = item.taxableAmount + gstAmount;
      subtotal += item.taxableAmount;
    }

    const totalGst = totalCGST + totalSGST + totalIGST;
    const otherCharges = req.body.otherCharges || 0;
    const totalBeforeRound = subtotal + totalGst + otherCharges;
    const roundOff = Math.round(totalBeforeRound) - totalBeforeRound;
    const totalAmount = Math.round(totalBeforeRound);

    const purchaseOrder = await PurchaseOrder.create({
      ...req.body,
      items,
      subtotal,
      totalDiscount,
      cgst: totalCGST,
      sgst: totalSGST,
      igst: totalIGST,
      totalGst,
      roundOff,
      totalAmount,
      createdBy: req.user._id
    });

    const populatedPO = await PurchaseOrder.findById(purchaseOrder._id)
      .populate('supplier', 'name code')
      .populate('items.rawMaterial', 'name code');

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      purchaseOrder: populatedPO
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update purchase order
// @route   PUT /api/billing/purchase-orders/:id
// @access  Private/Admin
exports.updatePurchaseOrder = async (req, res) => {
  try {
    let purchaseOrder = await PurchaseOrder.findById(req.params.id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    if (purchaseOrder.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft purchase orders can be updated'
      });
    }

    // Recalculate if items are updated
    if (req.body.items) {
      const { items, isInterState } = req.body;
      let subtotal = 0;
      let totalDiscount = 0;
      let totalCGST = 0;
      let totalSGST = 0;
      let totalIGST = 0;

      for (let item of items) {
        const rawMaterial = await RawMaterial.findById(item.rawMaterial);
        if (rawMaterial) {
          item.name = rawMaterial.name;
          item.code = rawMaterial.code;
          item.unit = rawMaterial.unit;
        }

        let itemAmount = item.quantity * item.rate;
        let discountAmount = 0;

        if (item.discount > 0) {
          if (item.discountType === 'percentage') {
            discountAmount = (itemAmount * item.discount) / 100;
          } else {
            discountAmount = item.discount;
          }
        }

        item.taxableAmount = itemAmount - discountAmount;
        totalDiscount += discountAmount;

        const gstAmount = (item.taxableAmount * item.gstRate) / 100;
        if (isInterState || req.body.isInterState) {
          item.igst = gstAmount;
          item.cgst = 0;
          item.sgst = 0;
          totalIGST += gstAmount;
        } else {
          item.cgst = gstAmount / 2;
          item.sgst = gstAmount / 2;
          item.igst = 0;
          totalCGST += gstAmount / 2;
          totalSGST += gstAmount / 2;
        }

        item.amount = item.taxableAmount + gstAmount;
        subtotal += item.taxableAmount;
      }

      const totalGst = totalCGST + totalSGST + totalIGST;
      const otherCharges = req.body.otherCharges || purchaseOrder.otherCharges || 0;
      const totalBeforeRound = subtotal + totalGst + otherCharges;
      const roundOff = Math.round(totalBeforeRound) - totalBeforeRound;
      const totalAmount = Math.round(totalBeforeRound);

      req.body.subtotal = subtotal;
      req.body.totalDiscount = totalDiscount;
      req.body.cgst = totalCGST;
      req.body.sgst = totalSGST;
      req.body.igst = totalIGST;
      req.body.totalGst = totalGst;
      req.body.roundOff = roundOff;
      req.body.totalAmount = totalAmount;
    }

    purchaseOrder = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('supplier', 'name code');

    res.status(200).json({
      success: true,
      message: 'Purchase order updated successfully',
      purchaseOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update purchase order status
// @route   PUT /api/billing/purchase-orders/:id/status
// @access  Private/Admin
exports.updatePOStatus = async (req, res) => {
  try {
    const { status } = req.body;

    let purchaseOrder = await PurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    purchaseOrder.status = status;
    await purchaseOrder.save();

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      purchaseOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete purchase order
// @route   DELETE /api/billing/purchase-orders/:id
// @access  Private/Admin
exports.deletePurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    if (purchaseOrder.status !== 'Draft' && purchaseOrder.status !== 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Only draft or cancelled purchase orders can be deleted'
      });
    }

    // Check if any invoice is linked
    const invoiceCount = await PurchaseInvoice.countDocuments({ purchaseOrder: req.params.id });
    if (invoiceCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete purchase order with linked invoices'
      });
    }

    await purchaseOrder.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Purchase order deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== PURCHASE INVOICES ====================

// @desc    Get all purchase invoices
// @route   GET /api/billing/purchase-invoices
// @access  Private/Admin
exports.getPurchaseInvoices = async (req, res) => {
  try {
    const { search, supplier, status, paymentStatus, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { supplierInvoiceNumber: { $regex: search, $options: 'i' } }
      ];
    }
    if (supplier) query.supplier = supplier;
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) query.invoiceDate.$gte = new Date(startDate);
      if (endDate) query.invoiceDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const purchaseInvoices = await PurchaseInvoice.find(query)
      .populate('supplier', 'name code')
      .populate('purchaseOrder', 'poNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PurchaseInvoice.countDocuments(query);

    res.status(200).json({
      success: true,
      count: purchaseInvoices.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      purchaseInvoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single purchase invoice
// @route   GET /api/billing/purchase-invoices/:id
// @access  Private/Admin
exports.getPurchaseInvoice = async (req, res) => {
  try {
    const purchaseInvoice = await PurchaseInvoice.findById(req.params.id)
      .populate('supplier')
      .populate('purchaseOrder')
      .populate('items.rawMaterial', 'name code unit')
      .populate('createdBy', 'name');

    if (!purchaseInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Purchase invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      purchaseInvoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create purchase invoice
// @route   POST /api/billing/purchase-invoices
// @access  Private/Admin
exports.createPurchaseInvoice = async (req, res) => {
  try {
    const { supplier, items, isInterState } = req.body;

    // Validate supplier
    const supplierDoc = await Supplier.findById(supplier);
    if (!supplierDoc) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Calculate totals
    let subtotal = 0;
    let totalDiscount = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

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

      let itemAmount = item.quantity * item.rate;
      let discountAmount = 0;

      if (item.discount > 0) {
        if (item.discountType === 'percentage') {
          discountAmount = (itemAmount * item.discount) / 100;
        } else {
          discountAmount = item.discount;
        }
      }

      item.taxableAmount = itemAmount - discountAmount;
      totalDiscount += discountAmount;

      const gstAmount = (item.taxableAmount * item.gstRate) / 100;
      if (isInterState) {
        item.igst = gstAmount;
        item.cgst = 0;
        item.sgst = 0;
        totalIGST += gstAmount;
      } else {
        item.cgst = gstAmount / 2;
        item.sgst = gstAmount / 2;
        item.igst = 0;
        totalCGST += gstAmount / 2;
        totalSGST += gstAmount / 2;
      }

      item.amount = item.taxableAmount + gstAmount;
      subtotal += item.taxableAmount;
    }

    const totalGst = totalCGST + totalSGST + totalIGST;
    const otherCharges = req.body.otherCharges || 0;
    const totalBeforeRound = subtotal + totalGst + otherCharges;
    const roundOff = Math.round(totalBeforeRound) - totalBeforeRound;
    const totalAmount = Math.round(totalBeforeRound);

    const purchaseInvoice = await PurchaseInvoice.create({
      ...req.body,
      items,
      subtotal,
      totalDiscount,
      cgst: totalCGST,
      sgst: totalSGST,
      igst: totalIGST,
      totalGst,
      roundOff,
      totalAmount,
      balanceAmount: totalAmount,
      createdBy: req.user._id
    });

    // Update supplier balance
    await Supplier.findByIdAndUpdate(supplier, {
      $inc: { currentBalance: totalAmount }
    });

    const populatedInvoice = await PurchaseInvoice.findById(purchaseInvoice._id)
      .populate('supplier', 'name code')
      .populate('items.rawMaterial', 'name code');

    res.status(201).json({
      success: true,
      message: 'Purchase invoice created successfully',
      purchaseInvoice: populatedInvoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create purchase invoice from PO
// @route   POST /api/billing/purchase-invoices/from-po/:poId
// @access  Private/Admin
exports.createFromPO = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.poId)
      .populate('supplier')
      .populate('items.rawMaterial');

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    if (purchaseOrder.status === 'Cancelled' || purchaseOrder.status === 'Fully Received') {
      return res.status(400).json({
        success: false,
        message: 'Cannot create invoice from cancelled or fully received PO'
      });
    }

    const purchaseInvoice = await PurchaseInvoice.create({
      purchaseOrder: purchaseOrder._id,
      supplier: purchaseOrder.supplier._id,
      supplierInvoiceNumber: req.body.supplierInvoiceNumber,
      supplierInvoiceDate: req.body.supplierInvoiceDate,
      invoiceDate: req.body.invoiceDate || new Date(),
      dueDate: req.body.dueDate,
      items: purchaseOrder.items,
      subtotal: purchaseOrder.subtotal,
      totalDiscount: purchaseOrder.totalDiscount,
      cgst: purchaseOrder.cgst,
      sgst: purchaseOrder.sgst,
      igst: purchaseOrder.igst,
      totalGst: purchaseOrder.totalGst,
      otherCharges: purchaseOrder.otherCharges,
      roundOff: purchaseOrder.roundOff,
      totalAmount: purchaseOrder.totalAmount,
      isInterState: purchaseOrder.isInterState,
      balanceAmount: purchaseOrder.totalAmount,
      notes: req.body.notes,
      createdBy: req.user._id
    });

    // Update supplier balance
    await Supplier.findByIdAndUpdate(purchaseOrder.supplier._id, {
      $inc: { currentBalance: purchaseOrder.totalAmount }
    });

    // Update PO status
    purchaseOrder.status = 'Sent';
    await purchaseOrder.save();

    const populatedInvoice = await PurchaseInvoice.findById(purchaseInvoice._id)
      .populate('supplier', 'name code')
      .populate('purchaseOrder', 'poNumber');

    res.status(201).json({
      success: true,
      message: 'Purchase invoice created from PO successfully',
      purchaseInvoice: populatedInvoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Record payment for purchase invoice
// @route   PUT /api/billing/purchase-invoices/:id/payment
// @access  Private/Admin
exports.recordPayment = async (req, res) => {
  try {
    const { amount, paymentMode, reference, notes } = req.body;

    const purchaseInvoice = await PurchaseInvoice.findById(req.params.id);
    if (!purchaseInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Purchase invoice not found'
      });
    }

    if (purchaseInvoice.paymentStatus === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'Invoice is already fully paid'
      });
    }

    if (amount > purchaseInvoice.balanceAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount cannot exceed balance amount (${purchaseInvoice.balanceAmount})`
      });
    }

    // Add payment to history
    purchaseInvoice.paymentHistory.push({
      amount,
      paymentMode,
      reference,
      notes,
      date: new Date()
    });

    purchaseInvoice.paidAmount += amount;
    await purchaseInvoice.save();

    // Update supplier balance
    await Supplier.findByIdAndUpdate(purchaseInvoice.supplier, {
      $inc: { currentBalance: -amount }
    });

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      purchaseInvoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete purchase invoice
// @route   DELETE /api/billing/purchase-invoices/:id
// @access  Private/Admin
exports.deletePurchaseInvoice = async (req, res) => {
  try {
    const purchaseInvoice = await PurchaseInvoice.findById(req.params.id);

    if (!purchaseInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Purchase invoice not found'
      });
    }

    if (purchaseInvoice.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft invoices can be deleted'
      });
    }

    if (purchaseInvoice.grnGenerated) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete invoice with GRN generated'
      });
    }

    // Revert supplier balance
    await Supplier.findByIdAndUpdate(purchaseInvoice.supplier, {
      $inc: { currentBalance: -purchaseInvoice.totalAmount }
    });

    await purchaseInvoice.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Purchase invoice deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
