const RawMaterial = require('../../models/billing/RawMaterial');
const Product = require('../../models/Product');
const PurchaseInvoice = require('../../models/billing/PurchaseInvoice');
const SalesInvoice = require('../../models/billing/SalesInvoice');
const StockLedger = require('../../models/billing/StockLedger');
const Supplier = require('../../models/billing/Supplier');
const Voucher = require('../../models/billing/Voucher');

// @desc    Get raw material stock report
// @route   GET /api/billing/reports/stock/raw-materials
// @access  Private/Admin
exports.getRawMaterialStockReport = async (req, res) => {
  try {
    const { category, lowStock } = req.query;

    const query = { isActive: true };
    if (category) query.category = category;
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$currentStock', '$minimumStock'] };
    }

    const rawMaterials = await RawMaterial.find(query)
      .populate('category', 'name')
      .populate('defaultSupplier', 'name')
      .sort({ name: 1 });

    // Calculate total stock value
    let totalValue = 0;
    const report = rawMaterials.map(rm => {
      const stockValue = rm.currentStock * rm.costPrice;
      totalValue += stockValue;
      return {
        _id: rm._id,
        code: rm.code,
        name: rm.name,
        category: rm.category?.name,
        unit: rm.unit,
        currentStock: rm.currentStock,
        minimumStock: rm.minimumStock,
        costPrice: rm.costPrice,
        stockValue,
        isLowStock: rm.currentStock <= rm.minimumStock,
        supplier: rm.defaultSupplier?.name
      };
    });

    res.status(200).json({
      success: true,
      count: report.length,
      totalStockValue: totalValue,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get finished goods stock report
// @route   GET /api/billing/reports/stock/finished-goods
// @access  Private/Admin
exports.getFinishedGoodsStockReport = async (req, res) => {
  try {
    const { category, lowStock } = req.query;

    const query = { isActive: true };
    if (category) query.category = category;
    if (lowStock === 'true') {
      query.stock = { $lte: 10 }; // Arbitrary low stock threshold for products
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ name: 1 });

    let totalValue = 0;
    let totalRetailValue = 0;
    const report = products.map(p => {
      const costValue = p.stock * (p.discountPrice || p.price);
      const retailValue = p.stock * p.price;
      totalValue += costValue;
      totalRetailValue += retailValue;
      return {
        _id: p._id,
        name: p.name,
        category: p.category?.name,
        stock: p.stock,
        sold: p.sold || 0,
        price: p.price,
        discountPrice: p.discountPrice,
        stockValue: costValue,
        retailValue
      };
    });

    res.status(200).json({
      success: true,
      count: report.length,
      totalStockValue: totalValue,
      totalRetailValue,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get purchase register
// @route   GET /api/billing/reports/purchase-register
// @access  Private/Admin
exports.getPurchaseRegister = async (req, res) => {
  try {
    const { supplier, startDate, endDate } = req.query;

    const query = { status: 'Confirmed' };
    if (supplier) query.supplier = supplier;
    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) query.invoiceDate.$gte = new Date(startDate);
      if (endDate) query.invoiceDate.$lte = new Date(endDate);
    }

    const purchases = await PurchaseInvoice.find(query)
      .populate('supplier', 'name code gstNumber')
      .sort({ invoiceDate: -1 });

    // Calculate totals
    const summary = await PurchaseInvoice.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalPurchase: { $sum: '$subtotal' },
          totalCGST: { $sum: '$cgst' },
          totalSGST: { $sum: '$sgst' },
          totalIGST: { $sum: '$igst' },
          totalGST: { $sum: '$totalGst' },
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalOutstanding: { $sum: '$balanceAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: purchases.length,
      summary: summary[0] || {},
      purchases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get sales register
// @route   GET /api/billing/reports/sales-register
// @access  Private/Admin
exports.getSalesRegister = async (req, res) => {
  try {
    const { customer, startDate, endDate } = req.query;

    const query = { status: 'Confirmed' };
    if (customer) query.customer = customer;
    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) query.invoiceDate.$gte = new Date(startDate);
      if (endDate) query.invoiceDate.$lte = new Date(endDate);
    }

    const sales = await SalesInvoice.find(query)
      .populate('customer', 'name phone')
      .sort({ invoiceDate: -1 });

    // Calculate totals
    const summary = await SalesInvoice.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$subtotal' },
          totalCGST: { $sum: '$cgst' },
          totalSGST: { $sum: '$sgst' },
          totalIGST: { $sum: '$igst' },
          totalGST: { $sum: '$totalGst' },
          totalAmount: { $sum: '$totalAmount' },
          totalReceived: { $sum: '$paidAmount' },
          totalOutstanding: { $sum: '$balanceAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: sales.length,
      summary: summary[0] || {},
      sales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get GST summary report
// @route   GET /api/billing/reports/gst/summary
// @access  Private/Admin
exports.getGSTSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.invoiceDate = {};
      if (startDate) dateQuery.invoiceDate.$gte = new Date(startDate);
      if (endDate) dateQuery.invoiceDate.$lte = new Date(endDate);
    }

    // Sales GST (Output Tax)
    const salesGST = await SalesInvoice.aggregate([
      { $match: { ...dateQuery, status: 'Confirmed' } },
      {
        $group: {
          _id: null,
          taxableValue: { $sum: '$subtotal' },
          cgst: { $sum: '$cgst' },
          sgst: { $sum: '$sgst' },
          igst: { $sum: '$igst' },
          totalGst: { $sum: '$totalGst' }
        }
      }
    ]);

    // Purchase GST (Input Tax)
    const purchaseGST = await PurchaseInvoice.aggregate([
      { $match: { ...dateQuery, status: 'Confirmed' } },
      {
        $group: {
          _id: null,
          taxableValue: { $sum: '$subtotal' },
          cgst: { $sum: '$cgst' },
          sgst: { $sum: '$sgst' },
          igst: { $sum: '$igst' },
          totalGst: { $sum: '$totalGst' }
        }
      }
    ]);

    const outputTax = salesGST[0] || { taxableValue: 0, cgst: 0, sgst: 0, igst: 0, totalGst: 0 };
    const inputTax = purchaseGST[0] || { taxableValue: 0, cgst: 0, sgst: 0, igst: 0, totalGst: 0 };

    const netGST = {
      cgst: outputTax.cgst - inputTax.cgst,
      sgst: outputTax.sgst - inputTax.sgst,
      igst: outputTax.igst - inputTax.igst,
      total: outputTax.totalGst - inputTax.totalGst
    };

    res.status(200).json({
      success: true,
      period: { startDate, endDate },
      outputTax,
      inputTax,
      netGSTPayable: netGST
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get GSTR-1 report (Sales)
// @route   GET /api/billing/reports/gst/gstr1
// @access  Private/Admin
exports.getGSTR1Report = async (req, res) => {
  try {
    const { month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const sales = await SalesInvoice.find({
      invoiceDate: { $gte: startDate, $lte: endDate },
      status: 'Confirmed'
    })
      .populate('customer', 'name')
      .sort({ invoiceDate: 1 });

    // Group by B2B (with GST) and B2C (without GST)
    const b2b = sales.filter(s => s.customerDetails?.gstNumber);
    const b2c = sales.filter(s => !s.customerDetails?.gstNumber);

    // HSN summary
    const hsnSummary = {};
    sales.forEach(invoice => {
      invoice.items.forEach(item => {
        const hsn = item.hsnCode || 'NA';
        if (!hsnSummary[hsn]) {
          hsnSummary[hsn] = { quantity: 0, taxableValue: 0, cgst: 0, sgst: 0, igst: 0 };
        }
        hsnSummary[hsn].quantity += item.quantity;
        hsnSummary[hsn].taxableValue += item.taxableAmount;
        hsnSummary[hsn].cgst += item.cgst;
        hsnSummary[hsn].sgst += item.sgst;
        hsnSummary[hsn].igst += item.igst;
      });
    });

    res.status(200).json({
      success: true,
      period: { month, year },
      b2bInvoices: b2b.length,
      b2cInvoices: b2c.length,
      hsnSummary: Object.entries(hsnSummary).map(([hsn, data]) => ({ hsn, ...data })),
      invoices: sales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get GSTR-2 report (Purchases)
// @route   GET /api/billing/reports/gst/gstr2
// @access  Private/Admin
exports.getGSTR2Report = async (req, res) => {
  try {
    const { month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const purchases = await PurchaseInvoice.find({
      invoiceDate: { $gte: startDate, $lte: endDate },
      status: 'Confirmed'
    })
      .populate('supplier', 'name gstNumber')
      .sort({ invoiceDate: 1 });

    res.status(200).json({
      success: true,
      period: { month, year },
      invoiceCount: purchases.length,
      invoices: purchases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get profit & loss summary
// @route   GET /api/billing/reports/profit-loss
// @access  Private/Admin
exports.getProfitLossReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);

    // Revenue (Sales)
    const salesQuery = { status: 'Confirmed' };
    if (startDate || endDate) salesQuery.invoiceDate = dateQuery;

    const salesSummary = await SalesInvoice.aggregate([
      { $match: salesQuery },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$subtotal' },
          totalGST: { $sum: '$totalGst' }
        }
      }
    ]);

    // Cost of Goods (Purchases)
    const purchaseQuery = { status: 'Confirmed' };
    if (startDate || endDate) purchaseQuery.invoiceDate = dateQuery;

    const purchaseSummary = await PurchaseInvoice.aggregate([
      { $match: purchaseQuery },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$subtotal' }
        }
      }
    ]);

    // Expenses
    const expenseQuery = { voucherType: 'Expense' };
    if (startDate || endDate) expenseQuery.voucherDate = dateQuery;

    const expenseSummary = await Voucher.aggregate([
      { $match: expenseQuery },
      {
        $group: {
          _id: '$expenseCategory',
          amount: { $sum: '$amount' }
        }
      }
    ]);

    const totalExpenses = expenseSummary.reduce((sum, e) => sum + e.amount, 0);

    const revenue = salesSummary[0]?.totalRevenue || 0;
    const costOfGoods = purchaseSummary[0]?.totalCost || 0;
    const grossProfit = revenue - costOfGoods;
    const netProfit = grossProfit - totalExpenses;

    res.status(200).json({
      success: true,
      period: { startDate, endDate },
      revenue,
      costOfGoods,
      grossProfit,
      grossProfitMargin: revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(2) : 0,
      expenses: {
        total: totalExpenses,
        categoryWise: expenseSummary
      },
      netProfit,
      netProfitMargin: revenue > 0 ? ((netProfit / revenue) * 100).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get supplier outstanding report
// @route   GET /api/billing/reports/supplier-outstanding
// @access  Private/Admin
exports.getSupplierOutstanding = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ currentBalance: { $gt: 0 } })
      .select('name code phone currentBalance')
      .sort({ currentBalance: -1 });

    const total = suppliers.reduce((sum, s) => sum + s.currentBalance, 0);

    res.status(200).json({
      success: true,
      count: suppliers.length,
      totalOutstanding: total,
      suppliers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get customer outstanding report
// @route   GET /api/billing/reports/customer-outstanding
// @access  Private/Admin
exports.getCustomerOutstanding = async (req, res) => {
  try {
    const outstanding = await SalesInvoice.aggregate([
      { $match: { status: 'Confirmed', balanceAmount: { $gt: 0 } } },
      {
        $group: {
          _id: {
            customer: '$customer',
            customerName: '$customerDetails.name',
            customerPhone: '$customerDetails.phone'
          },
          totalOutstanding: { $sum: '$balanceAmount' },
          invoiceCount: { $sum: 1 }
        }
      },
      { $sort: { totalOutstanding: -1 } }
    ]);

    const total = outstanding.reduce((sum, c) => sum + c.totalOutstanding, 0);

    res.status(200).json({
      success: true,
      count: outstanding.length,
      totalOutstanding: total,
      customers: outstanding.map(c => ({
        customer: c._id.customer,
        name: c._id.customerName,
        phone: c._id.customerPhone,
        outstanding: c.totalOutstanding,
        invoiceCount: c.invoiceCount
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get stock ledger report
// @route   GET /api/billing/reports/stock-ledger
// @access  Private/Admin
exports.getStockLedgerReport = async (req, res) => {
  try {
    const { itemType, itemId, startDate, endDate, page = 1, limit = 100 } = req.query;

    const query = {};
    if (itemType) query.itemType = itemType;
    if (itemId) {
      if (itemType === 'RawMaterial') {
        query.rawMaterial = itemId;
      } else {
        query.product = itemId;
      }
    }
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
