const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');
const { uploadToS3, deleteFromS3, extractS3Key, videoUpload } = require('../utils/s3Upload');

// Single image upload to S3
router.post('/single', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Upload to S3
    const uploadResult = await uploadToS3(req.file);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully to S3',
      file: {
        url: uploadResult.url,
        key: uploadResult.key,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Multiple images upload to S3
router.post('/multiple', protect, authorize('admin'), upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload files'
      });
    }

    // Upload all files to S3
    const uploadPromises = req.files.map(file => uploadToS3(file));
    const uploadResults = await Promise.all(uploadPromises);

    const files = uploadResults.map((result, index) => ({
      url: result.url,
      key: result.key,
      size: req.files[index].size
    }));

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully to S3',
      files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Video upload to S3 (for reels)
router.post('/', protect, authorize('admin'), videoUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a video file'
      });
    }

    // Upload to S3 in 'reels' folder
    const uploadResult = await uploadToS3(req.file, 'reels');

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully to S3',
      url: uploadResult.url,
      key: uploadResult.key,
      size: req.file.size
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete image from S3
router.delete('/delete', protect, authorize('admin'), async (req, res) => {
  try {
    const { url, key } = req.body;

    if (!url && !key) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either URL or key'
      });
    }

    // Extract key from URL if key not provided
    const s3Key = key || extractS3Key(url);

    if (!s3Key) {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL or key'
      });
    }

    // Delete from S3
    await deleteFromS3(s3Key);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully from S3'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
