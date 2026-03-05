const Voucher = require('../../models/billing/Voucher');
const Supplier = require('../../models/billing/Supplier');
const PurchaseInvoice = require('../../models/billing/PurchaseInvoice');
const SalesInvoice = require('../../models/billing/SalesInvoice');

// @desc    Get all vouchers
// @route   GET /api/billing/vouchers
// @access  Private/Admin
exports.getVouchers = async (req, res) => {
  try {
    const { search, voucherType, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { voucherNumber: { $regex: search, $options: 'i' } },
        { partyName: { $regex: search, $options: 'i' } },
        { narration: { $regex: search, $options: 'i' } }
      ];
    }
    if (voucherType) query.voucherType = voucherType;
    if (startDate || endDate) {
      query.voucherDate = {};
      if (startDate) query.voucherDate.$gte = new Date(startDate);
      if (endDate) query.voucherDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const vouchers = await Voucher.find(query)
      .populate('supplier', 'name code')
      .populate('customer', 'name phone')
      .populate('purchaseInvoice', 'invoiceNumber')
      .populate('salesInvoice', 'invoiceNumber')
      .sort({ voucherDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Voucher.countDocuments(query);

    // Get summary by type
    const summary = await Voucher.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$voucherType',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: vouchers.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      summary,
      vouchers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single voucher
// @route   GET /api/billing/vouchers/:id
// @access  Private/Admin
exports.getVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id)
      .populate('supplier')
      .populate('customer', 'name email phone')
      .populate('purchaseInvoice')
      .populate('salesInvoice')
      .populate('createdBy', 'name');

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    res.status(200).json({
      success: true,
      voucher
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create payment voucher (to supplier)
// @route   POST /api/billing/vouchers/payment
// @access  Private/Admin
exports.createPaymentVoucher = async (req, res) => {
  try {
    const { supplier, purchaseInvoice, amount, paymentMode, bankDetails, narration } = req.body;

    // Validate supplier
    const supplierDoc = await Supplier.findById(supplier);
    if (!supplierDoc) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Validate invoice if provided
    if (purchaseInvoice) {
      const invoice = await PurchaseInvoice.findById(purchaseInvoice);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Purchase invoice not found'
        });
      }

      // Record payment on invoice
      invoice.paymentHistory.push({
        amount,
        paymentMode,
        reference: bankDetails?.transactionId || bankDetails?.chequeNumber,
        notes: narration,
        date: new Date()
      });
      invoice.paidAmount += amount;
      await invoice.save();
    }

    const voucher = await Voucher.create({
      voucherType: 'Payment',
      voucherDate: req.body.voucherDate || new Date(),
      supplier,
      purchaseInvoice,
      partyName: supplierDoc.name,
      amount,
      paymentMode,
      bankDetails,
      narration: narration || `Payment to ${supplierDoc.name}`,
      createdBy: req.user._id
    });

    // Update supplier balance
    await Supplier.findByIdAndUpdate(supplier, {
      $inc: { currentBalance: -amount }
    });

    const populatedVoucher = await Voucher.findById(voucher._id)
      .populate('supplier', 'name code')
      .populate('purchaseInvoice', 'invoiceNumber');

    res.status(201).json({
      success: true,
      message: 'Payment voucher created successfully',
      voucher: populatedVoucher
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create receipt voucher (from customer)
// @route   POST /api/billing/vouchers/receipt
// @access  Private/Admin
exports.createReceiptVoucher = async (req, res) => {
  try {
    const { customer, salesInvoice, partyName, amount, paymentMode, bankDetails, narration } = req.body;

    // Validate invoice if provided
    if (salesInvoice) {
      const invoice = await SalesInvoice.findById(salesInvoice);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Sales invoice not found'
        });
      }

      // Record payment on invoice
      invoice.payments.push({
        mode: paymentMode,
        amount,
        reference: bankDetails?.transactionId || bankDetails?.chequeNumber,
        date: new Date()
      });
      await invoice.save();
    }

    const voucher = await Voucher.create({
      voucherType: 'Receipt',
      voucherDate: req.body.voucherDate || new Date(),
      customer,
      salesInvoice,
      partyName: partyName || 'Walk-in Customer',
      amount,
      paymentMode,
      bankDetails,
      narration: narration || `Receipt from ${partyName || 'customer'}`,
      createdBy: req.user._id
    });

    const populatedVoucher = await Voucher.findById(voucher._id)
      .populate('customer', 'name phone')
      .populate('salesInvoice', 'invoiceNumber');

    res.status(201).json({
      success: true,
      message: 'Receipt voucher created successfully',
      voucher: populatedVoucher
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create journal voucher
// @route   POST /api/billing/vouchers/journal
// @access  Private/Admin
exports.createJournalVoucher = async (req, res) => {
  try {
    const { accountHead, amount, paymentMode, bankDetails, narration } = req.body;

    const voucher = await Voucher.create({
      voucherType: 'Journal',
      voucherDate: req.body.voucherDate || new Date(),
      accountHead,
      partyName: req.body.partyName,
      amount,
      paymentMode,
      bankDetails,
      narration,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Journal voucher created successfully',
      voucher
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create expense voucher
// @route   POST /api/billing/vouchers/expense
// @access  Private/Admin
exports.createExpenseVoucher = async (req, res) => {
  try {
    const { expenseCategory, amount, paymentMode, bankDetails, narration, partyName } = req.body;

    const voucher = await Voucher.create({
      voucherType: 'Expense',
      voucherDate: req.body.voucherDate || new Date(),
      expenseCategory,
      partyName,
      amount,
      paymentMode,
      bankDetails,
      narration: narration || `Expense - ${expenseCategory}`,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Expense voucher created successfully',
      voucher
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update voucher
// @route   PUT /api/billing/vouchers/:id
// @access  Private/Admin
exports.updateVoucher = async (req, res) => {
  try {
    let voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft vouchers can be updated'
      });
    }

    voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Voucher updated successfully',
      voucher
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete voucher
// @route   DELETE /api/billing/vouchers/:id
// @access  Private/Admin
exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft vouchers can be deleted'
      });
    }

    // Revert supplier balance if payment voucher
    if (voucher.voucherType === 'Payment' && voucher.supplier) {
      await Supplier.findByIdAndUpdate(voucher.supplier, {
        $inc: { currentBalance: voucher.amount }
      });
    }

    await voucher.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Voucher deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get expense summary by category
// @route   GET /api/billing/vouchers/expense-summary
// @access  Private/Admin
exports.getExpenseSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { voucherType: 'Expense' };
    if (startDate || endDate) {
      query.voucherDate = {};
      if (startDate) query.voucherDate.$gte = new Date(startDate);
      if (endDate) query.voucherDate.$lte = new Date(endDate);
    }

    const summary = await Voucher.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$expenseCategory',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    const total = summary.reduce((sum, cat) => sum + cat.totalAmount, 0);

    res.status(200).json({
      success: true,
      totalExpenses: total,
      categoryWise: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
