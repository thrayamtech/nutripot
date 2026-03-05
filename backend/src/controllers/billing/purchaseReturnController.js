const PurchaseReturn = require('../../models/billing/PurchaseReturn');
const PurchaseInvoice = require('../../models/billing/PurchaseInvoice');
const RawMaterial = require('../../models/billing/RawMaterial');
const Supplier = require('../../models/billing/Supplier');
const StockLedger = require('../../models/billing/StockLedger');

// @desc    Get all purchase returns
// @route   GET /api/billing/purchase-returns
// @access  Private/Admin
exports.getPurchaseReturns = async (req, res) => {
  try {
    const { search, supplier, status, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { returnNumber: { $regex: search, $options: 'i' } },
        { debitNoteNumber: { $regex: search, $options: 'i' } }
      ];
    }
    if (supplier) query.supplier = supplier;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.returnDate = {};
      if (startDate) query.returnDate.$gte = new Date(startDate);
      if (endDate) query.returnDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const purchaseReturns = await PurchaseReturn.find(query)
      .populate('supplier', 'name code')
      .populate('purchaseInvoice', 'invoiceNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PurchaseReturn.countDocuments(query);

    res.status(200).json({
      success: true,
      count: purchaseReturns.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      purchaseReturns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single purchase return
// @route   GET /api/billing/purchase-returns/:id
// @access  Private/Admin
exports.getPurchaseReturn = async (req, res) => {
  try {
    const purchaseReturn = await PurchaseReturn.findById(req.params.id)
      .populate('supplier')
      .populate('purchaseInvoice')
      .populate('items.rawMaterial', 'name code unit')
      .populate('createdBy', 'name');

    if (!purchaseReturn) {
      return res.status(404).json({
        success: false,
        message: 'Purchase return not found'
      });
    }

    res.status(200).json({
      success: true,
      purchaseReturn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create purchase return
// @route   POST /api/billing/purchase-returns
// @access  Private/Admin
exports.createPurchaseReturn = async (req, res) => {
  try {
    const { purchaseInvoice: invoiceId, items, isInterState, adjustmentType } = req.body;

    // Validate purchase invoice
    const purchaseInvoice = await PurchaseInvoice.findById(invoiceId).populate('supplier');
    if (!purchaseInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Purchase invoice not found'
      });
    }

    // Calculate totals
    let subtotal = 0;
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

      // Check if return quantity is valid
      if (item.returnQuantity > rawMaterial.currentStock) {
        return res.status(400).json({
          success: false,
          message: `Return quantity for ${rawMaterial.name} exceeds current stock (${rawMaterial.currentStock})`
        });
      }

      item.name = rawMaterial.name;
      item.code = rawMaterial.code;
      item.unit = rawMaterial.unit;

      item.taxableAmount = item.returnQuantity * item.rate;
      subtotal += item.taxableAmount;

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
    }

    const totalGst = totalCGST + totalSGST + totalIGST;
    const totalAmount = Math.round(subtotal + totalGst);

    const purchaseReturn = await PurchaseReturn.create({
      purchaseInvoice: invoiceId,
      supplier: purchaseInvoice.supplier._id,
      returnDate: req.body.returnDate || new Date(),
      items,
      subtotal,
      cgst: totalCGST,
      sgst: totalSGST,
      igst: totalIGST,
      totalGst,
      totalAmount,
      isInterState,
      adjustmentType,
      notes: req.body.notes,
      createdBy: req.user._id
    });

    const populatedReturn = await PurchaseReturn.findById(purchaseReturn._id)
      .populate('supplier', 'name code')
      .populate('purchaseInvoice', 'invoiceNumber')
      .populate('items.rawMaterial', 'name code');

    res.status(201).json({
      success: true,
      message: 'Purchase return created successfully',
      purchaseReturn: populatedReturn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Confirm purchase return and update stock
// @route   PUT /api/billing/purchase-returns/:id/confirm
// @access  Private/Admin
exports.confirmPurchaseReturn = async (req, res) => {
  try {
    const purchaseReturn = await PurchaseReturn.findById(req.params.id)
      .populate('supplier')
      .populate('purchaseInvoice');

    if (!purchaseReturn) {
      return res.status(404).json({
        success: false,
        message: 'Purchase return not found'
      });
    }

    if (purchaseReturn.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft purchase returns can be confirmed'
      });
    }

    // Update raw material stock and create stock ledger entries
    for (const item of purchaseReturn.items) {
      const rawMaterial = await RawMaterial.findById(item.rawMaterial);

      if (rawMaterial.currentStock < item.returnQuantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}. Available: ${rawMaterial.currentStock}`
        });
      }

      const newStock = rawMaterial.currentStock - item.returnQuantity;

      await RawMaterial.findByIdAndUpdate(item.rawMaterial, {
        currentStock: newStock
      });

      // Create stock ledger entry
      await StockLedger.create({
        transactionType: 'Purchase Return',
        referenceNumber: purchaseReturn.returnNumber,
        referenceId: purchaseReturn._id,
        rawMaterial: item.rawMaterial,
        itemType: 'RawMaterial',
        itemName: item.name,
        itemCode: item.code,
        unit: item.unit,
        inQuantity: 0,
        outQuantity: item.returnQuantity,
        balanceQuantity: newStock,
        rate: item.rate,
        value: item.returnQuantity * item.rate,
        remarks: item.reason || 'Purchase return',
        createdBy: req.user._id
      });
    }

    // Update purchase return status
    purchaseReturn.status = 'Confirmed';
    purchaseReturn.stockUpdated = true;

    // Generate debit note number
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await PurchaseReturn.countDocuments({ status: 'Confirmed' }) + 1;
    purchaseReturn.debitNoteNumber = `DN${year}${month}${String(count).padStart(4, '0')}`;

    await purchaseReturn.save();

    // Update supplier balance (reduce the amount owed)
    await Supplier.findByIdAndUpdate(purchaseReturn.supplier._id, {
      $inc: { currentBalance: -purchaseReturn.totalAmount }
    });

    res.status(200).json({
      success: true,
      message: 'Purchase return confirmed and stock updated successfully',
      purchaseReturn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete purchase return
// @route   DELETE /api/billing/purchase-returns/:id
// @access  Private/Admin
exports.deletePurchaseReturn = async (req, res) => {
  try {
    const purchaseReturn = await PurchaseReturn.findById(req.params.id);

    if (!purchaseReturn) {
      return res.status(404).json({
        success: false,
        message: 'Purchase return not found'
      });
    }

    if (purchaseReturn.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft purchase returns can be deleted'
      });
    }

    await purchaseReturn.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Purchase return deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
