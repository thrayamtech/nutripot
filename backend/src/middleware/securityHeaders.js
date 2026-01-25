/**
 * Security Headers Middleware
 * Protects against XSS, clickjacking, MIME sniffing, and other attacks
 */

const securityHeaders = (req, res, next) => {
  // HTTP Strict Transport Security (HSTS)
  // Forces HTTPS for 1 year, includes subdomains
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // X-Frame-Options - Clickjacking Protection
  // Prevents site from being embedded in iframes on other domains
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // X-Content-Type-Options - MIME Sniffing Protection
  // Prevents browser from MIME-sniffing response away from declared content-type
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection - Legacy XSS Filter
  // Enables browser's built-in XSS filter (for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy - Controls referrer information
  // Sends referrer only for same-origin, strips on cross-origin
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Cross-Origin-Opener-Policy (COOP) - Origin Isolation
  // Isolates browsing context to same-origin documents
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

  // Cross-Origin-Resource-Policy (CORP)
  // Controls which origins can load this resource
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');

  // Permissions-Policy (formerly Feature-Policy)
  // Controls browser features available to the page
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(self)'
  );

  // Content-Security-Policy (CSP) - XSS Protection
  // Defines trusted sources for content loading
  const cspDirectives = [
    // Default fallback for all resource types
    "default-src 'self'",

    // JavaScript sources
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://www.facebook.com https://www.googletagmanager.com https://www.google-analytics.com https://api.razorpay.com https://checkout.razorpay.com",

    // CSS sources
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

    // Font sources
    "font-src 'self' https://fonts.gstatic.com data:",

    // Image sources (allowing data: for inline images, blob: for canvas, https: for external)
    "img-src 'self' data: blob: https: http:",

    // API/XHR/WebSocket connections
    "connect-src 'self' https://*.amazonaws.com https://api.razorpay.com https://lumberjack.razorpay.com https://connect.facebook.net https://www.facebook.com https://www.google-analytics.com wss://*.razorpay.com",

    // Frame sources (for payment gateways)
    "frame-src 'self' https://api.razorpay.com https://www.facebook.com https://www.youtube.com",

    // Frame ancestors (clickjacking protection via CSP)
    "frame-ancestors 'self'",

    // Form submission targets
    "form-action 'self'",

    // Base URI restriction
    "base-uri 'self'",

    // Object/embed/applet sources
    "object-src 'none'",

    // Media sources (for videos)
    "media-src 'self' https://*.amazonaws.com blob:",

    // Worker sources
    "worker-src 'self' blob:",

    // Manifest sources
    "manifest-src 'self'",

    // Upgrade insecure requests in production
    process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests' : ''
  ].filter(Boolean).join('; ');

  res.setHeader('Content-Security-Policy', cspDirectives);

  // X-DNS-Prefetch-Control - Controls DNS prefetching
  res.setHeader('X-DNS-Prefetch-Control', 'on');

  // X-Permitted-Cross-Domain-Policies - Adobe Flash/PDF policies
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  // Cache-Control for API responses (no caching of sensitive data)
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};

module.exports = securityHeaders;
