const mongoose = require('mongoose');

const purchaseReturnItemSchema = new mongoose.Schema({
  rawMaterial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RawMaterial',
    required: true
  },
  name: { type: String, required: true },
  code: { type: String },
  returnQuantity: { type: Number, required: true, min: 1 },
  unit: { type: String, required: true },
  rate: { type: Number, required: true },
  taxableAmount: { type: Number, default: 0 },
  gstRate: { type: Number, default: 0 },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  amount: { type: Number, required: true },
  reason: { type: String }
});

const purchaseReturnSchema = new mongoose.Schema({
  returnNumber: { type: String, unique: true },
  debitNoteNumber: { type: String },
  purchaseInvoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseInvoice',
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  returnDate: { type: Date, default: Date.now },
  items: [purchaseReturnItemSchema],
  subtotal: { type: Number, required: true },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  totalGst: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  isInterState: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['Draft', 'Confirmed', 'Adjusted', 'Cancelled'],
    default: 'Draft'
  },
  adjustmentType: {
    type: String,
    enum: ['Credit Note', 'Cash Refund', 'Adjusted Against Invoice'],
    default: 'Credit Note'
  },
  stockUpdated: { type: Boolean, default: false },
  notes: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Auto-generate return number
purchaseReturnSchema.pre('save', async function(next) {
  if (!this.returnNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.constructor.countDocuments() + 1;
    this.returnNumber = `PR${year}${month}${String(count).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('PurchaseReturn', purchaseReturnSchema);
