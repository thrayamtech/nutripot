/**
 * SEO Utility for Thrayam Threads
 * Manages dynamic meta tags, structured data, and page titles
 * No external dependencies required
 */

const SITE_NAME = 'Thrayam Threads';
const SITE_URL = 'https://thrayamthreads.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

/**
 * Update page title with brand name
 * @param {string} title - Page-specific title
 */
export const setPageTitle = (title) => {
  document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Buy Premium Silk, Cotton & Designer Sarees Online India`;
};

/**
 * Update meta description
 * @param {string} description - Page description
 */
export const setMetaDescription = (description) => {
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = description;
};

/**
 * Update canonical URL
 * @param {string} url - Canonical URL for the page
 */
export const setCanonicalUrl = (url) => {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url.startsWith('http') ? url : `${SITE_URL}${url}`;
};

/**
 * Update Open Graph tags
 * @param {Object} og - Open Graph properties
 */
export const setOpenGraphTags = (og) => {
  const ogTags = {
    'og:title': og.title || document.title,
    'og:description': og.description || '',
    'og:image': og.image || DEFAULT_IMAGE,
    'og:url': og.url || window.location.href,
    'og:type': og.type || 'website',
  };

  Object.entries(ogTags).forEach(([property, content]) => {
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('property', property);
      document.head.appendChild(tag);
    }
    tag.content = content;
  });
};

/**
 * Update Twitter Card tags
 * @param {Object} twitter - Twitter Card properties
 */
export const setTwitterTags = (twitter) => {
  const twitterTags = {
    'twitter:title': twitter.title || document.title,
    'twitter:description': twitter.description || '',
    'twitter:image': twitter.image || DEFAULT_IMAGE,
  };

  Object.entries(twitterTags).forEach(([name, content]) => {
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.name = name;
      document.head.appendChild(tag);
    }
    tag.content = content;
  });
};

/**
 * Add or update structured data (JSON-LD)
 * @param {Object} data - Structured data object
 * @param {string} id - Unique ID for the script tag
 */
export const setStructuredData = (data, id = 'page-structured-data') => {
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
};

/**
 * Generate Product structured data
 * @param {Object} product - Product object
 * @returns {Object} - JSON-LD structured data
 */
export const generateProductSchema = (product) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.map(img => img.url || img) || [],
    sku: product._id,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME
    },
    category: product.category?.name || 'Sarees',
    material: product.fabric || 'Premium Fabric',
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product._id}`,
      priceCurrency: 'INR',
      price: product.discountPrice || product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME
      }
    },
    aggregateRating: product.numReviews > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating || 4.5,
      reviewCount: product.numReviews
    } : undefined
  };
};

/**
 * Generate Breadcrumb structured data
 * @param {Array} items - Array of breadcrumb items [{name, url}]
 * @returns {Object} - JSON-LD structured data
 */
export const generateBreadcrumbSchema = (items) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`
    }))
  };
};

/**
 * Generate Collection/Category page structured data
 * @param {Object} category - Category object
 * @param {Array} products - Products in the category
 * @returns {Object} - JSON-LD structured data
 */
export const generateCollectionSchema = (category, products = []) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name || 'Sarees Collection',
    description: category.description || `Shop ${category.name} at ${SITE_NAME}`,
    url: `${SITE_URL}/products?category=${category._id}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          url: `${SITE_URL}/products/${product._id}`,
          image: product.images?.[0]?.url || product.images?.[0],
          offers: {
            '@type': 'Offer',
            price: product.discountPrice || product.price,
            priceCurrency: 'INR'
          }
        }
      }))
    }
  };
};

/**
 * Generate LocalBusiness structured data
 * @returns {Object} - JSON-LD structured data
 */
export const generateLocalBusinessSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': `${SITE_URL}/#store`,
    name: SITE_NAME,
    description: 'Premium handcrafted sarees - silk, cotton, designer & bridal sarees online in India',
    url: SITE_URL,
    telephone: '+91-XXXXXXXXXX',
    email: 'info@thrayamthreads.com',
    priceRange: '₹₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, Credit Card, Debit Card, UPI, Net Banking',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '19:00'
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN'
    }
  };
};

/**
 * Complete SEO setup for a page
 * @param {Object} config - SEO configuration
 */
export const setSEO = (config) => {
  const {
    title,
    description,
    url,
    image,
    type = 'website',
    structuredData
  } = config;

  // Set page title
  setPageTitle(title);

  // Set meta description
  if (description) {
    setMetaDescription(description);
  }

  // Set canonical URL
  if (url) {
    setCanonicalUrl(url);
  }

  // Set Open Graph tags
  setOpenGraphTags({
    title: title ? `${title} | ${SITE_NAME}` : undefined,
    description,
    url,
    image,
    type
  });

  // Set Twitter tags
  setTwitterTags({
    title: title ? `${title} | ${SITE_NAME}` : undefined,
    description,
    image
  });

  // Set structured data
  if (structuredData) {
    setStructuredData(structuredData);
  }
};

/**
 * SEO configurations for common pages
 */
export const PAGE_SEO = {
  home: {
    title: null, // Uses default
    description: 'Shop premium handcrafted sarees at Thrayam Threads. Explore our exclusive collection of silk sarees, cotton sarees, designer sarees, bridal sarees & handloom sarees. Free shipping across India.',
    url: '/'
  },
  products: {
    title: 'Shop All Sarees',
    description: 'Browse our complete collection of premium sarees. Filter by silk, cotton, designer, bridal, and handloom sarees. Best prices with free shipping across India.',
    url: '/products'
  },
  about: {
    title: 'About Us',
    description: 'Learn about Thrayam Threads - your trusted destination for premium handcrafted sarees. Discover our story, values, and commitment to quality Indian sarees.',
    url: '/about'
  },
  contact: {
    title: 'Contact Us',
    description: 'Get in touch with Thrayam Threads. We are here to help with your saree queries, orders, and styling advice. Contact us via phone, email, or WhatsApp.',
    url: '/contact'
  },
  blogs: {
    title: 'Saree Blog & Style Guide',
    description: 'Explore saree styling tips, fashion trends, fabric guides, and occasion wear advice on the Thrayam Threads blog.',
    url: '/blogs'
  }
};

/**
 * Generate SEO-friendly alt text for product images
 * @param {Object} product - Product object
 * @param {number} index - Image index
 * @returns {string} - Alt text
 */
export const generateProductAltText = (product, index = 0) => {
  const parts = [product.name];

  if (product.fabric) {
    parts.push(product.fabric);
  }

  if (product.category?.name) {
    parts.push(product.category.name);
  }

  if (product.colors?.[0]?.name) {
    parts.push(product.colors[0].name);
  }

  const suffix = index > 0 ? ` - View ${index + 1}` : '';

  return `${parts.join(' - ')}${suffix} | ${SITE_NAME}`;
};

const seoUtils = {
  setSEO,
  setPageTitle,
  setMetaDescription,
  setCanonicalUrl,
  setOpenGraphTags,
  setTwitterTags,
  setStructuredData,
  generateProductSchema,
  generateBreadcrumbSchema,
  generateCollectionSchema,
  generateLocalBusinessSchema,
  generateProductAltText,
  PAGE_SEO
};

export default seoUtils;
