const mongoose = require('mongoose');

const grnItemSchema = new mongoose.Schema({
  rawMaterial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RawMaterial',
    required: true
  },
  name: { type: String, required: true },
  code: { type: String },
  orderedQuantity: { type: Number, required: true },
  receivedQuantity: { type: Number, required: true, min: 0 },
  acceptedQuantity: { type: Number, required: true, min: 0 },
  rejectedQuantity: { type: Number, default: 0 },
  unit: { type: String, required: true },
  rate: { type: Number, required: true },
  batchNumber: { type: String },
  expiryDate: { type: Date },
  remarks: { type: String }
});

const grnSchema = new mongoose.Schema({
  grnNumber: { type: String, unique: true },
  purchaseInvoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseInvoice',
    required: true
  },
  purchaseOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder'
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  receivedDate: { type: Date, default: Date.now },
  items: [grnItemSchema],
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inspectedBy: { type: String },
  vehicleNumber: { type: String },
  challanNumber: { type: String },
  status: {
    type: String,
    enum: ['Draft', 'Confirmed', 'Cancelled'],
    default: 'Draft'
  },
  stockUpdated: { type: Boolean, default: false },
  notes: { type: String }
}, { timestamps: true });

// Auto-generate GRN number
grnSchema.pre('save', async function(next) {
  if (!this.grnNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.constructor.countDocuments() + 1;
    this.grnNumber = `GRN${year}${month}${String(count).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('GRN', grnSchema);
