const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

const SITE_URL = process.env.SITE_URL || 'https://thrayamthreads.com';

/**
 * @route   GET /api/seo/sitemap.xml
 * @desc    Generate dynamic XML sitemap
 * @access  Public
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    // Fetch all active products
    const products = await Product.find({ isActive: true })
      .select('_id updatedAt')
      .lean();

    // Fetch all categories
    const categories = await Category.find({ isActive: true })
      .select('_id slug updatedAt')
      .lean();

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/products', priority: '0.9', changefreq: 'daily' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/contact', priority: '0.7', changefreq: 'monthly' },
      { url: '/blogs', priority: '0.6', changefreq: 'weekly' },
      { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
      { url: '/terms-conditions', priority: '0.3', changefreq: 'yearly' },
      { url: '/refund-policy', priority: '0.3', changefreq: 'yearly' },
      { url: '/shipping-policy', priority: '0.3', changefreq: 'yearly' },
    ];

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n';

    // Add static pages
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${SITE_URL}${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    // Add category pages
    categories.forEach(category => {
      xml += '  <url>\n';
      xml += `    <loc>${SITE_URL}/products?category=${category._id}</loc>\n`;
      xml += `    <lastmod>${new Date(category.updatedAt).toISOString()}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    // Add product pages
    products.forEach(product => {
      xml += '  <url>\n';
      xml += `    <loc>${SITE_URL}/products/${product._id}</loc>\n`;
      xml += `    <lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });

    xml += '\n</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ message: 'Error generating sitemap' });
  }
});

/**
 * @route   GET /api/seo/robots.txt
 * @desc    Serve robots.txt
 * @access  Public
 */
router.get('/robots.txt', (req, res) => {
  const robotsTxt = `# Robots.txt for Thrayam Threads
# ${SITE_URL}

User-agent: *
Allow: /
Allow: /products
Allow: /products/*
Allow: /about
Allow: /contact
Allow: /blogs

Disallow: /admin
Disallow: /admin/*
Disallow: /profile
Disallow: /orders
Disallow: /cart
Disallow: /checkout
Disallow: /login
Disallow: /register
Disallow: /wallet
Disallow: /wishlist

Sitemap: ${SITE_URL}/api/seo/sitemap.xml
`;

  res.header('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

module.exports = router;
