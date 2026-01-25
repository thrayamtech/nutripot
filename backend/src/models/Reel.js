const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  videoUrl: {
    type: String,
    required: true,
    trim: true
  },
  thumbnailUrl: {
    type: String,
    trim: true,
    default: ''
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
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
reelSchema.index({ order: 1 });
reelSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Reel', reelSchema);
