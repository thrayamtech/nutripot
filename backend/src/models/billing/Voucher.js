const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  voucherNumber: { type: String, unique: true },
  voucherType: {
    type: String,
    enum: ['Payment', 'Receipt', 'Journal', 'Expense'],
    required: true
  },
  voucherDate: { type: Date, default: Date.now },

  // For Payment Vouchers (to suppliers)
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  purchaseInvoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseInvoice'
  },

  // For Receipt Vouchers (from customers)
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  salesInvoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesInvoice'
  },

  // Common fields
  partyName: { type: String },
  amount: { type: Number, required: true, min: 0 },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Card'],
    required: true
  },
  bankDetails: {
    bankName: { type: String },
    accountNumber: { type: String },
    chequeNumber: { type: String },
    chequeDate: { type: Date },
    transactionId: { type: String }
  },

  // For Journal/Expense Vouchers
  expenseCategory: {
    type: String,
    enum: ['Rent', 'Utilities', 'Salaries', 'Office Supplies', 'Transportation',
           'Marketing', 'Maintenance', 'Insurance', 'Taxes', 'Miscellaneous']
  },
  accountHead: { type: String },

  narration: { type: String, required: true },
  status: {
    type: String,
    enum: ['Draft', 'Approved', 'Cancelled'],
    default: 'Approved'
  },
  attachments: [{ type: String }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Auto-generate voucher number based on type
voucherSchema.pre('save', async function(next) {
  if (!this.voucherNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // Prefix based on voucher type
    const prefixes = {
      'Payment': 'PV',
      'Receipt': 'RV',
      'Journal': 'JV',
      'Expense': 'EV'
    };
    const prefix = prefixes[this.voucherType];

    const count = await this.constructor.countDocuments({ voucherType: this.voucherType }) + 1;
    this.voucherNumber = `${prefix}${year}${month}${String(count).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Voucher', voucherSchema);
