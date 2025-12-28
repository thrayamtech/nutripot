import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaBoxes, FaShoppingCart, FaUsers, FaTags, FaTicketAlt, FaBars, FaTimes, FaSignOutAlt, FaChartLine, FaImages, FaCog, FaGift, FaWallet } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
    { path: '/admin/settings', icon: FaCog, label: 'Settings' },
    { path: '/admin/reports', icon: FaChartLine, label: 'Reports' },
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
        } bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#8A1F35] to-[#5A0F1B] bg-clip-text text-transparent">
                Admin Panel
              </h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
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
                      ? 'bg-[#5A0F1B] text-white shadow-lg'
                      : 'hover:bg-gray-700 text-gray-300'
                  }`}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <item.icon className="text-xl flex-shrink-0" />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#5A0F1B] rounded-full flex items-center justify-center font-bold flex-shrink-0">
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
                className="px-4 py-2 bg-[#5A0F1B] text-white rounded-lg hover:bg-[#7A1525] transition-colors text-sm font-medium"
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
