/**
 * Image Helper Utility
 * Handles image URL formatting and provides fallback images
 */

// Fallback images for different types
export const FALLBACK_IMAGES = {
  product: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
  category: 'https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=800&q=80',
  slider: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=1200&q=80',
  user: 'https://ui-avatars.com/api/?background=5A0F1B&color=fff&name=User',
};

/**
 * Get proper image URL with fallback
 * @param {string} url - Original image URL
 * @param {string} type - Type of image (product, category, slider, user)
 * @returns {string} - Properly formatted URL or fallback
 */
export const getImageUrl = (url, type = 'product') => {
  // If no URL provided, return fallback
  if (!url) {
    return FALLBACK_IMAGES[type] || FALLBACK_IMAGES.product;
  }

  // If already a full URL (http/https), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If local upload path (starts with /uploads), use backend URL
  if (url.startsWith('/uploads')) {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${API_URL}${url}`;
  }

  // If S3 URL pattern (starts with products/, categories/, etc.)
  if (url.includes('/') && !url.startsWith('/')) {
    const S3_BUCKET = process.env.REACT_APP_S3_BUCKET_NAME || 'jjtrendz-s3';
    const S3_REGION = process.env.REACT_APP_AWS_REGION || 'ap-south-1';
    return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${url}`;
  }

  // If just a filename (like 'cotton-category.jpg'), try backend static endpoint
  if (!url.includes('/')) {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${API_URL}/uploads/${url}`;
  }

  // Default fallback
  return FALLBACK_IMAGES[type] || FALLBACK_IMAGES.product;
};

/**
 * Handle image load error by setting fallback
 * @param {Event} e - Image error event
 * @param {string} type - Type of image for appropriate fallback
 */
export const handleImageError = (e, type = 'product') => {
  const img = e.target;

  // Prevent infinite loop if fallback also fails
  if (img.src === FALLBACK_IMAGES[type]) {
    return;
  }

  console.warn(`Image failed to load: ${img.src}, using fallback`);
  img.src = FALLBACK_IMAGES[type] || FALLBACK_IMAGES.product;
};

/**
 * Get product image with fallback
 * @param {Object} product - Product object
 * @param {number} index - Image index (default 0)
 * @returns {string} - Image URL
 */
export const getProductImage = (product, index = 0) => {
  const imageUrl = product?.images?.[index]?.url || product?.images?.[0]?.url;
  return getImageUrl(imageUrl, 'product');
};

/**
 * Get category image with fallback
 * @param {Object} category - Category object
 * @returns {string} - Image URL
 */
export const getCategoryImage = (category) => {
  return getImageUrl(category?.image, 'category');
};

/**
 * Get slider image with fallback
 * @param {Object} slider - Slider object
 * @returns {string} - Image URL
 */
export const getSliderImage = (slider) => {
  return getImageUrl(slider?.image, 'slider');
};
