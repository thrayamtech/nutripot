import axios from 'axios';

// Use relative path like main API - works in both dev and production
const API_URL = '/api';

/**
 * Analytics Utility
 * Tracks user behavior, location, and interests
 */
class AnalyticsService {
  constructor() {
    this.sessionId = null;
    this.currentPageStartTime = null;
    this.currentProductStartTime = null;
    this.currentProductId = null;
    this.isInitialized = false;
  }

  /**
   * Initialize analytics session
   */
  async init() {
    if (this.isInitialized) return;

    try {
      // Get or create session ID
      this.sessionId = this.getSessionId();

      // Get referrer info
      const referrer = this.getReferrerInfo();

      // Initialize session with backend
      const response = await axios.post(`${API_URL}/analytics/session/init`, {
        sessionId: this.sessionId,
        referrer
      });

      if (response.data.success) {
        this.sessionId = response.data.sessionId;
        this.saveSessionId(this.sessionId);
        this.isInitialized = true;

        // Store location info
        if (response.data.location) {
          localStorage.setItem('userLocation', JSON.stringify(response.data.location));
        }

        // Setup beforeunload listener to end session
        window.addEventListener('beforeunload', () => this.endSession());

        // Setup visibility change listener to track active time
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            this.handlePageLeave();
          } else {
            this.handlePageEnter();
          }
        });

