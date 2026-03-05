import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useCart } from './context/CartContext';
import analytics from './utils/analytics';
import { setCanonicalUrl, setSEO } from './utils/seo';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import CheckoutSteps from './pages/CheckoutSteps';
import Login from './pages/Login';
import UserLogin from './pages/UserLogin';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Wishlist from './pages/Wishlist';
import Wallet from './pages/Wallet';
import ReferFriend from './pages/ReferFriend';
import Categories from './pages/Categories';
import AboutUs from './pages/AboutUs';
import Blogs from './pages/Blogs';
import ContactUs from './pages/ContactUs';
import PaymentFailure from './pages/PaymentFailure';

// Policy Pages
import PrivacyPolicy from './policies/PrivacyPolicy';
import TermsConditions from './policies/TermsConditions';
import RefundPolicy from './policies/RefundPolicy';
import ShippingPolicy from './policies/ShippingPolicy';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminCategories from './pages/admin/Categories';
import AdminCoupons from './pages/admin/Coupons';
import AdminSliders from './pages/admin/Sliders';
import AdminReels from './pages/admin/Reels';
import AdminSettings from './pages/admin/Settings';
import AdminReports from './pages/admin/Reports';
import LoyaltySettings from './pages/admin/LoyaltySettings';
import ReferralTracking from './pages/admin/ReferralTracking';
import Analytics from './pages/admin/Analytics';

// Billing Pages
import BillingDashboard from './pages/admin/billing/BillingDashboard';
import Suppliers from './pages/admin/billing/Suppliers';
import RawMaterials from './pages/admin/billing/RawMaterials';
import Purchase from './pages/admin/billing/Purchase';
import Production from './pages/admin/billing/Production';
import SalesInvoices from './pages/admin/billing/SalesInvoices';
import Vouchers from './pages/admin/billing/Vouchers';
import BillingReports from './pages/admin/billing/BillingReports';

