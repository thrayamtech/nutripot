const https = require('https');
const http = require('http');

/**
 * Extract video URL from Instagram Reel URL
 * This fetches the page and extracts the video URL from meta tags
 */
const getInstagramVideoUrl = async (instagramUrl) => {
  return new Promise((resolve, reject) => {
    // Clean the URL - remove query params and ensure it ends with /
    let cleanUrl = instagramUrl.split('?')[0];
    if (!cleanUrl.endsWith('/')) {
      cleanUrl += '/';
    }

    // Add embed to get simpler page
    const embedUrl = cleanUrl.replace('/reel/', '/reel/') + '?__a=1&__d=dis';

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
      }
    };

    const protocol = cleanUrl.startsWith('https') ? https : http;

    const req = protocol.get(cleanUrl, options, (res) => {
      let data = '';

      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        getInstagramVideoUrl(res.headers.location)
          .then(resolve)
          .catch(reject);
        return;
      }

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          // Try to find video URL in meta tags
          // Look for og:video meta tag
          let videoUrl = null;

          // Pattern 1: og:video content
          const ogVideoMatch = data.match(/<meta[^>]*property="og:video"[^>]*content="([^"]+)"/i) ||
                              data.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:video"/i);
          if (ogVideoMatch) {
            videoUrl = ogVideoMatch[1].replace(/&amp;/g, '&');
          }

          // Pattern 2: video_url in JSON
          if (!videoUrl) {
            const videoUrlMatch = data.match(/"video_url"\s*:\s*"([^"]+)"/);
            if (videoUrlMatch) {
              videoUrl = videoUrlMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
            }
          }

          // Pattern 3: contentUrl in JSON-LD
          if (!videoUrl) {
            const contentUrlMatch = data.match(/"contentUrl"\s*:\s*"([^"]+)"/);
            if (contentUrlMatch) {
              videoUrl = contentUrlMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
            }
          }

          if (videoUrl) {
            resolve(videoUrl);
          } else {
            // Return null if no video found - we'll use iframe embed as fallback
            resolve(null);
          }
        } catch (error) {
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error fetching Instagram URL:', error);
      resolve(null);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve(null);
    });
  });
};

/**
 * Extract reel ID from Instagram URL
 */
const extractReelId = (url) => {
  const match = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
};

/**
 * Get embed URL for Instagram reel
 */
const getEmbedUrl = (instagramUrl) => {
  const reelId = extractReelId(instagramUrl);
  if (reelId) {
    return `https://www.instagram.com/reel/${reelId}/embed/`;
  }
  return null;
};

module.exports = {
  getInstagramVideoUrl,
  extractReelId,
  getEmbedUrl
};
