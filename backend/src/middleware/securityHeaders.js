/**
 * Security Headers Middleware
 * Protects against XSS, clickjacking, MIME sniffing, and other attacks
 */

const securityHeaders = (req, res, next) => {
  // Only apply full security headers to API routes
  const isApiRoute = req.path.startsWith('/api/');

  // HTTP Strict Transport Security (HSTS) - Apply to all routes
  // Forces HTTPS for 1 year, includes subdomains
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // X-Content-Type-Options - MIME Sniffing Protection (safe for all routes)
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-DNS-Prefetch-Control - Controls DNS prefetching (safe for all routes)
  res.setHeader('X-DNS-Prefetch-Control', 'on');

  // Only apply restrictive headers to API routes
  if (isApiRoute) {
    // X-Frame-Options - Clickjacking Protection
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    // X-XSS-Protection - Legacy XSS Filter
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer-Policy - Controls referrer information
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Cross-Origin-Opener-Policy (COOP) - Origin Isolation
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

    // Cross-Origin-Resource-Policy (CORP)
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');

    // Permissions-Policy (formerly Feature-Policy)
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(self), payment=(self)'
    );

    // Content-Security-Policy (CSP) - XSS Protection for API routes only
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://www.facebook.com https://www.googletagmanager.com https://www.google-analytics.com https://api.razorpay.com https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://*.amazonaws.com https://api.razorpay.com https://lumberjack.razorpay.com https://connect.facebook.net https://www.facebook.com https://www.google-analytics.com wss://*.razorpay.com",
      "frame-src 'self' https://api.razorpay.com https://www.facebook.com https://www.youtube.com",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "media-src 'self' https://*.amazonaws.com blob:",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests' : ''
    ].filter(Boolean).join('; ');

    res.setHeader('Content-Security-Policy', cspDirectives);

    // X-Permitted-Cross-Domain-Policies
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

    // Cache-Control for API responses (no caching of sensitive data)
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};

module.exports = securityHeaders;
