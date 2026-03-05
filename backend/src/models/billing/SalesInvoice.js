const mongoose = require('mongoose');

const salesInvoiceItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  sku: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, default: 'pieces' },
  mrp: { type: Number },
  rate: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['percentage', 'amount'], default: 'percentage' },
  taxableAmount: { type: Number, default: 0 },
  hsnCode: { type: String },
  gstRate: { type: Number, default: 0 },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  amount: { type: Number, required: true }
});

const paymentSchema = new mongoose.Schema({
  mode: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque'],
    required: true
  },
  amount: { type: Number, required: true },
  reference: { type: String },
  date: { type: Date, default: Date.now }
});

const salesInvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  // For registered customers
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // For walk-in customers
  customerDetails: {
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    address: {
      addressLine1: { type: String },
      addressLine2: { type: String },
      city: { type: String },
      state: { type: String, required: true },
      pincode: { type: String }
    },
    gstNumber: { type: String }
  },
  invoiceDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  placeOfSupply: { type: String, required: true },
  isInterState: { type: Boolean, default: false },
  items: [salesInvoiceItemSchema],
  subtotal: { type: Number, required: true },
  totalDiscount: { type: Number, default: 0 },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  totalGst: { type: Number, default: 0 },
  otherCharges: { type: Number, default: 0 },
  roundOff: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Credit', 'Multiple'],
    default: 'Cash'
  },
  payments: [paymentSchema],
  paidAmount: { type: Number, default: 0 },
  balanceAmount: { type: Number },
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
  stockDeducted: { type: Boolean, default: false },
  notes: { type: String },
  termsAndConditions: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Auto-generate invoice number
salesInvoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.constructor.countDocuments() + 1;
    this.invoiceNumber = `INV${year}${month}${String(count).padStart(4, '0')}`;
  }

  // Calculate paid amount from payments
  if (this.payments && this.payments.length > 0) {
    this.paidAmount = this.payments.reduce((sum, p) => sum + p.amount, 0);
  }

  // Calculate balance
  this.balanceAmount = this.totalAmount - this.paidAmount;

  // Update payment status
  if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'Paid';
    this.balanceAmount = 0;
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'Partially Paid';
  } else {
    this.paymentStatus = 'Unpaid';
  }

  next();
});

module.exports = mongoose.model('SalesInvoice', salesInvoiceSchema);
