// Meta Pixel Event Tracking Utility
// Pixel ID: 781947610882866

// Check if fbq is available
const fbq = (...args) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args);
  }
};

// Track page view (already auto-tracked on page load, use for SPA navigation)
export const trackPageView = () => {
  fbq('track', 'PageView');
};

// Track when user views a product
export const trackViewContent = (product) => {
  fbq('track', 'ViewContent', {
    content_name: product.name,
    content_category: product.category?.name || 'Saree',
    content_ids: [product._id],
    content_type: 'product',
    value: product.salePrice || product.price,
    currency: 'INR'
  });
};

// Track when user adds item to cart
export const trackAddToCart = (product, quantity = 1) => {
  fbq('track', 'AddToCart', {
    content_name: product.name,
    content_ids: [product._id],
    content_type: 'product',
    value: (product.salePrice || product.price) * quantity,
    currency: 'INR',
    contents: [{
      id: product._id,
      quantity: quantity,
      item_price: product.salePrice || product.price
    }]
  });
};

// Track when user initiates checkout
export const trackInitiateCheckout = (cartItems, totalValue) => {
  fbq('track', 'InitiateCheckout', {
    content_ids: cartItems.map(item => item.product?._id || item._id),
    content_type: 'product',
    value: totalValue,
    currency: 'INR',
    num_items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    contents: cartItems.map(item => ({
      id: item.product?._id || item._id,
      quantity: item.quantity,
      item_price: item.product?.salePrice || item.product?.price || item.price
    }))
  });
};

// Track when user adds payment info
export const trackAddPaymentInfo = (totalValue) => {
  fbq('track', 'AddPaymentInfo', {
    value: totalValue,
    currency: 'INR'
  });
};

// Track successful purchase
export const trackPurchase = (order) => {
  fbq('track', 'Purchase', {
    content_ids: order.items?.map(item => item.product?._id || item._id) || [],
    content_type: 'product',
    value: order.total || order.totalAmount,
    currency: 'INR',
    num_items: order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    contents: order.items?.map(item => ({
      id: item.product?._id || item._id,
      quantity: item.quantity,
      item_price: item.price
    })) || []
  });
};

// Track search
export const trackSearch = (searchQuery) => {
  fbq('track', 'Search', {
    search_string: searchQuery
  });
};

// Track when user adds to wishlist
export const trackAddToWishlist = (product) => {
  fbq('track', 'AddToWishlist', {
    content_name: product.name,
    content_ids: [product._id],
    content_type: 'product',
    value: product.salePrice || product.price,
    currency: 'INR'
  });
};

// Track registration/sign up
export const trackCompleteRegistration = () => {
  fbq('track', 'CompleteRegistration');
};

// Track contact/lead
export const trackContact = () => {
  fbq('track', 'Contact');
};

// Custom event tracking
export const trackCustomEvent = (eventName, params = {}) => {
  fbq('trackCustom', eventName, params);
};

const metaPixel = {
  trackPageView,
  trackViewContent,
  trackAddToCart,
  trackInitiateCheckout,
  trackAddPaymentInfo,
  trackPurchase,
  trackSearch,
  trackAddToWishlist,
  trackCompleteRegistration,
  trackContact,
  trackCustomEvent
};

export default metaPixel;
