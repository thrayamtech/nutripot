const mongoose = require('mongoose');

const productionConsumptionSchema = new mongoose.Schema({
  rawMaterial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RawMaterial',
    required: true
  },
  name: { type: String, required: true },
  code: { type: String },
  plannedQuantity: { type: Number, required: true },
  actualQuantity: { type: Number, default: 0 },
  unit: { type: String, required: true },
  costPerUnit: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 }
});

const productionOrderSchema = new mongoose.Schema({
  productionNumber: { type: String, unique: true },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  productName: { type: String, required: true },
  bom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BOM',
    required: [true, 'BOM is required']
  },
  plannedQuantity: { type: Number, required: true, min: 1 },
  completedQuantity: { type: Number, default: 0 },
  rejectedQuantity: { type: Number, default: 0 },
  consumption: [productionConsumptionSchema],
  startDate: { type: Date },
  completionDate: { type: Date },
  expectedCompletionDate: { type: Date },
  status: {
    type: String,
    enum: ['Draft', 'Planned', 'In Progress', 'Completed', 'Partially Completed', 'Cancelled'],
    default: 'Draft'
  },
  laborCost: { type: Number, default: 0 },
  overheadCost: { type: Number, default: 0 },
  totalMaterialCost: { type: Number, default: 0 },
  totalProductionCost: { type: Number, default: 0 },
  costPerUnit: { type: Number, default: 0 },
  materialsConsumed: { type: Boolean, default: false },
  finishedGoodsAdded: { type: Boolean, default: false },
  notes: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Auto-generate production number
productionOrderSchema.pre('save', async function(next) {
  if (!this.productionNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.constructor.countDocuments() + 1;
    this.productionNumber = `PROD${year}${month}${String(count).padStart(4, '0')}`;
  }

  // Calculate total costs
  let materialCost = 0;
  this.consumption.forEach(item => {
    item.totalCost = item.actualQuantity * item.costPerUnit;
    materialCost += item.totalCost;
  });

  this.totalMaterialCost = Math.round(materialCost * 100) / 100;
  this.totalProductionCost = Math.round((materialCost + this.laborCost + this.overheadCost) * 100) / 100;

  if (this.completedQuantity > 0) {
    this.costPerUnit = Math.round((this.totalProductionCost / this.completedQuantity) * 100) / 100;
  }

  next();
});

module.exports = mongoose.model('ProductionOrder', productionOrderSchema);
