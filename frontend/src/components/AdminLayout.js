import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt, FaBoxes, FaShoppingCart, FaUsers, FaTags, FaTicketAlt,
  FaBars, FaTimes, FaSignOutAlt, FaChartLine, FaImages, FaCog, FaGift,
  FaWallet, FaChartBar, FaFilm, FaFileInvoiceDollar, FaChevronDown,
  FaChevronRight, FaTruck, FaIndustry, FaMoneyBillWave, FaClipboardList, FaLeaf
} from 'react-icons/fa';
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

  const isBillingActive = location.pathname.startsWith('/admin/billing');

  const menuItems = [
    { path: '/admin',                   icon: FaTachometerAlt,    label: 'Dashboard',         exact: true },
    { path: '/admin/products',          icon: FaBoxes,            label: 'Products' },
    { path: '/admin/categories',        icon: FaTags,             label: 'Categories' },
    { path: '/admin/orders',            icon: FaShoppingCart,     label: 'Orders' },
    { path: '/admin/users',             icon: FaUsers,            label: 'Users' },
    { path: '/admin/coupons',           icon: FaTicketAlt,        label: 'Coupons' },
    // { path: '/admin/loyalty-settings',  icon: FaGift,             label: 'Loyalty & Rewards' },  // hidden — enable when needed
    // { path: '/admin/referral-tracking', icon: FaWallet,           label: 'Referral Tracking' },   // hidden — enable when needed
    { path: '/admin/sliders',           icon: FaImages,           label: 'Sliders' },
    { path: '/admin/reels',             icon: FaFilm,             label: 'Reels' },
    { path: '/admin/settings',          icon: FaCog,              label: 'Settings' },
    { path: '/admin/reports',           icon: FaChartLine,        label: 'Reports' },
    { path: '/admin/analytics',         icon: FaChartBar,         label: 'Analytics' },
  ];

  const billingMenuItems = [
    { path: '/admin/billing',                 icon: FaTachometerAlt,     label: 'Dashboard',    exact: true },
    { path: '/admin/billing/suppliers',       icon: FaTruck,             label: 'Suppliers' },
    { path: '/admin/billing/raw-materials',   icon: FaBoxes,             label: 'Raw Materials' },
    { path: '/admin/billing/purchase',        icon: FaClipboardList,     label: 'Purchase' },
    { path: '/admin/billing/production',      icon: FaIndustry,          label: 'Production' },
    { path: '/admin/billing/sales',           icon: FaFileInvoiceDollar, label: 'Sales' },
    { path: '/admin/billing/vouchers',        icon: FaMoneyBillWave,     label: 'Vouchers' },
    { path: '/admin/billing/reports',         icon: FaChartLine,         label: 'Reports' },
  ];

  const isActive = (path, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const currentLabel = menuItems.find(item => isActive(item.path, item.exact))?.label
    || (isBillingActive
      ? (billingMenuItems.find(item => isActive(item.path, item.exact))?.label || 'Billing')
      : 'Admin');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-[72px]'} bg-gradient-to-b from-[#1a431c] via-[#1e5220] to-[#2d7d32] text-white transition-all duration-300 flex flex-col flex-shrink-0 shadow-2xl`}>

        {/* Brand */}
        <div className={`border-b border-white/10 flex-shrink-0 ${sidebarOpen ? 'p-4' : 'p-3'}`}>
          <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
            {sidebarOpen && (
              <>
                <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="NutriPot"
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span style="font-size:18px">🌿</span>';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-bold text-white leading-tight">NutriPot</h1>
                  <p className="text-[9px] text-[#f77c1c] font-bold tracking-[0.2em] uppercase">Admin Panel</p>
                </div>
              </>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? <FaTimes className="text-sm" /> : <FaBars className="text-sm" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto scrollbar-hide">
          <ul className="space-y-0.5">
            {menuItems.map((item) => {
              const active = isActive(item.path, item.exact);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    title={!sidebarOpen ? item.label : ''}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                      active
                        ? 'bg-[#f77c1c] text-white shadow-lg shadow-orange-900/20 font-bold'
                        : 'text-green-100 hover:bg-white/10 hover:text-white font-medium'
                    }`}
                  >
                    <item.icon className={`text-base flex-shrink-0 ${active ? 'text-white' : 'text-green-300'}`} />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                    {active && sidebarOpen && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                    )}
                  </Link>
                </li>
              );
            })}

            {/* Billing group */}
            <li>
              <button
                onClick={() => setBillingExpanded(!billingExpanded)}
                title={!sidebarOpen ? 'Billing' : ''}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                  isBillingActive
                    ? 'bg-[#f77c1c] text-white shadow-lg shadow-orange-900/20 font-bold'
                    : 'text-green-100 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <FaFileInvoiceDollar className={`text-base flex-shrink-0 ${isBillingActive ? 'text-white' : 'text-green-300'}`} />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">Billing</span>
                    {billingExpanded
                      ? <FaChevronDown className="text-xs flex-shrink-0" />
                      : <FaChevronRight className="text-xs flex-shrink-0" />}
                  </>
                )}
              </button>

              {sidebarOpen && billingExpanded && (
                <ul className="mt-1 ml-3 space-y-0.5 border-l-2 border-white/20 pl-3">
                  {billingMenuItems.map((sub) => {
                    const subActive = isActive(sub.path, sub.exact);
                    return (
                      <li key={sub.path}>
                        <Link
                          to={sub.path}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs ${
                            subActive
                              ? 'bg-white/20 text-white font-bold'
                              : 'text-green-200 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <sub.icon className="text-xs flex-shrink-0" />
                          <span>{sub.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          </ul>

          {/* Divider label */}
          {sidebarOpen && (
            <p className="text-[10px] text-green-400/60 uppercase tracking-widest font-bold px-3 mt-5 mb-2">Store</p>
          )}
        </nav>

        {/* User & Logout */}
        <div className="p-3 border-t border-white/10 flex-shrink-0 space-y-2">
          {sidebarOpen ? (
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
              <div className="w-8 h-8 bg-[#f77c1c] rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-md">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate leading-tight">{user?.name}</p>
                <p className="text-[10px] text-green-300 truncate">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-[#f77c1c] rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={!sidebarOpen ? 'Logout' : ''}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-500/15 hover:bg-red-500/35 text-red-300 hover:text-white rounded-xl transition-all text-sm font-semibold border border-red-500/20"
          >
            <FaSignOutAlt className="flex-shrink-0 text-sm" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-[#2d7d32] to-[#f77c1c] rounded-full" />
              <div>
                <h2 className="text-xl font-bold text-gray-800 leading-tight">{currentLabel}</h2>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <FaLeaf className="text-[#2d7d32] text-[10px]" />
                  NutriPot Admin Panel
                </p>
              </div>
            </div>
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2d7d32] to-[#1e6623] hover:from-[#1e6623] hover:to-[#1a431c] text-white rounded-xl transition-all text-sm font-semibold shadow-md hover:shadow-lg"
            >
              <FaLeaf className="text-xs" />
              View Store
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
