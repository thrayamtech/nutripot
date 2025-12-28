const Slider = require('../models/Slider');
const path = require('path');
const fs = require('fs').promises;

// Get all active sliders (public)
exports.getActiveSliders = async (req, res) => {
  try {
    const sliders = await Slider.find({ isActive: true }).sort({ order: 1 });
    res.json({
      success: true,
      sliders
    });
  } catch (error) {
    console.error('Error fetching active sliders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sliders'
    });
  }
};

// Get all sliders (admin)
exports.getAllSliders = async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ order: 1 });
    res.json({
      success: true,
      sliders
    });
  } catch (error) {
    console.error('Error fetching sliders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sliders'
    });
  }
};

// Get single slider
exports.getSlider = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found'
      });
    }
    res.json({
      success: true,
      slider
    });
  } catch (error) {
    console.error('Error fetching slider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch slider'
    });
  }
};

// Create slider
exports.createSlider = async (req, res) => {
  try {
    const { title, subtitle, description, cta, link, order, isActive } = req.body;

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/sliders/${req.file.filename}`;
    } else if (req.body.image) {
      imageUrl = req.body.image; // Allow URL input
    }

    const slider = new Slider({
      title,
      subtitle,
      description,
      image: imageUrl,
      cta: cta || 'Shop Now',
      link: link || '/products',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await slider.save();

    res.status(201).json({
      success: true,
      message: 'Slider created successfully',
      slider
    });
  } catch (error) {
    console.error('Error creating slider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create slider'
    });
  }
};

// Update slider
exports.updateSlider = async (req, res) => {
  try {
    const { title, subtitle, description, cta, link, order, isActive } = req.body;

    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found'
      });
    }

    // Update fields
    if (title) slider.title = title;
    if (subtitle) slider.subtitle = subtitle;
    if (description) slider.description = description;
    if (cta) slider.cta = cta;
    if (link) slider.link = link;
    if (order !== undefined) slider.order = order;
    if (isActive !== undefined) slider.isActive = isActive;

    // Handle image update
    if (req.file) {
      // Delete old image if it exists and is not a URL
      if (slider.image && slider.image.startsWith('/uploads/')) {
        try {
          const oldImagePath = path.join(__dirname, '../../', slider.image);
          await fs.unlink(oldImagePath);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      slider.image = `/uploads/sliders/${req.file.filename}`;
    } else if (req.body.image) {
      slider.image = req.body.image;
    }

    await slider.save();

    res.json({
      success: true,
      message: 'Slider updated successfully',
      slider
    });
  } catch (error) {
    console.error('Error updating slider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update slider'
    });
  }
};

// Delete slider
exports.deleteSlider = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found'
      });
    }

    // Delete image if it exists and is not a URL
    if (slider.image && slider.image.startsWith('/uploads/')) {
      try {
        const imagePath = path.join(__dirname, '../../', slider.image);
        await fs.unlink(imagePath);
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }

    await slider.deleteOne();

    res.json({
      success: true,
      message: 'Slider deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting slider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete slider'
    });
  }
};
