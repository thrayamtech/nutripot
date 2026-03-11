import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaTimes, FaHeart, FaPhone, FaEnvelope, FaWhatsapp, FaChevronDown, FaLeaf } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../utils/api';
import { trackSearch } from '../utils/metaPixel';

const Navbar = ({ onCartOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const categoryMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      trackSearch(searchQuery);
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Top Bar - Nature-themed */}
      <div className="bg-gradient-to-r from-[#1a431c] via-[#2d7d32] to-[#1a431c] text-white py-2 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center text-xs font-light tracking-wide">
            <div className="flex items-center space-x-4">
              <a href="mailto:info@nutripot.in" className="flex items-center hover:text-green-200 transition-colors duration-300">
                <FaEnvelope className="mr-1.5 text-green-300" />
                <span className="hidden sm:inline">info@nutripot.in</span>
              </a>
              <a href="tel:+918807259471" className="flex items-center hover:text-green-200 transition-colors duration-300">
                <FaPhone className="mr-1.5 text-green-300" />
                +91 88072 59471
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="https://wa.me/918807259471" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-green-200 transition-colors duration-300">
                <FaWhatsapp className="mr-1.5 text-green-300" />
                <span className="hidden md:inline">WhatsApp</span>
              </a>
              <span className="hidden md:inline font-medium text-green-100">
                <FaLeaf className="inline mr-1 text-green-300" />
                100% Natural &amp; Organic Products
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`bg-white sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-xl' : 'shadow-md'}`}>
        {/* Thin green accent line at top */}
        <div className="h-0.5 bg-gradient-to-r from-[#f77c1c] via-[#2d7d32] to-[#f77c1c]" />

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">

            {/* Left: Logo + Nav Links */}
            <div className="hidden lg:flex items-center space-x-8">
              {/* Logo */}
              <Link to="/" className="flex items-center flex-shrink-0 mr-2 group">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src="/logo.png"
                      alt="NutriPot Logo"
                      className="w-14 h-14 object-contain transform group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    {/* Fallback Logo */}
                    <div className="w-14 h-14 bg-gradient-to-br from-[#2d7d32] to-[#1a431c] rounded-xl shadow-lg items-center justify-center transform group-hover:scale-105 transition-transform duration-300 hidden">
                      <FaLeaf className="text-white text-2xl" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-display font-bold text-[#1a431c] leading-tight tracking-wide">
                      NutriPot
                    </span>
                    <span className="text-[10px] font-semibold text-[#f77c1c] tracking-[0.2em] uppercase leading-tight">
                      Pure Natural Goodness
                    </span>
                  </div>
                </div>
              </Link>

              {/* Nav Menu */}
              <div className="flex items-center space-x-1 border-l border-gray-200 pl-8">
                <Link to="/" className="px-3 py-2 text-gray-700 hover:text-[#2d7d32] font-semibold transition-colors duration-300 text-sm rounded-lg hover:bg-green-50">
                  Home
                </Link>
                <Link to="/products" className="px-3 py-2 text-gray-700 hover:text-[#2d7d32] font-semibold transition-colors duration-300 text-sm rounded-lg hover:bg-green-50">
                  Shop
                </Link>

                {/* Categories Dropdown */}
                <div
                  className="relative"
                  ref={categoryMenuRef}
                  onMouseEnter={() => setShowCategoriesMenu(true)}
                  onMouseLeave={() => setShowCategoriesMenu(false)}
                >
                  <button className="px-3 py-2 text-gray-700 hover:text-[#2d7d32] font-semibold transition-colors duration-300 flex items-center space-x-1 text-sm rounded-lg hover:bg-green-50">
                    <span>Categories</span>
                    <FaChevronDown className={`text-xs transition-transform duration-200 ${showCategoriesMenu ? 'rotate-180' : ''}`} />
                  </button>

                  <div
                    className={`absolute left-0 mt-1 w-64 bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden transition-all duration-200 ${
                      showCategoriesMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                    }`}
                    style={{ top: '100%' }}
                  >
                    {/* Dropdown header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-[#f0faf0] to-[#faf9f7] border-b border-green-100">
                      <span className="text-xs font-bold text-[#2d7d32] tracking-wider uppercase flex items-center gap-1.5">
                        <FaLeaf className="text-[#f77c1c]" /> Browse Categories
                      </span>
                    </div>
                    <div className="py-2 max-h-80 overflow-y-auto custom-scrollbar">
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <Link
                            key={category._id}
                            to={`/products?category=${category._id}`}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-[#2d7d32] transition-colors duration-200 group"
                            onClick={() => setShowCategoriesMenu(false)}
                          >
                            <span className="w-2 h-2 rounded-full bg-[#2d7d32] mr-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {category.name}
                          </Link>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">No categories available</div>
                      )}
                    </div>
                  </div>
                </div>

                <Link to="/about" className="px-3 py-2 text-gray-700 hover:text-[#2d7d32] font-semibold transition-colors duration-300 text-sm rounded-lg hover:bg-green-50">
                  About
                </Link>
                <Link to="/contact" className="px-3 py-2 text-gray-700 hover:text-[#2d7d32] font-semibold transition-colors duration-300 text-sm rounded-lg hover:bg-green-50">
                  Contact
                </Link>
              </div>
            </div>

            {/* Mobile Logo */}
            <Link to="/" className="flex lg:hidden items-center group">
              <img
                src="/logo.png"
                alt="NutriPot"
                className="w-11 h-11 object-contain mr-2"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="flex flex-col">
                <span className="text-base font-display font-bold text-[#1a431c] leading-tight">NutriPot</span>
                <span className="text-[9px] font-semibold text-[#f77c1c] tracking-wider uppercase">Natural Goodness</span>
              </div>
            </Link>

            {/* Right: Search, Wishlist, Cart, User */}
            <div className="hidden lg:flex items-center space-x-2">
              {/* Search */}
              {showSearchBar ? (
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search natural products..."
                    className="w-48 px-4 py-2 pr-10 border-2 border-[#2d7d32]/30 rounded-full focus:outline-none focus:border-[#2d7d32] focus:w-64 transition-all duration-300 text-sm bg-green-50/50"
                    autoFocus
                    onBlur={() => !searchQuery && setShowSearchBar(false)}
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2d7d32]">
                    <FaSearch className="text-sm" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearchBar(true)}
                  className="p-2.5 text-gray-600 hover:text-[#2d7d32] hover:bg-green-50 rounded-full transition-all duration-300"
                >
                  <FaSearch className="text-lg" />
                </button>
              )}

              {/* Wishlist */}
              {isAuthenticated && (
                <Link to="/wishlist" className="p-2.5 text-gray-600 hover:text-[#e86010] hover:bg-orange-50 rounded-full transition-all duration-300 relative">
                  <FaHeart className="text-lg" />
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={onCartOpen}
                className="p-2.5 text-gray-600 hover:text-[#2d7d32] hover:bg-green-50 rounded-full transition-all duration-300 relative"
              >
                <FaShoppingCart className="text-lg" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#2d7d32] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-md animate-pulse-green">
                    {getCartCount()}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div
                className="relative"
                ref={userMenuRef}
                onMouseEnter={() => setShowUserMenu(true)}
                onMouseLeave={() => setShowUserMenu(false)}
              >
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2 cursor-pointer group">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2d7d32] to-[#1a431c] flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white group-hover:ring-green-200 transition-all duration-300">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden xl:block">
                      <p className="text-sm font-bold text-gray-800 group-hover:text-[#2d7d32] transition-colors leading-tight">
                        {user?.name?.split(' ')[0]}
                      </p>
                      <p className="text-xs text-gray-500">My Account</p>
                    </div>
                    <FaChevronDown className="text-xs text-gray-400 group-hover:text-[#2d7d32] transition-all" />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#2d7d32] to-[#1e6623] hover:from-[#1e6623] hover:to-[#1a431c] text-white rounded-full cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg">
                    <FaUser className="text-sm" />
                    <span className="font-bold text-sm">Login</span>
                  </div>
                )}

                {/* User Dropdown */}
                <div
                  className={`absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden transition-all duration-300 transform ${
                    showUserMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-3'
                  }`}
                  style={{ top: '100%' }}
                >
                  {isAuthenticated ? (
                    <>
                      <div className="px-5 py-4 bg-gradient-to-br from-[#f0faf0] to-white border-b border-green-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2d7d32] to-[#1a431c] flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        {[
                          { to: '/profile', icon: <FaUser />, label: 'My Profile' },
                          { to: '/orders', icon: <FaShoppingCart />, label: 'My Orders' },
                          { to: '/wishlist', icon: <FaHeart />, label: 'My Wishlist' },
                        ].map(({ to, icon, label }) => (
                          <Link
                            key={to}
                            to={to}
                            className="flex items-center px-5 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-[#2d7d32] transition-all duration-200 group"
                          >
                            <span className="mr-3 text-gray-400 group-hover:text-[#2d7d32] transition-colors">{icon}</span>
                            <span className="font-medium">{label}</span>
                          </Link>
                        ))}
                        {isAdmin && (
                          <Link to="/admin" className="flex items-center px-5 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-[#2d7d32] transition-all duration-200 group">
                            <span className="mr-3">⚙️</span>
                            <span className="font-medium">Admin Dashboard</span>
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-gray-100">
                        <button
                          onClick={() => { logout(); setShowUserMenu(false); navigate('/'); }}
                          className="flex items-center w-full px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 font-semibold"
                        >
                          <span className="mr-3">🚪</span>
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-5">
                      <div className="text-center mb-4">
                        <FaLeaf className="text-3xl text-[#2d7d32] mx-auto mb-2" />
                        <p className="text-sm font-bold text-gray-800 mb-1">Welcome to NutriPot</p>
                        <p className="text-xs text-gray-500">Login to access your account</p>
                      </div>
                      <Link
                        to="/login"
                        className="block w-full px-4 py-3 text-center text-sm font-bold text-white bg-gradient-to-r from-[#2d7d32] to-[#1e6623] hover:from-[#1e6623] hover:to-[#1a431c] rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Login / Register
                      </Link>
                      <p className="text-xs text-gray-500 mt-3 text-center">Quick & easy sign-in with OTP</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-[#2d7d32] text-2xl p-2 hover:bg-green-50 rounded-lg transition-colors"
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden pb-4 px-4 bg-white border-t border-green-100 shadow-inner">
            <form onSubmit={handleSearch} className="my-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search natural products..."
                  className="w-full px-4 py-2.5 border-2 border-[#2d7d32]/20 rounded-full focus:outline-none focus:border-[#2d7d32] text-sm bg-green-50/40"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2d7d32]">
                  <FaSearch />
                </button>
              </div>
            </form>

            <div className="flex flex-col space-y-1">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'Shop' },
                { to: '/categories', label: 'Categories' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact Us' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-gray-700 hover:text-[#2d7d32] font-semibold py-2.5 px-3 rounded-xl hover:bg-green-50 transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                </Link>
              ))}

              <hr className="my-2 border-green-100" />

              <button
                onClick={() => { onCartOpen(); setIsOpen(false); }}
                className="text-left text-gray-700 hover:text-[#2d7d32] font-semibold py-2.5 px-3 rounded-xl hover:bg-green-50 transition-colors flex items-center gap-2"
              >
                <FaShoppingCart className="text-[#2d7d32]" />
                Cart {getCartCount() > 0 && `(${getCartCount()})`}
              </button>

              {isAuthenticated ? (
                <>
                  <Link to="/wishlist" className="text-gray-700 hover:text-[#2d7d32] font-semibold py-2.5 px-3 rounded-xl hover:bg-green-50 transition-colors flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <FaHeart className="text-[#e86010]" /> Wishlist
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-[#2d7d32] font-semibold py-2.5 px-3 rounded-xl hover:bg-green-50 transition-colors flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <FaUser className="text-[#2d7d32]" /> My Profile
                  </Link>
                  <Link to="/orders" className="text-gray-700 hover:text-[#2d7d32] font-semibold py-2.5 px-3 rounded-xl hover:bg-green-50 transition-colors flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <FaShoppingCart className="text-[#2d7d32]" /> My Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="text-gray-700 hover:text-[#2d7d32] font-semibold py-2.5 px-3 rounded-xl hover:bg-green-50 transition-colors" onClick={() => setIsOpen(false)}>
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setIsOpen(false); navigate('/'); }}
                    className="text-left text-red-600 hover:text-red-700 font-semibold py-2.5 px-3 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-[#2d7d32] font-semibold py-2.5 px-3 rounded-xl hover:bg-green-50 transition-colors" onClick={() => setIsOpen(false)}>Login</Link>
                  <Link to="/register" className="text-gray-700 hover:text-[#2d7d32] font-semibold py-2.5 px-3 rounded-xl hover:bg-green-50 transition-colors" onClick={() => setIsOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
