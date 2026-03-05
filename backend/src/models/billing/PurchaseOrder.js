const mongoose = require('mongoose');

const purchaseOrderItemSchema = new mongoose.Schema({
  rawMaterial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RawMaterial',
    required: true
  },
  name: { type: String, required: true },
  code: { type: String },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: { type: String, required: true },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'amount'],
    default: 'percentage'
  },
  taxableAmount: { type: Number, default: 0 },
  gstRate: { type: Number, default: 0 },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  amount: { type: Number, required: true }
});

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    unique: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier is required']
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  expectedDeliveryDate: { type: Date },
  items: [purchaseOrderItemSchema],
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
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Partially Received', 'Fully Received', 'Cancelled'],
    default: 'Draft'
  },
  notes: { type: String },
  terms: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Auto-generate PO number
purchaseOrderSchema.pre('save', async function(next) {
  if (!this.poNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.constructor.countDocuments() + 1;
    this.poNumber = `PO${year}${month}${String(count).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
