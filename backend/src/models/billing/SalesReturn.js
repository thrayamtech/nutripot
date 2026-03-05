const mongoose = require('mongoose');

const salesReturnItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  returnQuantity: { type: Number, required: true, min: 1 },
  unit: { type: String, default: 'pieces' },
  rate: { type: Number, required: true },
  taxableAmount: { type: Number, default: 0 },
  gstRate: { type: Number, default: 0 },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  amount: { type: Number, required: true },
  reason: { type: String },
  condition: {
    type: String,
    enum: ['Good', 'Damaged', 'Defective'],
    default: 'Good'
  }
});

const salesReturnSchema = new mongoose.Schema({
  returnNumber: { type: String, unique: true },
  creditNoteNumber: { type: String },
  salesInvoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesInvoice',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customerDetails: {
    name: { type: String },
    phone: { type: String }
  },
  returnDate: { type: Date, default: Date.now },
  items: [salesReturnItemSchema],
  subtotal: { type: Number, required: true },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  totalGst: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  isInterState: { type: Boolean, default: false },
  refundMode: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Credit Note', 'Store Credit'],
    default: 'Credit Note'
  },
  refundDetails: {
    amount: { type: Number },
    reference: { type: String },
    date: { type: Date }
  },
  status: {
    type: String,
    enum: ['Draft', 'Confirmed', 'Refunded', 'Cancelled'],
    default: 'Draft'
  },
  stockRestored: { type: Boolean, default: false },
  notes: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Auto-generate return number
salesReturnSchema.pre('save', async function(next) {
  if (!this.returnNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.constructor.countDocuments() + 1;
    this.returnNumber = `SR${year}${month}${String(count).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('SalesReturn', salesReturnSchema);
