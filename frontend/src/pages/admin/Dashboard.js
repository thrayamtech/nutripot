import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaShoppingCart, FaBoxes, FaUsers, FaDollarSign,
  FaArrowUp, FaArrowDown, FaChartLine, FaLeaf, FaTag, FaCog
} from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';
import API from '../../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0, totalOrders: 0, totalProducts: 0,
    totalUsers: 0, revenueChange: 0, ordersChange: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/admin/stats');
      if (data.success) {
        const s = data.stats;
        setStats({
          totalRevenue: s.totalRevenue || 0,
          totalOrders: s.totalOrders || 0,
          totalProducts: s.totalProducts || 0,
          totalUsers: s.totalUsers || 0,
          revenueChange: 12.5,
          ordersChange: 8.3
        });
        setRecentOrders(s.recentOrders || []);
        setLowStockProducts(s.lowStockProducts || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, change, gradient, link }) => (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 group">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200`}>
            <Icon className="text-xl text-white" />
          </div>
          {change !== undefined && (
            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${change >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {change >= 0 ? <FaArrowUp className="text-[10px]" /> : <FaArrowDown className="text-[10px]" />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        {change !== undefined && <p className="text-xs text-gray-400 mt-1">vs last month</p>}
      </div>
      {link && (
        <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100">
          <Link to={link} className="text-[#2d7d32] hover:text-[#1e6623] text-xs font-bold flex items-center gap-1 transition-colors">
            View Details →
          </Link>
        </div>
      )}
    </div>
  );

  const statCards = [
    { icon: FaDollarSign,  title: 'Total Revenue',  value: `₹${stats.totalRevenue.toLocaleString()}`, change: stats.revenueChange, gradient: 'from-[#2d7d32] to-[#43A047]', link: '/admin/reports' },
    { icon: FaShoppingCart,title: 'Total Orders',   value: stats.totalOrders,   change: stats.ordersChange,  gradient: 'from-[#f77c1c] to-[#e86010]', link: '/admin/orders' },
    { icon: FaBoxes,       title: 'Total Products', value: stats.totalProducts,  gradient: 'from-[#7b1fa2] to-[#9c27b0]', link: '/admin/products' },
    { icon: FaUsers,       title: 'Total Users',    value: stats.totalUsers,     gradient: 'from-[#0288d1] to-[#0277bd]', link: '/admin/users' },
  ];

  const quickActions = [
    { to: '/admin/products',   icon: FaBoxes,       label: 'Add Product',  desc: 'Add natural food product' },
    { to: '/admin/categories', icon: FaTag,         label: 'Add Category', desc: 'Create product category' },
    { to: '/admin/orders',     icon: FaShoppingCart,label: 'View Orders',  desc: 'Manage customer orders' },
    { to: '/admin/settings',   icon: FaCog,         label: 'Settings',     desc: 'Configure store settings' },
  ];

  const orderStatusColors = {
    Delivered:  'bg-green-100 text-green-700',
    Cancelled:  'bg-red-100 text-red-700',
    Shipped:    'bg-purple-100 text-purple-700',
    Processing: 'bg-blue-100 text-blue-700',
    Pending:    'bg-yellow-100 text-yellow-700',
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#2d7d32]/20 border-t-[#2d7d32] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#1a431c] to-[#2d7d32] rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
          <div className="absolute right-24 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-16" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FaLeaf className="text-[#f77c1c]" />
                <span className="text-green-300 text-xs font-bold uppercase tracking-widest">NutriPot Admin</span>
              </div>
              <h1 className="text-2xl font-bold mb-1">Welcome back! 👋</h1>
              <p className="text-green-200 text-sm">Here's what's happening with your store today.</p>
            </div>
            <Link
              to="/admin/reports"
              className="hidden md:flex items-center gap-2 bg-[#f77c1c] hover:bg-[#e86010] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg"
            >
              <FaChartLine className="text-xs" /> View Reports
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => <StatCard key={card.title} {...card} />)}
        </div>

        {/* Recent Orders + Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-[#2d7d32] rounded-full" />
                <h3 className="font-bold text-gray-800">Recent Orders</h3>
              </div>
              <Link to="/admin/orders" className="text-[#2d7d32] hover:text-[#1e6623] text-xs font-bold transition-colors">View All →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <div key={order._id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-800 text-sm">
                      {order.orderNumber || `#${order._id?.slice(-6).toUpperCase()}`}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${orderStatusColors[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">{order.user?.name || 'Guest'}</span>
                    <span className="font-bold text-gray-700 text-sm">₹{order.totalPrice?.toLocaleString()}</span>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center">
                  <FaShoppingCart className="text-3xl mx-auto mb-2 text-gray-200" />
                  <p className="text-gray-400 text-sm">No orders yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-[#f77c1c] rounded-full" />
                <h3 className="font-bold text-gray-800">Low Stock Alert</h3>
              </div>
              <Link to="/admin/products" className="text-[#2d7d32] hover:text-[#1e6623] text-xs font-bold transition-colors">Manage →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {lowStockProducts.length > 0 ? lowStockProducts.map((product) => (
                <div key={product._id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <img
                    src={product.images?.[0]?.url || '/placeholder.jpg'}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded-xl flex-shrink-0 border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{product.name}</p>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                      product.stock === 0 ? 'bg-red-100 text-red-700' :
                      product.stock < 5  ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center">
                  <FaBoxes className="text-3xl mx-auto mb-2 text-gray-200" />
                  <p className="text-gray-400 text-sm">All products well stocked</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-gradient-to-b from-[#2d7d32] to-[#f77c1c] rounded-full" />
            <h3 className="font-bold text-gray-800">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map(({ to, icon: Icon, label, desc }) => (
              <Link
                key={to}
                to={to}
                className="group p-4 border-2 border-gray-100 rounded-xl hover:border-[#2d7d32] hover:bg-[#f0faf0] transition-all text-center"
              >
                <div className="w-11 h-11 bg-gray-100 group-hover:bg-[#2d7d32] rounded-xl flex items-center justify-center mx-auto mb-2.5 transition-all duration-200 shadow-sm">
                  <Icon className="text-lg text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm font-bold text-gray-700 group-hover:text-[#1a431c] transition-colors">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-tight">{desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
