const express = require('express');
const router = express.Router();
const sliderController = require('../controllers/sliderController');
const { protect, admin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure sliders directory exists
const slidersDir = path.join(__dirname, '../../uploads/sliders');
if (!fs.existsSync(slidersDir)) {
  fs.mkdirSync(slidersDir, { recursive: true });
}

// Configure multer for slider image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, slidersDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'slider-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Public routes
router.get('/active', sliderController.getActiveSliders);

// Admin routes
router.get('/', protect, admin, sliderController.getAllSliders);
router.get('/:id', protect, admin, sliderController.getSlider);
router.post('/', protect, admin, upload.single('image'), sliderController.createSlider);
router.put('/:id', protect, admin, upload.single('image'), sliderController.updateSlider);
router.delete('/:id', protect, admin, sliderController.deleteSlider);

module.exports = router;