function AppContent() {
  const { isCartSidebarOpen, setIsCartSidebarOpen } = useCart();
  const location = useLocation();

  // Initialize analytics on mount
  useEffect(() => {
    analytics.init();
  }, []);

  // Track page views and set SEO on route change
  useEffect(() => {
    // SEO-optimized page titles with keywords
    const pageSEO = {
      '/': {
        title: null, // Uses default with full brand name
        description: 'Shop premium boutique fashion at JJ Trendz Official. Exclusive collection of designer kurtis, co-ords, party wear & bridal collections. Free shipping across India.'
      },
      '/products': {
        title: 'Shop All Products - Kurtis, Co-ords, Party Wear & Bridal',
        description: 'Browse our complete collection of premium boutique fashion. Filter by kurtis, co-ords, party wear, and bridal collections. Best prices with free shipping.'
      },
      '/cart': {
        title: 'Shopping Cart',
        description: 'Review your selected items and proceed to checkout. Secure payment options available.'
      },
      '/checkout': {
        title: 'Secure Checkout',
        description: 'Complete your order securely. Multiple payment options available including COD, UPI, and cards.'
      },
      '/login': {
        title: 'Login to Your Account',
        description: 'Login to your JJ Trendz account to track orders, save favorites, and enjoy exclusive offers.'
      },
      '/register': {
        title: 'Create an Account',
        description: 'Join JJ Trendz Official today. Create an account for exclusive offers, order tracking, and personalized recommendations.'
      },
      '/profile': {
        title: 'My Profile',
        description: 'Manage your JJ Trendz account, addresses, and preferences.'
      },
      '/orders': {
        title: 'My Orders',
        description: 'Track your orders and view order history.'
      },
      '/wishlist': {
        title: 'My Wishlist',
        description: 'Your saved items and favorite picks from JJ Trendz Official.'
      },
      '/wallet': {
        title: 'My Wallet',
        description: 'Manage your JJ Trendz wallet balance and rewards.'
      },
      '/refer': {
        title: 'Refer a Friend & Earn Rewards',
        description: 'Refer friends to JJ Trendz Official and earn rewards.'
      },
      '/categories': {
        title: 'Shop by Category - Fashion Collections',
        description: 'Browse by category - kurtis, co-ords, party wear, bridal, ethnic, and more.'
      },
      '/about': {
        title: 'About Us - Our Story',
        description: 'Learn about JJ Trendz Official - your trusted destination for premium boutique fashion.'
      },
      '/blogs': {
        title: 'Fashion Blog - Style Tips & Guides',
        description: 'Explore fashion styling tips, trends, fabric guides, and occasion wear advice.'
      },
      '/contact': {
        title: 'Contact Us',
        description: 'Get in touch with JJ Trendz Official. We are here to help with your fashion queries and orders.'
      },
      '/privacy-policy': {
        title: 'Privacy Policy',
        description: 'Read our privacy policy to understand how we protect your personal information.'
      },
      '/terms-conditions': {
        title: 'Terms & Conditions',
        description: 'Terms and conditions for shopping at JJ Trendz Official online store.'
      },
      '/refund-policy': {
        title: 'Refund & Return Policy',
        description: 'Our hassle-free refund and return policy for purchases at JJ Trendz Official.'
      },
      '/shipping-policy': {
        title: 'Shipping Policy',
        description: 'Free shipping across India. Learn about our delivery timelines and shipping methods.'
      }
    };

    const currentSEO = pageSEO[location.pathname];

    if (currentSEO) {
      // Set SEO for known pages
      setSEO({
        title: currentSEO.title,
        description: currentSEO.description,
        url: location.pathname
      });
    }

    // Set canonical URL for all pages
    setCanonicalUrl(location.pathname);

    // Track page view in analytics
    const title = currentSEO?.title || document.title;
    analytics.trackPageView(location.pathname, title);
  }, [location]);

  return (
    <Routes>
      {/* Admin Routes - No Navbar/Footer */}
      <Route
        path="/admin/*"
        element={
          <Routes>
            <Route
              path="/"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              }
            />
            <Route
              path="/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <AdminRoute>
                  <AdminCategories />
                </AdminRoute>
              }
            />
            <Route
              path="/coupons"
              element={
                <AdminRoute>
                  <AdminCoupons />
                </AdminRoute>
              }
            />
            <Route
              path="/sliders"
              element={
                <AdminRoute>
                  <AdminSliders />
                </AdminRoute>
              }
            />
            <Route
              path="/reels"
              element={
                <AdminRoute>
                  <AdminReels />
                </AdminRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <AdminRoute>
                  <AdminSettings />
                </AdminRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <AdminRoute>
                  <AdminReports />
                </AdminRoute>
              }
            />
            <Route
              path="/loyalty-settings"
              element={
                <AdminRoute>
                  <LoyaltySettings />
                </AdminRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <AdminRoute>
                  <Analytics />
                </AdminRoute>
              }
            />
            <Route
              path="/referral-tracking"
              element={
                <AdminRoute>
                  <ReferralTracking />
                </AdminRoute>
              }
            />
            {/* Billing Module Routes */}
            <Route
              path="/billing"
              element={
                <AdminRoute>
                  <BillingDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/billing/suppliers"
              element={
                <AdminRoute>
                  <Suppliers />
                </AdminRoute>
              }
            />
            <Route
              path="/billing/raw-materials"
              element={
                <AdminRoute>
                  <RawMaterials />
                </AdminRoute>
              }
            />
            <Route
              path="/billing/purchase"
              element={
                <AdminRoute>
                  <Purchase />
                </AdminRoute>
              }
            />
            <Route
              path="/billing/production"
              element={
                <AdminRoute>
                  <Production />
                </AdminRoute>
              }
            />
            <Route
              path="/billing/sales"
              element={
                <AdminRoute>
                  <SalesInvoices />
                </AdminRoute>
              }
            />
            <Route
              path="/billing/vouchers"
              element={
                <AdminRoute>
                  <Vouchers />
                </AdminRoute>
              }
            />
            <Route
              path="/billing/reports"
              element={
                <AdminRoute>
                  <BillingReports />
                </AdminRoute>
              }
            />
          </Routes>
        }
      />

      {/* Public Routes - With Navbar/Footer */}
      <Route
        path="/*"
        element={
          <div className="flex flex-col min-h-screen">
            <Navbar onCartOpen={() => setIsCartSidebarOpen(true)} />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/refer-friend" element={<ReferFriend />} />

                {/* Policy Pages */}
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-conditions" element={<TermsConditions />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/login" element={<UserLogin />} />
                <Route path="/admin-login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<CheckoutSteps />} />
                <Route path="/payment-failure" element={<PaymentFailure />} />

                {/* Protected Routes */}
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <PrivateRoute>
                      <Orders />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <PrivateRoute>
                      <OrderDetail />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <PrivateRoute>
                      <Wishlist />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/wallet"
                  element={
                    <PrivateRoute>
                      <Wallet />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />

            {/* Cart Sidebar */}
            <CartSidebar
              isOpen={isCartSidebarOpen}
              onClose={() => setIsCartSidebarOpen(false)}
            />
          </div>
        }
      />
    </Routes>
  );
}

export default AppContent;
