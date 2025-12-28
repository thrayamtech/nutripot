import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaTimes, FaHeart, FaPhone, FaEnvelope, FaWhatsapp, FaChevronDown, FaWallet, FaGift } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../utils/api';

const Navbar = ({ onCartOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const categoryMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    fetchCategories();
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
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Premium Top Bar with Contact Info */}
      <div className="bg-gradient-to-r from-[#5A0F1B] via-[#7A1525] to-[#5A0F1B] text-white py-2 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center text-xs font-light tracking-wide">
            <div className="flex items-center space-x-4">
              <a href="mailto:[email protected]" className="flex items-center hover:text-white/80 transition-colors duration-300">
                <FaEnvelope className="mr-1.5 text-sm" />
                <span className="hidden sm:inline">[email protected]</span>
              </a>
              <a href="tel:+919744707060" className="flex items-center hover:text-white/80 transition-colors duration-300">
                <FaPhone className="mr-1.5 text-sm" />
                +91 97447 07060
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="https://wa.me/919744707060" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-white/80 transition-colors duration-300">
                <FaWhatsapp className="mr-1.5 text-sm" />
                <span className="hidden md:inline">WhatsApp</span>
              </a>
              <span className="hidden md:inline font-medium">Free Shipping on Orders Above ₹999</span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Main Navigation with Menu */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Left Side - Premium Logo & Navigation Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              {/* Premium Logo */}
              <Link to="/" className="flex items-center flex-shrink-0 mr-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#5A0F1B] via-[#7A1525] to-[#8A1F35] rounded-lg shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                    <span className="text-white font-serif font-bold text-lg">SE</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-serif font-bold bg-gradient-to-r from-[#5A0F1B] to-[#5A0F1B] bg-clip-text text-transparent tracking-wider leading-tight">
                      SAREE
                    </span>
                    <span className="text-xs font-serif font-semibold text-gray-600 tracking-widest leading-tight">
                      ELEGANCE
                    </span>
                  </div>
                </div>
              </Link>

              {/* Navigation Menu */}
              <div className="flex items-center space-x-6 border-l border-gray-200 pl-8">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-[#5A0F1B] font-medium transition-colors duration-300 text-sm"
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  className="text-gray-700 hover:text-[#5A0F1B] font-medium transition-colors duration-300 text-sm"
                >
                  Shop
                </Link>

                {/* Categories Dropdown */}
                <div
                  className="relative"
                  ref={categoryMenuRef}
                  onMouseEnter={() => setShowCategoriesMenu(true)}
                  onMouseLeave={() => setShowCategoriesMenu(false)}
                >
                  <button className="text-gray-700 hover:text-[#5A0F1B] font-medium transition-colors duration-300 flex items-center space-x-1 text-sm">
                    <span>Categories</span>
                    <FaChevronDown className="text-xs" />
                  </button>

                  {/* Categories Dropdown Menu */}
                  <div
                    className={`absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-200 ${
                      showCategoriesMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                    }`}
                    style={{ top: '100%' }}
                  >
                    <div className="py-2 max-h-96 overflow-y-auto">
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <Link
                            key={category._id}
                            to={`/products?category=${category._id}`}
                            className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-[#5A0F1B]/10 hover:text-[#5A0F1B] transition-colors duration-200"
                          >
                            {category.name}
                          </Link>
                        ))
                      ) : (
                        <div className="px-5 py-3 text-sm text-gray-500">No categories available</div>
                      )}
                    </div>
                  </div>
                </div>

                <Link
                  to="/about"
                  className="text-gray-700 hover:text-[#5A0F1B] font-medium transition-colors duration-300 text-sm"
                >
                  About
                </Link>
                <Link
                  to="/blogs"
                  className="text-gray-700 hover:text-[#5A0F1B] font-medium transition-colors duration-300 text-sm"
                >
                  Blogs
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-700 hover:text-[#5A0F1B] font-medium transition-colors duration-300 text-sm"
                >
                  Contact
                </Link>
                <Link
                  to="/refer-friend"
                  className="text-white bg-gradient-to-r from-[#5A0F1B] to-[#8A1F35] hover:from-[#6A1F2B] hover:to-[#9A2F45] px-4 py-2 rounded-full font-semibold transition-all duration-300 text-sm flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <FaGift className="text-sm" />
                  Refer & Earn
                </Link>
              </div>
            </div>

            {/* Mobile Logo */}
            <Link to="/" className="flex lg:hidden items-center">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#5A0F1B] via-[#7A1525] to-[#8A1F35] rounded-lg shadow-lg flex items-center justify-center">
                  <span className="text-white font-serif font-bold text-base">SE</span>
                </div>
                <span className="text-sm font-serif font-bold bg-gradient-to-r from-[#5A0F1B] to-[#5A0F1B] bg-clip-text text-transparent">
                  SAREE ELEGANCE
                </span>
              </div>
            </Link>

            {/* Right Side - Search, Wishlist, Cart & User Menu */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Inline Compact Search */}
              {showSearchBar ? (
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-44 px-4 py-2 pr-10 border border-[#5A0F1B]/30 rounded-full focus:outline-none focus:border-[#5A0F1B] focus:w-60 transition-all duration-300 text-sm"
                    autoFocus
                    onBlur={() => !searchQuery && setShowSearchBar(false)}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#5A0F1B] hover:text-[#8A1F35]"
                  >
                    <FaSearch className="text-sm" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearchBar(true)}
                  className="text-gray-600 hover:text-[#5A0F1B] transition-colors duration-300 p-2 hover:bg-[#5A0F1B]/10 rounded-full"
                  aria-label="Search"
                >
                  <FaSearch className="text-lg" />
                </button>
              )}

              {/* Wishlist - Only for authenticated users */}
              {isAuthenticated && (
                <Link
                  to="/wishlist"
                  className="text-gray-600 hover:text-[#5A0F1B] transition-colors duration-300 p-2 hover:bg-[#5A0F1B]/10 rounded-full relative"
                  aria-label="Wishlist"
                >
                  <FaHeart className="text-lg" />
                </Link>
              )}

              {/* Wallet - Only for authenticated users */}
              {isAuthenticated && (
                <Link
                  to="/wallet"
                  className="text-gray-600 hover:text-[#5A0F1B] transition-colors duration-300 p-2 hover:bg-[#5A0F1B]/10 rounded-full relative group"
                  aria-label="Wallet"
                  title="My Wallet & Rewards"
                >
                  <FaWallet className="text-lg" />
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[8px] rounded-full h-4 w-4 flex items-center justify-center font-bold shadow-md">
                    <FaGift className="text-[8px]" />
                  </span>
                </Link>
              )}

              {/* Cart - Always visible */}
              <button
                onClick={onCartOpen}
                className="text-gray-600 hover:text-[#5A0F1B] transition-colors duration-300 p-2 hover:bg-[#5A0F1B]/10 rounded-full relative"
                aria-label="Shopping Cart"
              >
                <FaShoppingCart className="text-lg" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#5A0F1B] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-md">
                    {getCartCount()}
                  </span>
                )}
              </button>

              {/* Modern User Account Section */}
              <div
                className="relative"
                ref={userMenuRef}
                onMouseEnter={() => setShowUserMenu(true)}
                onMouseLeave={() => setShowUserMenu(false)}
              >
                {isAuthenticated ? (
                  /* Logged In - Show Avatar with Name */
                  <div className="flex items-center space-x-2 cursor-pointer group">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5A0F1B] to-[#8A1F35] flex items-center justify-center text-white font-semibold text-sm shadow-md group-hover:shadow-lg transition-all duration-300 ring-2 ring-white group-hover:ring-[#5A0F1B]/20">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden xl:block">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-[#5A0F1B] transition-colors">
                        {user?.name?.split(' ')[0]}
                      </p>
                      <p className="text-xs text-gray-500">My Account</p>
                    </div>
                    <FaChevronDown className="text-xs text-gray-400 group-hover:text-[#5A0F1B] transition-colors" />
                  </div>
                ) : (
                  /* Not Logged In - Show Login Button */
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] hover:from-[#5A0F1B] hover:to-[#8A1F35] text-white rounded-full cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg">
                    <FaUser className="text-sm" />
                    <span className="font-semibold text-sm">Login</span>
                  </div>
                )}

                {/* Elegant Dropdown Menu */}
                <div
                  className={`absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 transform ${
                    showUserMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-3'
                  }`}
                  style={{ top: '100%' }}
                >
                  {isAuthenticated ? (
                    <>
                      {/* User Info Header */}
                      <div className="px-5 py-4 bg-gradient-to-br from-[#5A0F1B]/5 via-white to-[#5A0F1B]/5 border-b border-[#5A0F1B]/20">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5A0F1B] to-[#8A1F35] flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-[#5A0F1B]/10 hover:text-[#7A1525] transition-all duration-200 group"
                        >
                          <FaUser className="mr-3 text-gray-400 group-hover:text-[#5A0F1B]" />
                          <span className="font-medium">My Profile</span>
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-[#5A0F1B]/10 hover:text-[#7A1525] transition-all duration-200 group"
                        >
                          <FaShoppingCart className="mr-3 text-gray-400 group-hover:text-[#5A0F1B]" />
                          <span className="font-medium">My Orders</span>
                        </Link>
                        <Link
                          to="/wishlist"
                          className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-[#5A0F1B]/10 hover:text-[#7A1525] transition-all duration-200 group"
                        >
                          <FaHeart className="mr-3 text-gray-400 group-hover:text-[#5A0F1B]" />
                          <span className="font-medium">My Wishlist</span>
                        </Link>
                        <Link
                          to="/wallet"
                          className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-[#5A0F1B]/10 hover:text-[#7A1525] transition-all duration-200 group"
                        >
                          <FaWallet className="mr-3 text-gray-400 group-hover:text-[#5A0F1B]" />
                          <span className="font-medium">My Wallet & Rewards</span>
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-[#5A0F1B]/10 hover:text-[#7A1525] transition-all duration-200 group"
                          >
                            <span className="mr-3 text-gray-400 group-hover:text-[#5A0F1B]">⚙️</span>
                            <span className="font-medium">Admin Dashboard</span>
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100">
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                            navigate('/');
                          }}
                          className="flex items-center w-full px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 font-semibold group"
                        >
                          <span className="mr-3 text-red-400 group-hover:text-red-600">🚪</span>
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Not Logged In */}
                      <div className="p-5">
                        <div className="text-center mb-4">
                          <p className="text-sm font-semibold text-gray-800 mb-1">Welcome to Saree Elegance</p>
                          <p className="text-xs text-gray-600">Login or register with your mobile number</p>
                        </div>
                        <Link
                          to="/login"
                          className="block w-full px-4 py-3 text-center text-sm font-semibold text-white bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] hover:from-[#5A0F1B] hover:to-[#8A1F35] rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          Login / Register
                        </Link>
                        <p className="text-xs text-gray-500 mt-3 text-center">
                          Quick & easy sign-in with OTP
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-gray-700 hover:text-[#5A0F1B] text-2xl p-2"
              aria-label="Menu"
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden pb-4 px-4 bg-white border-t shadow-inner">
            <form onSubmit={handleSearch} className="my-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for sarees..."
                  className="w-full px-4 py-2.5 border-2 border-[#5A0F1B]/20 rounded-full focus:outline-none focus:border-[#5A0F1B] text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#5A0F1B]"
                >
                  <FaSearch />
                </button>
              </div>
            </form>
            <div className="flex flex-col space-y-1">
              <Link
                to="/"
                className="text-gray-700 hover:text-[#5A0F1B] font-medium py-2.5 px-3 rounded-lg hover:bg-[#5A0F1B]/10 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-gray-700 hover:text-[#5A0F1B] font-medium py-2.5 px-3 rounded-lg hover:bg-[#5A0F1B]/10 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Shop
              </Link>
              <Link
                to="/categories"
                className="text-gray-700 hover:text-[#5A0F1B] font-medium py-2.5 px-3 rounded-lg hover:bg-[#5A0F1B]/10 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Categories
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-[#5A0F1B] font-medium py-2.5 px-3 rounded-lg hover:bg-[#5A0F1B]/10 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                About Us
              </Link>
              <Link
                to="/blogs"
                className="text-gray-700 hover:text-[#5A0F1B] font-medium py-2.5 px-3 rounded-lg hover:bg-[#5A0F1B]/10 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Blogs
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-[#5A0F1B] font-medium py-2.5 px-3 rounded-lg hover:bg-[#5A0F1B]/10 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Contact Us
              </Link>
              <Link
                to="/refer-friend"
                className="text-white bg-gradient-to-r from-[#5A0F1B] to-[#8A1F35] font-semibold py-2.5 px-3 rounded-lg hover:from-[#6A1F2B] hover:to-[#9A2F45] transition-all duration-200 flex items-center gap-2 shadow-md"
                onClick={() => setIsOpen(false)}
              >
                <FaGift /> Refer & Earn Rewards
              </Link>

              <hr className="my-2" />

              {isAuthenticated ? (
                <>
                  <Link
                    to="/wishlist"
                    className="text-gray-700 hover:text-[#5A0F1B] font-medium py-2.5 px-3 rounded-lg hover:bg-[#5A0F1B]/10 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Wishlist
                  </Link>
                  <button
                    onClick={() => {
                      onCartOpen();
                      setIsOpen(false);
                    }}
                    className="text-left text-gray-700 hover:text-[#5A0F1B] font-medium py-2.5 px-3 rounded-lg hover:bg-[#5A0F1B]/10 transition-colors duration-200"
                  >
                    Cart ({getCartCount()})
                  </button>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-[#5A0F1B] font-medium py-2.5 px-3 rounded-lg hover:bg-[#5A0F1B]/10 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="text-gray-700 hover:text-[#5A0F1B] font-medium py-2.5 px-3 rounded-lg hover:bg-[#5A0F1B]/10 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="text-gray-700 hover:text-[#5A0F1B] font-medium py-2.5 px-3 rounded-lg hover:bg-[#5A0F1B]/10 transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                      navigate('/');
                    }}
                    className="text-left text-red-600 hover:text-red-700 font-medium py-2.5 px-3 rounded-lg hover:bg-red-50 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-[#5A0F1B] font-medium py-2.5 px-3 rounded-lg hover:bg-[#5A0F1B]/10 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-gray-700 hover:text-[#5A0F1B] font-medium py-2.5 px-3 rounded-lg hover:bg-[#5A0F1B]/10 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
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