        console.log('Analytics initialized');
      }
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
      // Create a fallback session ID even if backend fails
      if (!this.sessionId) {
        this.sessionId = this.generateSessionId();
        this.saveSessionId(this.sessionId);
      }
    }
  }

  /**
   * Track page view
   */
  async trackPageView(path, title) {
    try {
      // End previous page tracking if exists
      if (this.currentPageStartTime) {
        const duration = Math.floor((Date.now() - this.currentPageStartTime) / 1000);
        await axios.post(`${API_URL}/analytics/track/page`, {
          sessionId: this.sessionId,
          path: this.currentPage,
          title: this.currentPageTitle,
          duration
        });
      }

      // Start tracking new page
      this.currentPage = path;
      this.currentPageTitle = title;
      this.currentPageStartTime = Date.now();

      // Track page view without duration first
      await axios.post(`${API_URL}/analytics/track/page`, {
        sessionId: this.sessionId,
        path,
        title,
        duration: 0
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  /**
   * Track product view
   */
  async trackProductView(productId, source = 'direct') {
    try {
      // End previous product tracking if exists
      if (this.currentProductStartTime && this.currentProductId) {
        const duration = Math.floor((Date.now() - this.currentProductStartTime) / 1000);
        await axios.post(`${API_URL}/analytics/track/product`, {
          sessionId: this.sessionId,
          productId: this.currentProductId,
          duration,
          source: this.currentProductSource
        });
      }

      // Start tracking new product
      this.currentProductId = productId;
      this.currentProductSource = source;
      this.currentProductStartTime = Date.now();

      // Track product view without duration first
      await axios.post(`${API_URL}/analytics/track/product`, {
        sessionId: this.sessionId,
        productId,
        duration: 0,
        source
      });
    } catch (error) {
      console.error('Failed to track product view:', error);
    }
  }

  /**
   * Track user action
   */
  async trackAction(actionType, target, metadata = {}) {
    try {
      await axios.post(`${API_URL}/analytics/track/action`, {
        sessionId: this.sessionId,
        actionType,
        target,
        metadata
      });
    } catch (error) {
      console.error('Failed to track action:', error);
    }
  }

  /**
   * Track add to cart
   */
  async trackAddToCart(productId, productName, quantity) {
    return this.trackAction('add_to_cart', productId, {
      productName,
      quantity
    });
  }

  /**
   * Track search
   */
  async trackSearch(query, resultsCount) {
    return this.trackAction('search', query, {
      resultsCount
    });
  }

  /**
   * Track filter usage
   */
  async trackFilter(filterType, filterValue) {
    return this.trackAction('filter', filterType, {
      value: filterValue
    });
  }

  /**
   * Track checkout start
   */
  async trackCheckout(orderValue, itemCount) {
    return this.trackAction('checkout', 'checkout_started', {
      orderValue,
      itemCount
    });
  }

  /**
   * Track purchase
   */
  async trackPurchase(orderId, orderValue, itemCount) {
    return this.trackAction('purchase', orderId, {
      orderValue,
      itemCount
    });
  }

  /**
   * End current session
   */
  async endSession() {
    try {
      if (!this.sessionId) return;

      // Track final page duration
      if (this.currentPageStartTime) {
        const duration = Math.floor((Date.now() - this.currentPageStartTime) / 1000);
        await axios.post(`${API_URL}/analytics/track/page`, {
          sessionId: this.sessionId,
          path: this.currentPage,
          title: this.currentPageTitle,
          duration
        });
      }

      // Track final product duration
      if (this.currentProductStartTime && this.currentProductId) {
        const duration = Math.floor((Date.now() - this.currentProductStartTime) / 1000);
        await axios.post(`${API_URL}/analytics/track/product`, {
          sessionId: this.sessionId,
          productId: this.currentProductId,
          duration,
          source: this.currentProductSource
        });
      }

      // End session
      await axios.post(`${API_URL}/analytics/session/end`, {
        sessionId: this.sessionId
      });
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  /**
   * Get popular products by location
   */
  async getPopularByLocation(limit = 10) {
    try {
      const location = this.getUserLocation();
      const response = await axios.get(`${API_URL}/analytics/popular/location`, {
        params: {
          country: location?.country,
          city: location?.city,
          limit
        }
      });

      return response.data.products || [];
    } catch (error) {
      console.error('Failed to get popular products:', error);
      return [];
    }
  }

  /**
   * Get trending products
   */
  async getTrendingProducts(hours = 24, limit = 10) {
    try {
      const response = await axios.get(`${API_URL}/analytics/trending`, {
        params: { hours, limit }
      });

      return response.data.products || [];
    } catch (error) {
      console.error('Failed to get trending products:', error);
      return [];
    }
  }

  /**
   * Get user interests (requires authentication)
   */
  async getUserInterests() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return [];

      const response = await axios.get(`${API_URL}/analytics/user/interests`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.interests || [];
    } catch (error) {
      console.error('Failed to get user interests:', error);
      return [];
    }
  }

  /**
   * Helper: Get or generate session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('analyticsSessionId');
    if (!sessionId) {
      sessionId = this.generateSessionId();
    }
    return sessionId;
  }

  /**
   * Helper: Save session ID
   */
  saveSessionId(sessionId) {
    sessionStorage.setItem('analyticsSessionId', sessionId);
  }

  /**
   * Helper: Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Helper: Get referrer information
   */
  getReferrerInfo() {
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);

    return {
      url: referrer,
      source: urlParams.get('utm_source') || this.getSourceFromReferrer(referrer),
      medium: urlParams.get('utm_medium') || 'organic',
      campaign: urlParams.get('utm_campaign') || null
    };
  }

  /**
   * Helper: Extract source from referrer URL
   */
  getSourceFromReferrer(referrer) {
    if (!referrer) return 'direct';

    if (referrer.includes('google.')) return 'google';
    if (referrer.includes('facebook.')) return 'facebook';
    if (referrer.includes('instagram.')) return 'instagram';
    if (referrer.includes('twitter.')) return 'twitter';
    if (referrer.includes('linkedin.')) return 'linkedin';

    return 'referral';
  }

  /**
   * Helper: Get stored user location
   */
  getUserLocation() {
    try {
      const location = localStorage.getItem('userLocation');
      return location ? JSON.parse(location) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Handle page leave (tab hidden)
   */
  handlePageLeave() {
    if (this.currentPageStartTime) {
      const duration = Math.floor((Date.now() - this.currentPageStartTime) / 1000);
      // Store the duration for when page becomes visible again
      this.pausedPageDuration = duration;
    }
  }

  /**
   * Handle page enter (tab visible)
   */
  handlePageEnter() {
    if (this.pausedPageDuration) {
      // Reset the start time to not count the time when page was hidden
      this.currentPageStartTime = Date.now();
      this.pausedPageDuration = null;
    }
  }
}

// Create singleton instance
const analytics = new AnalyticsService();

export default analytics;
