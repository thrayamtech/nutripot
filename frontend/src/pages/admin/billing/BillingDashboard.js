import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBoxes, FaTruck, FaFileInvoiceDollar, FaIndustry, FaMoneyBillWave, FaExclamationTriangle, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AdminLayout from '../../../components/AdminLayout';
import API from '../../../utils/api';

const BillingDashboard = () => {
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    totalRawMaterials: 0,
    lowStockItems: 0,
    pendingPurchaseOrders: 0,
    todaySales: 0,
    monthlyPurchase: 0,
    monthlySales: 0,
    outstandingPayables: 0,
    outstandingReceivables: 0
  });
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch multiple data in parallel
      const [suppliersRes, rawMaterialsRes, lowStockRes, salesRes] = await Promise.all([
        API.get('/billing/suppliers?limit=1'),
        API.get('/billing/raw-materials?limit=1'),
        API.get('/billing/raw-materials?lowStock=true'),
        API.get('/billing/sales/invoices?limit=5')
      ]);

      setStats(prev => ({
        ...prev,
        totalSuppliers: suppliersRes.data.total || 0,
        totalRawMaterials: rawMaterialsRes.data.total || 0,
        lowStockItems: lowStockRes.data.count || 0
      }));

      setLowStockItems(lowStockRes.data.rawMaterials || []);
      setRecentSales(salesRes.data.salesInvoices || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'New Purchase Order', path: '/admin/billing/purchase/orders/new', icon: FaBoxes, color: 'bg-blue-500' },
    { label: 'New Sales Invoice', path: '/admin/billing/sales/new', icon: FaFileInvoiceDollar, color: 'bg-green-500' },
    { label: 'Add Raw Material', path: '/admin/billing/raw-materials', icon: FaBoxes, color: 'bg-purple-500' },
    { label: 'New Production', path: '/admin/billing/production/new', icon: FaIndustry, color: 'bg-orange-500' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Billing Dashboard</h2>
            <p className="text-gray-600 mt-1">Overview of your billing & inventory</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className={`${action.color} text-white p-4 rounded-lg hover:opacity-90 transition flex items-center gap-3`}
            >
              <action.icon className="text-2xl" />
              <span className="font-medium">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Suppliers</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalSuppliers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaTruck className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Raw Materials</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalRawMaterials}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaBoxes className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowStockItems}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending POs</p>
                <p className="text-2xl font-bold text-gray-800">{stats.pendingPurchaseOrders}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <FaFileInvoiceDollar className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FaExclamationTriangle className="text-red-600" />
              <h3 className="font-semibold text-red-800">Low Stock Alert</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {lowStockItems.slice(0, 6).map((item) => (
                <div key={item._id} className="bg-white p-3 rounded-lg border border-red-100">
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Stock: <span className="text-red-600 font-medium">{item.currentStock} {item.unit}</span>
                    <span className="text-gray-400 ml-2">(Min: {item.minimumStock})</span>
                  </p>
                </div>
              ))}
            </div>
            {lowStockItems.length > 6 && (
              <Link to="/admin/billing/raw-materials?lowStock=true" className="text-red-600 hover:underline text-sm mt-2 inline-block">
                View all {lowStockItems.length} low stock items →
              </Link>
            )}
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sales */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Recent Sales</h3>
              <Link to="/admin/billing/sales" className="text-amber-600 hover:underline text-sm">
                View All
              </Link>
            </div>
            <div className="p-4">
              {recentSales.length > 0 ? (
                <div className="space-y-3">
                  {recentSales.map((sale) => (
                    <div key={sale._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-800">{sale.invoiceNumber}</p>
                        <p className="text-sm text-gray-500">{sale.customerDetails?.name || 'Walk-in'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">₹{sale.totalAmount?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(sale.invoiceDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent sales</p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">This Month</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaArrowUp className="text-green-600" />
                  <span className="text-gray-700">Total Sales</span>
                </div>
                <span className="font-bold text-green-600">₹{stats.monthlySales.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaArrowDown className="text-red-600" />
                  <span className="text-gray-700">Total Purchase</span>
                </div>
                <span className="font-bold text-red-600">₹{stats.monthlyPurchase.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaMoneyBillWave className="text-orange-600" />
                  <span className="text-gray-700">Payables</span>
                </div>
                <span className="font-bold text-orange-600">₹{stats.outstandingPayables.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaMoneyBillWave className="text-blue-600" />
                  <span className="text-gray-700">Receivables</span>
                </div>
                <span className="font-bold text-blue-600">₹{stats.outstandingReceivables.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BillingDashboard;
