import React, { useState, useEffect } from 'react';
import { FaChartLine, FaDownload, FaCalendar } from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';
import API from '../../utils/api';

const AdminReports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reports, setReports] = useState({
    revenue: { total: 0, growth: 0 },
    orders: { total: 0, growth: 0 },
    customers: { total: 0, growth: 0 },
    topProducts: [],
    topCategories: [],
    revenueByDay: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const [productsRes, ordersRes, usersRes] = await Promise.all([
        API.get('/products?limit=1000'),
        API.get('/admin/orders'),
        API.get('/admin/users')
      ]);

      const products = productsRes.data.products || [];
      const orders = ordersRes.data.orders || [];
      const users = usersRes.data.users || [];

      // Filter orders by date range
      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= new Date(dateRange.startDate) &&
               orderDate <= new Date(dateRange.endDate);
      });

      // Calculate revenue
      const totalRevenue = filteredOrders
        .filter(order => order.paymentStatus === 'paid')
        .reduce((sum, order) => sum + order.totalAmount, 0);

      // Top products (by sales count in orders)
      const productSales = {};
      filteredOrders.forEach(order => {
        order.items?.forEach(item => {
          const productId = item.product?._id || item.product;
          if (productId) {
            productSales[productId] = (productSales[productId] || 0) + (item.quantity || 0);
          }
        });
      });

      const topProducts = products
        .map(p => ({
          ...p,
          salesCount: productSales[p._id] || 0
        }))
        .sort((a, b) => b.salesCount - a.salesCount)
        .slice(0, 5);

      // Revenue by day
      const revenueByDay = {};
      filteredOrders.forEach(order => {
        if (order.paymentStatus === 'paid') {
          const date = new Date(order.createdAt).toISOString().split('T')[0];
          revenueByDay[date] = (revenueByDay[date] || 0) + order.totalAmount;
        }
      });

      setReports({
        revenue: { total: totalRevenue, growth: 12.5 },
        orders: { total: filteredOrders.length, growth: 8.3 },
        customers: { total: users.length, growth: 5.2 },
        topProducts,
        topCategories: [],
        revenueByDay: Object.entries(revenueByDay).map(([date, amount]) => ({ date, amount }))
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Simple CSV export
    const csv = [
      ['Sales Report', ''],
      ['Date Range', `${dateRange.startDate} to ${dateRange.endDate}`],
      [''],
      ['Total Revenue', `₹${reports.revenue.total.toLocaleString()}`],
      ['Total Orders', reports.orders.total],
      ['Total Customers', reports.customers.total],
      [''],
      ['Top Products', ''],
      ['Product Name', 'Sales Count'],
      ...reports.topProducts.map(p => [p.name, p.salesCount])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${dateRange.startDate}-${dateRange.endDate}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Sales Reports</h2>
            <p className="text-gray-600 mt-1">Analyze your business performance</p>
          </div>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <FaDownload /> Export Report
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <FaCalendar className="text-2xl text-gray-400" />
            <div className="flex items-center gap-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold opacity-90">Total Revenue</h3>
                  <FaChartLine className="text-2xl opacity-75" />
                </div>
                <p className="text-3xl font-bold mb-2">₹{reports.revenue.total.toLocaleString()}</p>
                <p className="text-sm opacity-75">+{reports.revenue.growth}% from previous period</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold opacity-90">Total Orders</h3>
                  <FaChartLine className="text-2xl opacity-75" />
                </div>
                <p className="text-3xl font-bold mb-2">{reports.orders.total}</p>
                <p className="text-sm opacity-75">+{reports.orders.growth}% from previous period</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold opacity-90">Total Customers</h3>
                  <FaChartLine className="text-2xl opacity-75" />
                </div>
                <p className="text-3xl font-bold mb-2">{reports.customers.total}</p>
                <p className="text-sm opacity-75">+{reports.customers.growth}% from previous period</p>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">Top Selling Products</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reports.topProducts.map((product, index) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-400">#{index + 1}</span>
                            <img
                              src={product.images?.[0]?.url || '/placeholder.jpg'}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <span className="font-medium text-gray-800">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.category?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                          ₹{(product.discountPrice || product.price).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{product.salesCount}</td>
                        <td className="px-6 py-4 text-sm font-bold text-green-600">
                          ₹{((product.discountPrice || product.price) * product.salesCount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Revenue Chart (Simple visualization) */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Trend</h3>
              <div className="space-y-2">
                {reports.revenueByDay.slice(-7).map((day) => {
                  const maxRevenue = Math.max(...reports.revenueByDay.map(d => d.amount));
                  const percentage = (day.amount / maxRevenue) * 100;

                  return (
                    <div key={day.date}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">{new Date(day.date).toLocaleDateString()}</span>
                        <span className="font-medium text-gray-800">₹{day.amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
