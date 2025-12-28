import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaBoxes, FaUsers, FaDollarSign, FaArrowUp, FaArrowDown, FaChartLine } from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';
import API from '../../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenueChange: 0,
    ordersChange: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard statistics from dedicated endpoint
      const { data } = await API.get('/admin/stats');

      if (data.success) {
        const { stats: dashboardStats } = data;

        setStats({
          totalRevenue: dashboardStats.totalRevenue || 0,
          totalOrders: dashboardStats.totalOrders || 0,
          totalProducts: dashboardStats.totalProducts || 0,
          totalUsers: dashboardStats.totalUsers || 0,
          revenueChange: 12.5, // Mock data - would calculate from previous period
          ordersChange: 8.3
        });

        setRecentOrders(dashboardStats.recentOrders || []);
        setLowStockProducts(dashboardStats.lowStockProducts || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, change, color, link }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              <span className="font-medium">{Math.abs(change)}%</span>
              <span className="text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${color}`}>
          <Icon className="text-2xl text-white" />
        </div>
      </div>
      {link && (
        <Link to={link} className="text-amber-600 hover:text-amber-700 text-sm font-medium mt-4 inline-block">
          View Details →
        </Link>
      )}
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={FaDollarSign}
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            change={stats.revenueChange}
            color="bg-green-500"
            link="/admin/reports"
          />
          <StatCard
            icon={FaShoppingCart}
            title="Total Orders"
            value={stats.totalOrders}
            change={stats.ordersChange}
            color="bg-blue-500"
            link="/admin/orders"
          />
          <StatCard
            icon={FaBoxes}
            title="Total Products"
            value={stats.totalProducts}
            color="bg-purple-500"
            link="/admin/products"
          />
          <StatCard
            icon={FaUsers}
            title="Total Users"
            value={stats.totalUsers}
            color="bg-amber-500"
            link="/admin/users"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
                <Link to="/admin/orders" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                  View All →
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">{order.orderNumber || `#${order._id?.slice(-6)}`}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        order.orderStatus === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                        order.orderStatus === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{order.user?.name || 'Guest'}</span>
                      <span className="font-semibold text-gray-800">₹{order.totalPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <FaShoppingCart className="text-4xl mx-auto mb-2 text-gray-300" />
                  <p>No orders yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Low Stock Alert</h3>
                <Link to="/admin/products" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                  Manage Stock →
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => (
                  <div key={product._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.images?.[0]?.url || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.stock === 0 ? 'bg-red-100 text-red-800' :
                            product.stock < 5 ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {product.stock} in stock
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <FaBoxes className="text-4xl mx-auto mb-2 text-gray-300" />
                  <p>All products are well stocked</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/admin/products"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all text-center"
            >
              <FaBoxes className="text-3xl mx-auto mb-2 text-amber-600" />
              <span className="block text-sm font-medium text-gray-800">Add Product</span>
            </Link>
            <Link
              to="/admin/categories"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all text-center"
            >
              <FaChartLine className="text-3xl mx-auto mb-2 text-amber-600" />
              <span className="block text-sm font-medium text-gray-800">Add Category</span>
            </Link>
            <Link
              to="/admin/orders"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all text-center"
            >
              <FaShoppingCart className="text-3xl mx-auto mb-2 text-amber-600" />
              <span className="block text-sm font-medium text-gray-800">View Orders</span>
            </Link>
            <Link
              to="/admin/coupons"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all text-center"
            >
              <FaChartLine className="text-3xl mx-auto mb-2 text-amber-600" />
              <span className="block text-sm font-medium text-gray-800">Create Coupon</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
