const mongoose = require('mongoose');

const stockLedgerSchema = new mongoose.Schema({
  transactionDate: { type: Date, default: Date.now },
  transactionType: {
    type: String,
    enum: ['GRN', 'Purchase Return', 'Production Consumption', 'Production Output',
           'Sales', 'Sales Return', 'Stock Adjustment', 'Opening Stock'],
    required: true
  },
  referenceNumber: { type: String, required: true },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  // For raw materials
  rawMaterial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RawMaterial'
  },

  // For finished products
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },

  itemType: {
    type: String,
    enum: ['RawMaterial', 'Product'],
    required: true
  },
  itemName: { type: String, required: true },
  itemCode: { type: String },
  unit: { type: String, required: true },

  inQuantity: { type: Number, default: 0 },
  outQuantity: { type: Number, default: 0 },
  balanceQuantity: { type: Number, required: true },

  rate: { type: Number },
  value: { type: Number },

  warehouse: { type: String, default: 'Main' },
  batchNumber: { type: String },
  remarks: { type: String },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Indexes for efficient querying
stockLedgerSchema.index({ rawMaterial: 1, transactionDate: -1 });
stockLedgerSchema.index({ product: 1, transactionDate: -1 });
stockLedgerSchema.index({ transactionType: 1 });
stockLedgerSchema.index({ referenceNumber: 1 });

module.exports = mongoose.model('StockLedger', stockLedgerSchema);
