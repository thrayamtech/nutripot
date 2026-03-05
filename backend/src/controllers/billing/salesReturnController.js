const SalesReturn = require('../../models/billing/SalesReturn');
const SalesInvoice = require('../../models/billing/SalesInvoice');
const Product = require('../../models/Product');
const StockLedger = require('../../models/billing/StockLedger');

// @desc    Get all sales returns
// @route   GET /api/billing/sales-returns
// @access  Private/Admin
exports.getSalesReturns = async (req, res) => {
  try {
    const { search, customer, status, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { returnNumber: { $regex: search, $options: 'i' } },
        { creditNoteNumber: { $regex: search, $options: 'i' } },
        { 'customerDetails.name': { $regex: search, $options: 'i' } }
      ];
    }
    if (customer) query.customer = customer;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.returnDate = {};
      if (startDate) query.returnDate.$gte = new Date(startDate);
      if (endDate) query.returnDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const salesReturns = await SalesReturn.find(query)
      .populate('customer', 'name phone')
      .populate('salesInvoice', 'invoiceNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SalesReturn.countDocuments(query);

    res.status(200).json({
      success: true,
      count: salesReturns.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      salesReturns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single sales return
// @route   GET /api/billing/sales-returns/:id
// @access  Private/Admin
exports.getSalesReturn = async (req, res) => {
  try {
    const salesReturn = await SalesReturn.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('salesInvoice')
      .populate('items.product', 'name price stock')
      .populate('createdBy', 'name');

    if (!salesReturn) {
      return res.status(404).json({
        success: false,
        message: 'Sales return not found'
      });
    }

    res.status(200).json({
      success: true,
      salesReturn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create sales return
// @route   POST /api/billing/sales-returns
// @access  Private/Admin
exports.createSalesReturn = async (req, res) => {
  try {
    const { salesInvoice: invoiceId, items, isInterState, refundMode } = req.body;

    // Validate sales invoice
    const salesInvoice = await SalesInvoice.findById(invoiceId);
    if (!salesInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Sales invoice not found'
      });
    }

    if (salesInvoice.status !== 'Confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Can only create return for confirmed invoices'
      });
    }

    // Calculate totals
    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      // Validate return quantity against original invoice
      const invoiceItem = salesInvoice.items.find(
        i => i.product.toString() === item.product
      );

      if (!invoiceItem) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} was not in the original invoice`
        });
      }

      if (item.returnQuantity > invoiceItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Return quantity for ${product.name} exceeds invoiced quantity`
        });
      }

      item.name = product.name;
      item.unit = 'pieces';

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

    const salesReturn = await SalesReturn.create({
      salesInvoice: invoiceId,
      customer: salesInvoice.customer,
      customerDetails: salesInvoice.customerDetails,
      returnDate: req.body.returnDate || new Date(),
      items,
      subtotal,
      cgst: totalCGST,
      sgst: totalSGST,
      igst: totalIGST,
      totalGst,
      totalAmount,
      isInterState,
      refundMode,
      notes: req.body.notes,
      createdBy: req.user._id
    });

    const populatedReturn = await SalesReturn.findById(salesReturn._id)
      .populate('customer', 'name phone')
      .populate('salesInvoice', 'invoiceNumber')
      .populate('items.product', 'name price');

    res.status(201).json({
      success: true,
      message: 'Sales return created successfully',
      salesReturn: populatedReturn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Confirm sales return and restore stock
// @route   PUT /api/billing/sales-returns/:id/confirm
// @access  Private/Admin
exports.confirmSalesReturn = async (req, res) => {
  try {
    const salesReturn = await SalesReturn.findById(req.params.id)
      .populate('salesInvoice');

    if (!salesReturn) {
      return res.status(404).json({
        success: false,
        message: 'Sales return not found'
      });
    }

    if (salesReturn.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft returns can be confirmed'
      });
    }

    // Restore stock for items in good condition
    for (const item of salesReturn.items) {
      if (item.condition === 'Good') {
        const product = await Product.findById(item.product);
        const newStock = product.stock + item.returnQuantity;
        const newSold = Math.max(0, (product.sold || 0) - item.returnQuantity);

        await Product.findByIdAndUpdate(item.product, {
          stock: newStock,
          sold: newSold
        });

        // Create stock ledger entry
        await StockLedger.create({
          transactionType: 'Sales Return',
          referenceNumber: salesReturn.returnNumber,
          referenceId: salesReturn._id,
          product: item.product,
          itemType: 'Product',
          itemName: item.name,
          unit: item.unit || 'pieces',
          inQuantity: item.returnQuantity,
          outQuantity: 0,
          balanceQuantity: newStock,
          rate: item.rate,
          value: item.amount,
          remarks: `Returned - ${item.reason || 'Customer return'} (${item.condition})`,
          createdBy: req.user._id
        });
      }
    }

    // Update sales return status
    salesReturn.status = 'Confirmed';
    salesReturn.stockRestored = true;

    // Generate credit note number
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await SalesReturn.countDocuments({ status: { $in: ['Confirmed', 'Refunded'] } }) + 1;
    salesReturn.creditNoteNumber = `CN${year}${month}${String(count).padStart(4, '0')}`;

    await salesReturn.save();

    res.status(200).json({
      success: true,
      message: 'Sales return confirmed and stock restored',
      salesReturn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Process refund for sales return
// @route   PUT /api/billing/sales-returns/:id/refund
// @access  Private/Admin
exports.processRefund = async (req, res) => {
  try {
    const { amount, reference } = req.body;

    const salesReturn = await SalesReturn.findById(req.params.id);
    if (!salesReturn) {
      return res.status(404).json({
        success: false,
        message: 'Sales return not found'
      });
    }

    if (salesReturn.status !== 'Confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed returns can be refunded'
      });
    }

    salesReturn.refundDetails = {
      amount: amount || salesReturn.totalAmount,
      reference,
      date: new Date()
    };
    salesReturn.status = 'Refunded';
    await salesReturn.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      salesReturn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete sales return
// @route   DELETE /api/billing/sales-returns/:id
// @access  Private/Admin
exports.deleteSalesReturn = async (req, res) => {
  try {
    const salesReturn = await SalesReturn.findById(req.params.id);

    if (!salesReturn) {
      return res.status(404).json({
        success: false,
        message: 'Sales return not found'
      });
    }

    if (salesReturn.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft returns can be deleted'
      });
    }

    await salesReturn.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Sales return deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
