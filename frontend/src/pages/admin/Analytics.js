import React, { useState, useEffect } from 'react';
import { FaUsers, FaGlobe, FaShoppingCart, FaClock, FaMobile, FaDesktop, FaTablet, FaDownload, FaCalendar } from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';
import API from '../../utils/api';
import { toast } from 'react-toastify';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      const { data } = await API.get('/analytics/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });

      setDashboardData(data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    if (!dashboardData) return;

    const csv = [
      ['Analytics Report', ''],
      ['Date Range', `${dateRange.startDate} to ${dateRange.endDate}`],
      [''],
      ['Metric', 'Value'],
      ['Total Sessions', dashboardData.totalSessions],
      ['Daily Visitors', dashboardData.dailyVisitors],
      ['Average Session Duration', formatDuration(dashboardData.avgSessionDuration)],
      ['Total Page Views', dashboardData.totalPageViews],
      [''],
      ['Top Locations', ''],
      ['Location', 'Sessions', 'Avg Duration'],
      ...dashboardData.locationStats.slice(0, 10).map(loc => [
        `${loc._id.city || 'Unknown'}, ${loc._id.country || 'Unknown'}`,
        loc.count,
        formatDuration(loc.avgDuration)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${dateRange.startDate}-${dateRange.endDate}.csv`;
    a.click();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const getDeviceIcon = (device) => {
    switch (device?.toLowerCase()) {
      case 'mobile':
        return <FaMobile className="text-blue-600" />;
      case 'tablet':
        return <FaTablet className="text-green-600" />;
      case 'desktop':
        return <FaDesktop className="text-purple-600" />;
      default:
        return <FaDesktop className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#f77c1c]"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!dashboardData) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">No analytics data available</p>
        </div>
      </AdminLayout>
    );
  }

  const {
    totalSessions,
    dailyVisitors,
    locationStats,
    topProducts,
    avgSessionDuration,
    totalPageViews,
    deviceStats,
    locationDemand
  } = dashboardData;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
            <p className="text-gray-600 mt-1">Track user behavior and engagement metrics</p>
          </div>
          <button
            onClick={exportAnalytics}
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaUsers className="text-2xl text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{totalSessions}</span>
            </div>
            <h3 className="text-gray-600 font-semibold">Total Sessions</h3>
            <p className="text-sm text-gray-500 mt-1">All user sessions tracked</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaUsers className="text-2xl text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{dailyVisitors}</span>
            </div>
            <h3 className="text-gray-600 font-semibold">Today's Visitors</h3>
            <p className="text-sm text-gray-500 mt-1">Unique visitors today</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaClock className="text-2xl text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{formatDuration(avgSessionDuration)}</span>
            </div>
            <h3 className="text-gray-600 font-semibold">Avg Session Duration</h3>
            <p className="text-sm text-gray-500 mt-1">Average time spent</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaShoppingCart className="text-2xl text-orange-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{totalPageViews}</span>
            </div>
            <h3 className="text-gray-600 font-semibold">Total Page Views</h3>
            <p className="text-sm text-gray-500 mt-1">All pages viewed</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Device Breakdown */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Device Breakdown</h3>
            <div className="space-y-3">
              {deviceStats && deviceStats.length > 0 ? (
                deviceStats.map((device, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(device._id)}
                      <span className="font-semibold text-gray-700 capitalize">{device._id || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-gray-900">{device.count}</span>
                      <span className="text-sm text-gray-500">
                        ({Math.round((device.count / totalSessions) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No device data available</p>
              )}
            </div>
          </div>

          {/* Top Locations */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Top Locations</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {locationStats && locationStats.length > 0 ? (
                locationStats.slice(0, 10).map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaGlobe className="text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-700 text-sm">
                          {location._id.city || 'Unknown'}, {location._id.country || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Avg: {formatDuration(location.avgDuration)}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">{location.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No location data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Most Viewed Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Most Viewed Products</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unique Users
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts && topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={product.productDetails.images?.[0]}
                            alt={product.productDetails.name}
                            className="h-10 w-10 rounded object-cover mr-3"
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {product.productDetails.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {product.productDetails.category || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">{product.viewCount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-blue-600">
                          {product.uniqueUsers?.length || 0}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      No product data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Location-Based Product Demand */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Location-Based Product Demand</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added to Cart
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locationDemand && locationDemand.length > 0 ? (
                  locationDemand.slice(0, 15).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FaGlobe className="text-blue-600 text-sm" />
                          <span className="text-sm text-gray-900">
                            {item._id.city || 'Unknown'}, {item._id.country || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={item.productDetails.images?.[0]}
                            alt={item.productDetails.name}
                            className="h-10 w-10 rounded object-cover mr-3"
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {item.productDetails.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">{item.viewCount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-green-600">{item.addedToCartCount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800">
                          {item.viewCount > 0
                            ? Math.round((item.addedToCartCount / item.viewCount) * 100)
                            : 0}
                          %
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No location demand data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
