import React, { useState, useEffect } from 'react';
import { FaChartBar, FaBoxes, FaFileInvoiceDollar, FaPercentage, FaDownload, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AdminLayout from '../../../components/AdminLayout';
import API from '../../../utils/api';

const BillingReports = () => {
  const [activeReport, setActiveReport] = useState('stock');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [gstPeriod, setGstPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const reports = [
    { id: 'stock', label: 'Stock Report', icon: FaBoxes },
    { id: 'purchase', label: 'Purchase Register', icon: FaFileInvoiceDollar },
    { id: 'sales', label: 'Sales Register', icon: FaFileInvoiceDollar },
    { id: 'gst', label: 'GST Summary', icon: FaPercentage },
    { id: 'profitloss', label: 'Profit & Loss', icon: FaChartBar }
  ];

  const fetchReport = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let params = {};

      switch (activeReport) {
        case 'stock':
          endpoint = '/billing/reports/stock/raw-materials';
          break;
        case 'purchase':
          endpoint = '/billing/reports/purchase-register';
          params = { startDate: dateRange.startDate, endDate: dateRange.endDate };
          break;
        case 'sales':
          endpoint = '/billing/reports/sales-register';
          params = { startDate: dateRange.startDate, endDate: dateRange.endDate };
          break;
        case 'gst':
          endpoint = '/billing/reports/gst/summary';
          params = { startDate: dateRange.startDate, endDate: dateRange.endDate };
          break;
        case 'profitloss':
          endpoint = '/billing/reports/profit-loss';
          params = { startDate: dateRange.startDate, endDate: dateRange.endDate };
          break;
        default:
          break;
      }

      const queryString = new URLSearchParams(params).toString();
      const { data } = await API.get(`${endpoint}${queryString ? '?' + queryString : ''}`);
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeReport]);

  const renderStockReport = () => {
    if (!reportData?.report) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total Items</p>
            <p className="text-2xl font-bold text-blue-800">{reportData.count}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Total Stock Value</p>
            <p className="text-2xl font-bold text-green-800">₹{reportData.totalStockValue?.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600">Low Stock Items</p>
            <p className="text-2xl font-bold text-red-800">
              {reportData.report?.filter(r => r.isLowStock).length || 0}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Code</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-right">Stock</th>
                <th className="px-4 py-2 text-right">Min Stock</th>
                <th className="px-4 py-2 text-right">Cost Price</th>
                <th className="px-4 py-2 text-right">Value</th>
                <th className="px-4 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.report?.map((item, index) => (
                <tr key={index} className={`border-b ${item.isLowStock ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-2 font-mono">{item.code}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.category || '-'}</td>
                  <td className="px-4 py-2 text-right">{item.currentStock} {item.unit}</td>
                  <td className="px-4 py-2 text-right">{item.minimumStock}</td>
                  <td className="px-4 py-2 text-right">₹{item.costPrice?.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right font-medium">₹{item.stockValue?.toLocaleString()}</td>
                  <td className="px-4 py-2 text-center">
                    {item.isLowStock ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Low</span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPurchaseRegister = () => {
    if (!reportData?.purchases) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total Invoices</p>
            <p className="text-2xl font-bold text-blue-800">{reportData.count}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600">Purchase Amount</p>
            <p className="text-2xl font-bold text-purple-800">₹{reportData.summary?.totalPurchase?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-600">GST Paid</p>
            <p className="text-2xl font-bold text-orange-800">₹{reportData.summary?.totalGST?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600">Outstanding</p>
            <p className="text-2xl font-bold text-red-800">₹{reportData.summary?.totalOutstanding?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Invoice No</th>
                <th className="px-4 py-2 text-left">Supplier</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-right">Taxable</th>
                <th className="px-4 py-2 text-right">GST</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-center">Payment</th>
              </tr>
            </thead>
            <tbody>
              {reportData.purchases?.map((inv, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2 font-mono">{inv.invoiceNumber}</td>
                  <td className="px-4 py-2">{inv.supplier?.name}</td>
                  <td className="px-4 py-2">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-right">₹{inv.subtotal?.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">₹{inv.totalGst?.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right font-medium">₹{inv.totalAmount?.toLocaleString()}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      inv.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                      inv.paymentStatus === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSalesRegister = () => {
    if (!reportData?.sales) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total Invoices</p>
            <p className="text-2xl font-bold text-blue-800">{reportData.count}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Sales Amount</p>
            <p className="text-2xl font-bold text-green-800">₹{reportData.summary?.totalSales?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-600">GST Collected</p>
            <p className="text-2xl font-bold text-orange-800">₹{reportData.summary?.totalGST?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600">Received</p>
            <p className="text-2xl font-bold text-purple-800">₹{reportData.summary?.totalReceived?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Invoice No</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-right">Taxable</th>
                <th className="px-4 py-2 text-right">GST</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-center">Payment</th>
              </tr>
            </thead>
            <tbody>
              {reportData.sales?.map((inv, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2 font-mono">{inv.invoiceNumber}</td>
                  <td className="px-4 py-2">{inv.customerDetails?.name || 'Walk-in'}</td>
                  <td className="px-4 py-2">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-right">₹{inv.subtotal?.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">₹{inv.totalGst?.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right font-medium">₹{inv.totalAmount?.toLocaleString()}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      inv.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                      inv.paymentStatus === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderGSTSummary = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Output Tax */}
          <div className="bg-white p-6 rounded-lg border-2 border-green-200">
            <h4 className="font-medium text-green-800 mb-4">Output Tax (Sales)</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Taxable Value:</span>
                <span className="font-medium">₹{reportData.outputTax?.taxableValue?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CGST:</span>
                <span className="font-medium">₹{reportData.outputTax?.cgst?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SGST:</span>
                <span className="font-medium">₹{reportData.outputTax?.sgst?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IGST:</span>
                <span className="font-medium">₹{reportData.outputTax?.igst?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Total:</span>
                <span className="text-green-600">₹{reportData.outputTax?.totalGst?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          {/* Input Tax */}
          <div className="bg-white p-6 rounded-lg border-2 border-red-200">
            <h4 className="font-medium text-red-800 mb-4">Input Tax (Purchase)</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Taxable Value:</span>
                <span className="font-medium">₹{reportData.inputTax?.taxableValue?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CGST:</span>
                <span className="font-medium">₹{reportData.inputTax?.cgst?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SGST:</span>
                <span className="font-medium">₹{reportData.inputTax?.sgst?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IGST:</span>
                <span className="font-medium">₹{reportData.inputTax?.igst?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Total:</span>
                <span className="text-red-600">₹{reportData.inputTax?.totalGst?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          {/* Net GST */}
          <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
            <h4 className="font-medium text-blue-800 mb-4">Net GST Payable</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">CGST:</span>
                <span className="font-medium">₹{reportData.netGSTPayable?.cgst?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SGST:</span>
                <span className="font-medium">₹{reportData.netGSTPayable?.sgst?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IGST:</span>
                <span className="font-medium">₹{reportData.netGSTPayable?.igst?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold text-lg">
                <span>Total Payable:</span>
                <span className={reportData.netGSTPayable?.total >= 0 ? 'text-blue-600' : 'text-green-600'}>
                  ₹{Math.abs(reportData.netGSTPayable?.total || 0).toLocaleString()}
                  {reportData.netGSTPayable?.total < 0 && ' (Credit)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProfitLoss = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Revenue</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Sales:</span>
                <span className="font-medium text-green-600">₹{reportData.revenue?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          {/* Cost of Goods */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Cost of Goods</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Purchase Cost:</span>
                <span className="font-medium text-red-600">₹{reportData.costOfGoods?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Gross Profit</p>
              <p className={`text-2xl font-bold ${reportData.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{reportData.grossProfit?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-500">{reportData.grossProfitMargin}% margin</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Expenses</p>
              <p className="text-2xl font-bold text-orange-600">
                ₹{reportData.expenses?.total?.toLocaleString() || 0}
              </p>
            </div>
            <div className="text-center border-l-2 border-amber-300 pl-6">
              <p className="text-sm text-gray-600">Net Profit</p>
              <p className={`text-3xl font-bold ${reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{reportData.netProfit?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-500">{reportData.netProfitMargin}% margin</p>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        {reportData.expenses?.categoryWise?.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-bold text-gray-800 mb-4">Expense Breakdown</h4>
            <div className="space-y-2">
              {reportData.expenses.categoryWise.map((exp, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">{exp._id || 'Other'}</span>
                  <span className="font-medium">₹{exp.amount?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReport = () => {
    switch (activeReport) {
      case 'stock': return renderStockReport();
      case 'purchase': return renderPurchaseRegister();
      case 'sales': return renderSalesRegister();
      case 'gst': return renderGSTSummary();
      case 'profitloss': return renderProfitLoss();
      default: return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Billing Reports</h2>
            <p className="text-gray-600 mt-1">View and analyze your business data</p>
          </div>
        </div>

        {/* Report Tabs */}
        <div className="flex flex-wrap gap-2">
          {reports.map(report => (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                activeReport === report.id
                  ? 'bg-[#f77c1c] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border'
              }`}
            >
              <report.icon />
              {report.label}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        {activeReport !== 'stock' && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="pt-6">
                <button
                  onClick={fetchReport}
                  className="flex items-center gap-2 px-4 py-2 bg-[#f77c1c] text-white rounded-lg hover:bg-amber-700 transition"
                >
                  <FaSearch /> Generate Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
            </div>
          ) : (
            renderReport()
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default BillingReports;
