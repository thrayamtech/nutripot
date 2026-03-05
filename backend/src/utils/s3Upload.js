const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Generate unique filename
const generateFileName = (originalname, folder = 'products') => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalname);
  return `JJTrendz/${folder}/${timestamp}-${randomString}${ext}`;
};

// Upload file to S3
const uploadToS3 = async (file, folder = 'products') => {
  const fileName = generateFileName(file.originalname, folder);

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype
    // Removed ACL - bucket policy will handle public access
  };

  try {
    await s3Client.send(new PutObjectCommand(params));

    // Return the public URL
    const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;

    return {
      success: true,
      url,
      key: fileName
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error(`Failed to upload to S3: ${error.message}`);
  }
};

// Delete file from S3
const deleteFromS3 = async (key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key
  };

  try {
    await s3Client.send(new DeleteObjectCommand(params));
    return {
      success: true,
      message: 'File deleted successfully'
    };
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw new Error(`Failed to delete from S3: ${error.message}`);
  }
};

// Extract S3 key from URL
const extractS3Key = (url) => {
  if (!url) return null;

  // Handle both formats:
  // https://bucket.s3.region.amazonaws.com/key
  // https://s3.region.amazonaws.com/bucket/key

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Remove leading slash
    return pathname.startsWith('/') ? pathname.substring(1) : pathname;
  } catch (error) {
    console.error('Error extracting S3 key:', error);
    return null;
  }
};

// Multer configuration for memory storage
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
  }
};

// Multer upload instance for images
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// File filter for videos
const videoFileFilter = (req, file, cb) => {
  const allowedTypes = /mp4|webm|mov|avi|mkv|m4v/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/x-m4v'];
  const mimetype = allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('video/');

  if (extname || mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed (mp4, webm, mov, avi, mkv)'));
  }
};

// Multer upload instance for videos (100MB limit)
const videoUpload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: videoFileFilter
});

module.exports = {
  s3Client,
  uploadToS3,
  deleteFromS3,
  extractS3Key,
  upload,
  videoUpload
};
