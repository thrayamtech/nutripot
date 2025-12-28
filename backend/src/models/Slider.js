const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  cta: {
    type: String,
    required: true,
    default: 'Shop Now'
  },
  link: {
    type: String,
    required: true,
    default: '/products'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for sorting by order
sliderSchema.index({ order: 1 });

module.exports = mongoose.model('Slider', sliderSchema);