import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaBoxes, FaShoppingCart, FaUsers, FaTags, FaTicketAlt, FaBars, FaTimes, FaSignOutAlt, FaChartLine, FaImages, FaCog, FaGift, FaWallet, FaChartBar, FaFilm, FaFileInvoiceDollar, FaChevronDown, FaChevronRight, FaTruck, FaIndustry, FaMoneyBillWave, FaClipboardList } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [billingExpanded, setBillingExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if any billing route is active
  const isBillingActive = location.pathname.startsWith('/admin/billing');

  const menuItems = [
    { path: '/admin', icon: FaTachometerAlt, label: 'Dashboard', exact: true },
    { path: '/admin/products', icon: FaBoxes, label: 'Products' },
    { path: '/admin/categories', icon: FaTags, label: 'Categories' },
    { path: '/admin/orders', icon: FaShoppingCart, label: 'Orders' },
    { path: '/admin/users', icon: FaUsers, label: 'Users' },
    { path: '/admin/coupons', icon: FaTicketAlt, label: 'Coupons' },
    { path: '/admin/loyalty-settings', icon: FaGift, label: 'Loyalty & Rewards' },
    { path: '/admin/referral-tracking', icon: FaWallet, label: 'Referral Tracking' },
    { path: '/admin/sliders', icon: FaImages, label: 'Sliders' },
    { path: '/admin/reels', icon: FaFilm, label: 'Reels' },
    { path: '/admin/settings', icon: FaCog, label: 'Settings' },
    { path: '/admin/reports', icon: FaChartLine, label: 'Reports' },
    { path: '/admin/analytics', icon: FaChartBar, label: 'Analytics' },
  ];

  const billingMenuItems = [
    { path: '/admin/billing', icon: FaTachometerAlt, label: 'Dashboard', exact: true },
    { path: '/admin/billing/suppliers', icon: FaTruck, label: 'Suppliers' },
    { path: '/admin/billing/raw-materials', icon: FaBoxes, label: 'Raw Materials' },
    { path: '/admin/billing/purchase', icon: FaClipboardList, label: 'Purchase' },
    { path: '/admin/billing/production', icon: FaIndustry, label: 'Production' },
    { path: '/admin/billing/sales', icon: FaFileInvoiceDollar, label: 'Sales' },
    { path: '/admin/billing/vouchers', icon: FaMoneyBillWave, label: 'Vouchers' },
    { path: '/admin/billing/reports', icon: FaChartLine, label: 'Reports' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-[#0c1a5c] to-[#1e3a8a] text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-blue-900">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-[#93c5fd] bg-clip-text text-transparent">
                JJ Trendz
              </h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-blue-900 rounded-lg transition-colors"
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(item.path, item.exact)
                      ? 'bg-[#2563eb] text-white shadow-lg'
                      : 'hover:bg-blue-900 text-blue-100'
                  }`}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <item.icon className="text-xl flex-shrink-0" />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            ))}

            {/* Billing Menu with Submenu */}
            <li>
              <button
                onClick={() => setBillingExpanded(!billingExpanded)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isBillingActive
                    ? 'bg-[#2563eb] text-white shadow-lg'
                    : 'hover:bg-blue-900 text-blue-100'
                }`}
                title={!sidebarOpen ? 'Billing' : ''}
              >
                <FaFileInvoiceDollar className="text-xl flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="font-medium flex-1 text-left">Billing</span>
                    {billingExpanded ? <FaChevronDown className="text-sm" /> : <FaChevronRight className="text-sm" />}
                  </>
                )}
              </button>

              {/* Billing Submenu */}
              {sidebarOpen && billingExpanded && (
                <ul className="mt-1 ml-4 space-y-1 border-l-2 border-blue-700 pl-4">
                  {billingMenuItems.map((subItem) => (
                    <li key={subItem.path}>
                      <Link
                        to={subItem.path}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                          isActive(subItem.path, subItem.exact)
                            ? 'bg-[#1d4ed8] text-white'
                            : 'hover:bg-blue-900 text-blue-200'
                        }`}
                      >
                        <subItem.icon className="text-sm flex-shrink-0" />
                        <span>{subItem.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-blue-900">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#1d4ed8] rounded-full flex items-center justify-center font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <FaSignOutAlt className="flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {menuItems.find(item => isActive(item.path, item.exact))?.label || 'Admin'}
              </h2>
              <p className="text-sm text-gray-600">Manage your e-commerce platform</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                target="_blank"
                className="px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors text-sm font-medium"
              >
                View Store
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
