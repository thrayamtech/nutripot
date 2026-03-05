const mongoose = require('mongoose');

const rawMaterialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Raw material name is required'],
    trim: true
  },
  code: {
    type: String,
    unique: true,
    required: [true, 'Raw material code is required'],
    uppercase: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RawMaterialCategory',
    required: [true, 'Category is required']
  },
  description: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['meters', 'pieces', 'kg', 'grams', 'liters', 'yards', 'rolls', 'sets', 'dozen', 'box']
  },
  currentStock: {
    type: Number,
    default: 0,
    min: 0
  },
  minimumStock: {
    type: Number,
    default: 0
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: 0
  },
  hsnCode: {
    type: String,
    trim: true
  },
  gstRate: {
    type: Number,
    default: 0,
    enum: [0, 5, 12, 18, 28]
  },
  defaultSupplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Virtual for low stock alert
rawMaterialSchema.virtual('isLowStock').get(function() {
  return this.currentStock <= this.minimumStock;
});

// Ensure virtuals are included in JSON
rawMaterialSchema.set('toJSON', { virtuals: true });
rawMaterialSchema.set('toObject', { virtuals: true });

// Index for search
rawMaterialSchema.index({ name: 'text', code: 'text', description: 'text' });

module.exports = mongoose.model('RawMaterial', rawMaterialSchema);
