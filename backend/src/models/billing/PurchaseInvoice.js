const mongoose = require('mongoose');

const purchaseInvoiceItemSchema = new mongoose.Schema({
  rawMaterial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RawMaterial',
    required: true
  },
  name: { type: String, required: true },
  code: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  receivedQuantity: { type: Number, default: 0 },
  unit: { type: String, required: true },
  rate: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['percentage', 'amount'], default: 'percentage' },
  taxableAmount: { type: Number, default: 0 },
  gstRate: { type: Number, default: 0 },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  amount: { type: Number, required: true }
});

const paymentHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Card'],
    required: true
  },
  reference: { type: String },
  date: { type: Date, default: Date.now },
  notes: { type: String }
});

const purchaseInvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  supplierInvoiceNumber: { type: String },
  supplierInvoiceDate: { type: Date },
  purchaseOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder'
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier is required']
  },
  invoiceDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  items: [purchaseInvoiceItemSchema],
  subtotal: { type: Number, required: true },
  totalDiscount: { type: Number, default: 0 },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  totalGst: { type: Number, default: 0 },
  otherCharges: { type: Number, default: 0 },
  roundOff: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  isInterState: { type: Boolean, default: false },
  paidAmount: { type: Number, default: 0 },
  balanceAmount: { type: Number },
  paymentHistory: [paymentHistorySchema],
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Paid'],
    default: 'Unpaid'
  },
  status: {
    type: String,
    enum: ['Draft', 'Confirmed', 'Cancelled'],
    default: 'Draft'
  },
  grnGenerated: { type: Boolean, default: false },
  notes: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Auto-generate invoice number
purchaseInvoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.constructor.countDocuments() + 1;
    this.invoiceNumber = `PI${year}${month}${String(count).padStart(4, '0')}`;
  }
  // Calculate balance
  this.balanceAmount = this.totalAmount - this.paidAmount;
  // Update payment status
  if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'Paid';
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'Partially Paid';
  } else {
    this.paymentStatus = 'Unpaid';
  }
  next();
});

module.exports = mongoose.model('PurchaseInvoice', purchaseInvoiceSchema);
