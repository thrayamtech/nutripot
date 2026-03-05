const GRN = require('../../models/billing/GRN');
const PurchaseInvoice = require('../../models/billing/PurchaseInvoice');
const PurchaseOrder = require('../../models/billing/PurchaseOrder');
const RawMaterial = require('../../models/billing/RawMaterial');
const StockLedger = require('../../models/billing/StockLedger');

// @desc    Get all GRNs
// @route   GET /api/billing/grn
// @access  Private/Admin
exports.getGRNs = async (req, res) => {
  try {
    const { search, supplier, status, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {};
    if (search) {
      query.grnNumber = { $regex: search, $options: 'i' };
    }
    if (supplier) query.supplier = supplier;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.receivedDate = {};
      if (startDate) query.receivedDate.$gte = new Date(startDate);
      if (endDate) query.receivedDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const grns = await GRN.find(query)
      .populate('supplier', 'name code')
      .populate('purchaseInvoice', 'invoiceNumber')
      .populate('receivedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await GRN.countDocuments(query);

    res.status(200).json({
      success: true,
      count: grns.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      grns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single GRN
// @route   GET /api/billing/grn/:id
// @access  Private/Admin
exports.getGRN = async (req, res) => {
  try {
    const grn = await GRN.findById(req.params.id)
      .populate('supplier')
      .populate('purchaseInvoice')
      .populate('purchaseOrder', 'poNumber')
      .populate('items.rawMaterial', 'name code unit currentStock')
      .populate('receivedBy', 'name');

    if (!grn) {
      return res.status(404).json({
        success: false,
        message: 'GRN not found'
      });
    }

    res.status(200).json({
      success: true,
      grn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create GRN
// @route   POST /api/billing/grn
// @access  Private/Admin
exports.createGRN = async (req, res) => {
  try {
    const { purchaseInvoice: invoiceId, items } = req.body;

    // Validate purchase invoice
    const purchaseInvoice = await PurchaseInvoice.findById(invoiceId)
      .populate('supplier')
      .populate('purchaseOrder');

    if (!purchaseInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Purchase invoice not found'
      });
    }

    if (purchaseInvoice.grnGenerated) {
      return res.status(400).json({
        success: false,
        message: 'GRN already generated for this invoice'
      });
    }

    // Prepare GRN items
    const grnItems = [];
    for (let item of items) {
      const rawMaterial = await RawMaterial.findById(item.rawMaterial);
      if (!rawMaterial) {
        return res.status(404).json({
          success: false,
          message: `Raw material not found: ${item.rawMaterial}`
        });
      }

      // Find corresponding invoice item
      const invoiceItem = purchaseInvoice.items.find(
        i => i.rawMaterial.toString() === item.rawMaterial
      );

      grnItems.push({
        rawMaterial: item.rawMaterial,
        name: rawMaterial.name,
        code: rawMaterial.code,
        orderedQuantity: invoiceItem ? invoiceItem.quantity : item.receivedQuantity,
        receivedQuantity: item.receivedQuantity,
        acceptedQuantity: item.acceptedQuantity,
        rejectedQuantity: item.rejectedQuantity || 0,
        unit: rawMaterial.unit,
        rate: invoiceItem ? invoiceItem.rate : item.rate,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
        remarks: item.remarks
      });
    }

    const grn = await GRN.create({
      purchaseInvoice: invoiceId,
      purchaseOrder: purchaseInvoice.purchaseOrder?._id,
      supplier: purchaseInvoice.supplier._id,
      receivedDate: req.body.receivedDate || new Date(),
      items: grnItems,
      receivedBy: req.user._id,
      inspectedBy: req.body.inspectedBy,
      vehicleNumber: req.body.vehicleNumber,
      challanNumber: req.body.challanNumber,
      notes: req.body.notes
    });

    const populatedGRN = await GRN.findById(grn._id)
      .populate('supplier', 'name code')
      .populate('purchaseInvoice', 'invoiceNumber')
      .populate('items.rawMaterial', 'name code');

    res.status(201).json({
      success: true,
      message: 'GRN created successfully',
      grn: populatedGRN
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Confirm GRN and update stock
// @route   PUT /api/billing/grn/:id/confirm
// @access  Private/Admin
exports.confirmGRN = async (req, res) => {
  try {
    const grn = await GRN.findById(req.params.id)
      .populate('purchaseInvoice')
      .populate('purchaseOrder');

    if (!grn) {
      return res.status(404).json({
        success: false,
        message: 'GRN not found'
      });
    }

    if (grn.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft GRN can be confirmed'
      });
    }

    // Update raw material stock and create stock ledger entries
    for (const item of grn.items) {
      if (item.acceptedQuantity > 0) {
        const rawMaterial = await RawMaterial.findById(item.rawMaterial);
        const newStock = rawMaterial.currentStock + item.acceptedQuantity;

        await RawMaterial.findByIdAndUpdate(item.rawMaterial, {
          currentStock: newStock
        });

        // Create stock ledger entry
        await StockLedger.create({
          transactionType: 'GRN',
          referenceNumber: grn.grnNumber,
          referenceId: grn._id,
          rawMaterial: item.rawMaterial,
          itemType: 'RawMaterial',
          itemName: item.name,
          itemCode: item.code,
          unit: item.unit,
          inQuantity: item.acceptedQuantity,
          outQuantity: 0,
          balanceQuantity: newStock,
          rate: item.rate,
          value: item.acceptedQuantity * item.rate,
          batchNumber: item.batchNumber,
          remarks: `GRN received from ${grn.supplier}`,
          createdBy: req.user._id
        });
      }
    }

    // Update GRN status
    grn.status = 'Confirmed';
    grn.stockUpdated = true;
    await grn.save();

    // Update purchase invoice
    await PurchaseInvoice.findByIdAndUpdate(grn.purchaseInvoice._id, {
      grnGenerated: true,
      status: 'Confirmed'
    });

    // Update purchase order status if linked
    if (grn.purchaseOrder) {
      const allGRNs = await GRN.find({
        purchaseOrder: grn.purchaseOrder._id,
        status: 'Confirmed'
      });

      // Check if all items are received
      const poItems = grn.purchaseOrder.items;
      let fullyReceived = true;

      for (const poItem of poItems) {
        const totalReceived = allGRNs.reduce((sum, g) => {
          const grnItem = g.items.find(i => i.rawMaterial.toString() === poItem.rawMaterial.toString());
          return sum + (grnItem ? grnItem.acceptedQuantity : 0);
        }, 0);

        if (totalReceived < poItem.quantity) {
          fullyReceived = false;
          break;
        }
      }

      await PurchaseOrder.findByIdAndUpdate(grn.purchaseOrder._id, {
        status: fullyReceived ? 'Fully Received' : 'Partially Received'
      });
    }

    res.status(200).json({
      success: true,
      message: 'GRN confirmed and stock updated successfully',
      grn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete GRN
// @route   DELETE /api/billing/grn/:id
// @access  Private/Admin
exports.deleteGRN = async (req, res) => {
  try {
    const grn = await GRN.findById(req.params.id);

    if (!grn) {
      return res.status(404).json({
        success: false,
        message: 'GRN not found'
      });
    }

    if (grn.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft GRN can be deleted'
      });
    }

    await grn.deleteOne();

    res.status(200).json({
      success: true,
      message: 'GRN deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
