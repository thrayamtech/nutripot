const SalesInvoice = require('../../models/billing/SalesInvoice');
const Product = require('../../models/Product');
const User = require('../../models/User');
const StockLedger = require('../../models/billing/StockLedger');

// @desc    Get all sales invoices
// @route   GET /api/billing/sales-invoices
// @access  Private/Admin
exports.getSalesInvoices = async (req, res) => {
  try {
    const { search, customer, status, paymentStatus, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customerDetails.name': { $regex: search, $options: 'i' } },
        { 'customerDetails.phone': { $regex: search, $options: 'i' } }
      ];
    }
    if (customer) query.customer = customer;
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) query.invoiceDate.$gte = new Date(startDate);
      if (endDate) query.invoiceDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const salesInvoices = await SalesInvoice.find(query)
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SalesInvoice.countDocuments(query);

    // Calculate summary
    const summary = await SalesInvoice.aggregate([
      { $match: { ...query, status: 'Confirmed' } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalReceived: { $sum: '$paidAmount' },
          totalPending: { $sum: '$balanceAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: salesInvoices.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      summary: summary[0] || { totalSales: 0, totalReceived: 0, totalPending: 0 },
      salesInvoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single sales invoice
// @route   GET /api/billing/sales-invoices/:id
// @access  Private/Admin
exports.getSalesInvoice = async (req, res) => {
  try {
    const salesInvoice = await SalesInvoice.findById(req.params.id)
      .populate('customer', 'name email phone addresses')
      .populate('items.product', 'name price stock images')
      .populate('createdBy', 'name');

    if (!salesInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Sales invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      salesInvoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create sales invoice
// @route   POST /api/billing/sales-invoices
// @access  Private/Admin
exports.createSalesInvoice = async (req, res) => {
  try {
    const { customer, customerDetails, items, isInterState, placeOfSupply, payments } = req.body;

    // Validate customer if provided
    if (customer) {
      const customerDoc = await User.findById(customer);
      if (!customerDoc) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }
    }

    // Calculate totals
    let subtotal = 0;
    let totalDiscount = 0;
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

      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      item.name = product.name;
      item.mrp = product.price;

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

    // Calculate paid amount from payments
    let paidAmount = 0;
    let paymentMode = 'Cash';
    if (payments && payments.length > 0) {
      paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
      paymentMode = payments.length > 1 ? 'Multiple' : payments[0].mode;
    }

    const salesInvoice = await SalesInvoice.create({
      customer,
      customerDetails,
      invoiceDate: req.body.invoiceDate || new Date(),
      dueDate: req.body.dueDate,
      placeOfSupply,
      isInterState,
      items,
      subtotal,
      totalDiscount,
      cgst: totalCGST,
      sgst: totalSGST,
      igst: totalIGST,
      totalGst,
      otherCharges,
      roundOff,
      totalAmount,
      paymentMode,
      payments: payments || [],
      paidAmount,
      notes: req.body.notes,
      termsAndConditions: req.body.termsAndConditions,
      createdBy: req.user._id
    });

    const populatedInvoice = await SalesInvoice.findById(salesInvoice._id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name price');

    res.status(201).json({
      success: true,
      message: 'Sales invoice created successfully',
      salesInvoice: populatedInvoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Confirm sales invoice and deduct stock
// @route   PUT /api/billing/sales-invoices/:id/confirm
// @access  Private/Admin
exports.confirmSalesInvoice = async (req, res) => {
  try {
    const salesInvoice = await SalesInvoice.findById(req.params.id);

    if (!salesInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Sales invoice not found'
      });
    }

    if (salesInvoice.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft invoices can be confirmed'
      });
    }

    // Verify stock availability and deduct
    for (const item of salesInvoice.items) {
      const product = await Product.findById(item.product);

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}. Available: ${product.stock}`
        });
      }

      const newStock = product.stock - item.quantity;
      const newSold = (product.sold || 0) + item.quantity;

      await Product.findByIdAndUpdate(item.product, {
        stock: newStock,
        sold: newSold
      });

      // Create stock ledger entry
      await StockLedger.create({
        transactionType: 'Sales',
        referenceNumber: salesInvoice.invoiceNumber,
        referenceId: salesInvoice._id,
        product: item.product,
        itemType: 'Product',
        itemName: item.name,
        unit: item.unit || 'pieces',
        inQuantity: 0,
        outQuantity: item.quantity,
        balanceQuantity: newStock,
        rate: item.rate,
        value: item.amount,
        remarks: `Sold via invoice ${salesInvoice.invoiceNumber}`,
        createdBy: req.user._id
      });
    }

    salesInvoice.status = 'Confirmed';
    salesInvoice.stockDeducted = true;
    await salesInvoice.save();

    res.status(200).json({
      success: true,
      message: 'Sales invoice confirmed and stock deducted',
      salesInvoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Record payment for sales invoice
// @route   PUT /api/billing/sales-invoices/:id/payment
// @access  Private/Admin
exports.recordPayment = async (req, res) => {
  try {
    const { amount, mode, reference } = req.body;

    const salesInvoice = await SalesInvoice.findById(req.params.id);
    if (!salesInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Sales invoice not found'
      });
    }

    if (salesInvoice.paymentStatus === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'Invoice is already fully paid'
      });
    }

    if (amount > salesInvoice.balanceAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount cannot exceed balance (${salesInvoice.balanceAmount})`
      });
    }

    salesInvoice.payments.push({
      mode,
      amount,
      reference,
      date: new Date()
    });

    if (salesInvoice.payments.length > 1) {
      salesInvoice.paymentMode = 'Multiple';
    }

    await salesInvoice.save();

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      salesInvoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update sales invoice
// @route   PUT /api/billing/sales-invoices/:id
// @access  Private/Admin
exports.updateSalesInvoice = async (req, res) => {
  try {
    let salesInvoice = await SalesInvoice.findById(req.params.id);

    if (!salesInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Sales invoice not found'
      });
    }

    if (salesInvoice.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft invoices can be updated'
      });
    }

    // If items are updated, recalculate totals
    if (req.body.items) {
      const { items, isInterState } = req.body;
      let subtotal = 0;
      let totalDiscount = 0;
      let totalCGST = 0;
      let totalSGST = 0;
      let totalIGST = 0;

      for (let item of items) {
        const product = await Product.findById(item.product);
        if (product) {
          item.name = product.name;
          item.mrp = product.price;
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
      const otherCharges = req.body.otherCharges || salesInvoice.otherCharges || 0;
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

    salesInvoice = await SalesInvoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('customer', 'name email phone')
      .populate('items.product', 'name price');

    res.status(200).json({
      success: true,
      message: 'Sales invoice updated successfully',
      salesInvoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete sales invoice
// @route   DELETE /api/billing/sales-invoices/:id
// @access  Private/Admin
exports.deleteSalesInvoice = async (req, res) => {
  try {
    const salesInvoice = await SalesInvoice.findById(req.params.id);

    if (!salesInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Sales invoice not found'
      });
    }

    if (salesInvoice.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft invoices can be deleted'
      });
    }

    await salesInvoice.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Sales invoice deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get invoice for print
// @route   GET /api/billing/sales-invoices/:id/print
// @access  Private/Admin
exports.getInvoiceForPrint = async (req, res) => {
  try {
    const salesInvoice = await SalesInvoice.findById(req.params.id)
      .populate('customer', 'name email phone addresses')
      .populate('items.product', 'name price images')
      .populate('createdBy', 'name');

    if (!salesInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Sales invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      salesInvoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
