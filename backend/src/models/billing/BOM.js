const mongoose = require('mongoose');

const bomItemSchema = new mongoose.Schema({
  rawMaterial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RawMaterial',
    required: true
  },
  name: { type: String, required: true },
  code: { type: String },
  requiredQuantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  wastagePercentage: { type: Number, default: 0, min: 0, max: 100 },
  effectiveQuantity: { type: Number }, // requiredQuantity + wastage
  costPerUnit: { type: Number, default: 0 }
});

const bomSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  bomCode: { type: String, unique: true },
  name: { type: String, required: true },
  version: { type: Number, default: 1 },
  items: [bomItemSchema],
  laborCost: { type: Number, default: 0 },
  overheadCost: { type: Number, default: 0 },
  totalMaterialCost: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  outputQuantity: { type: Number, default: 1, min: 1 },
  unit: { type: String, default: 'pieces' },
  notes: { type: String },
  isActive: { type: Boolean, default: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Auto-generate BOM code and calculate costs
bomSchema.pre('save', async function(next) {
  // Generate BOM code
  if (!this.bomCode) {
    const count = await this.constructor.countDocuments() + 1;
    this.bomCode = `BOM${String(count).padStart(5, '0')}`;
  }

  // Calculate effective quantity and material cost
  let materialCost = 0;
  this.items.forEach(item => {
    item.effectiveQuantity = item.requiredQuantity * (1 + item.wastagePercentage / 100);
    if (item.costPerUnit) {
      materialCost += item.effectiveQuantity * item.costPerUnit;
    }
  });

  this.totalMaterialCost = Math.round(materialCost * 100) / 100;
  this.totalCost = Math.round((materialCost + this.laborCost + this.overheadCost) * 100) / 100;

  next();
});

module.exports = mongoose.model('BOM', bomSchema);
