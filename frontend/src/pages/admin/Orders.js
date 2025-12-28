import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaEye, FaShoppingCart, FaPrint, FaTruck, FaMoneyBillWave, FaEdit, FaTrash, FaCheck, FaTimes, FaBox, FaDownload, FaFileExcel } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import { QRCodeCanvas } from 'qrcode.react';
import * as XLSX from 'xlsx';
import AdminLayout from '../../components/AdminLayout';
import API from '../../utils/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [dispatchData, setDispatchData] = useState({
    trackingNumber: '',
    courierName: '',
    estimatedDelivery: '',
    notes: ''
  });
  const [statusData, setStatusData] = useState({
    status: '',
    note: ''
  });
  const [refundData, setRefundData] = useState({
    amount: '',
    reason: ''
  });
  const [processingAction, setProcessingAction] = useState(false);
  const printRef = useRef();
  const stickersPrintRef = useRef();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/orders/admin/all');
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setProcessingAction(true);
    try {
      await API.put(`/orders/${selectedOrder._id}/status`, {
        status: statusData.status,
        note: statusData.note
      });
      toast.success('Order status updated successfully');
      setShowStatusModal(false);
      setStatusData({ status: '', note: '' });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDispatchUpdate = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setProcessingAction(true);
    try {
      await API.put(`/orders/${selectedOrder._id}/status`, {
        status: 'Shipped',
        trackingNumber: dispatchData.trackingNumber,
        note: `Dispatched via ${dispatchData.courierName}. ${dispatchData.notes || ''}`
      });
      toast.success('Order dispatched successfully');
      setShowDispatchModal(false);
      setDispatchData({ trackingNumber: '', courierName: '', estimatedDelivery: '', notes: '' });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update dispatch details');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRefund = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    if (!window.confirm('Are you sure you want to process this refund?')) {
      return;
    }

    setProcessingAction(true);
    try {
      await API.post(`/payment/refund/${selectedOrder._id}`, {
        amount: refundData.amount ? parseFloat(refundData.amount) : selectedOrder.totalPrice,
        notes: {
          reason: refundData.reason
        }
      });
      toast.success('Refund processed successfully');
      setShowRefundModal(false);
      setRefundData({ amount: '', reason: '' });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process refund');
    } finally {
      setProcessingAction(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Order-${selectedOrder?.orderNumber || selectedOrder?._id}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `
  });

  const handlePrintStickers = () => {
    const paidOrders = orders.filter(o => o.isPaid);
    if (paidOrders.length === 0) {
      toast.error('No paid orders to print');
      return;
    }

    console.log(`Printing stickers for ${paidOrders.length} paid orders`);
    toast.info(`Preparing ${paidOrders.length} shipping stickers...`);

    // Use window.print after a small delay
    setTimeout(() => {
      const printContent = stickersPrintRef.current;
      if (!printContent) {
        toast.error('Print content not ready');
        return;
      }

      // Clone the content and convert QR code canvases to images
      const clonedContent = printContent.cloneNode(true);
      const qrCanvases = printContent.querySelectorAll('canvas');
      const qrImages = clonedContent.querySelectorAll('canvas');

      qrCanvases.forEach((canvas, index) => {
        const img = document.createElement('img');
        img.src = canvas.toDataURL();
        img.style.width = canvas.style.width || '80px';
        img.style.height = canvas.style.height || '80px';
        qrImages[index].parentNode.replaceChild(img, qrImages[index]);
      });

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to print');
        return;
      }

      // Write the content to the new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Shipping Stickers - ${new Date().toISOString().split('T')[0]}</title>
            <style>
              @page {
                size: A4 landscape;
                margin: 8mm;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                  margin: 0;
                  padding: 0;
                }
                .page-break {
                  page-break-inside: avoid;
                  page-break-after: always;
                }
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 0;
              }
            </style>
          </head>
          <body>
            ${clonedContent.innerHTML}
          </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
    }, 300);
  };

  const downloadExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = filteredOrders.map((order, index) => ({
        'S.No': index + 1,
        'Order Number': order.orderNumber || '',
        'Order ID': order._id,
        'Customer Name': order.user?.name || 'Guest',
        'Email': order.user?.email || '',
        'Phone': order.shippingAddress?.phone || '',
        'Address Line 1': order.shippingAddress?.addressLine1 || '',
        'Address Line 2': order.shippingAddress?.addressLine2 || '',
        'City': order.shippingAddress?.city || '',
        'State': order.shippingAddress?.state || '',
        'Pincode': order.shippingAddress?.pincode || '',
        'Total Items': order.items?.length || 0,
        'Total Amount': order.totalPrice || 0,
        'Payment Method': order.paymentMethod || '',
        'Payment Status': order.isPaid ? 'Paid' : 'Pending',
        'Order Status': order.orderStatus || '',
        'Tracking Number': order.trackingNumber || '',
        'Order Date': new Date(order.createdAt).toLocaleDateString('en-IN'),
        'Paid At': order.paidAt ? new Date(order.paidAt).toLocaleDateString('en-IN') : '',
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 6 },  // S.No
        { wch: 15 }, // Order Number
        { wch: 25 }, // Order ID
        { wch: 20 }, // Customer Name
        { wch: 25 }, // Email
        { wch: 15 }, // Phone
        { wch: 30 }, // Address Line 1
        { wch: 30 }, // Address Line 2
        { wch: 15 }, // City
        { wch: 15 }, // State
        { wch: 10 }, // Pincode
        { wch: 10 }, // Total Items
        { wch: 15 }, // Total Amount
        { wch: 15 }, // Payment Method
        { wch: 15 }, // Payment Status
        { wch: 15 }, // Order Status
        { wch: 20 }, // Tracking Number
        { wch: 15 }, // Order Date
        { wch: 15 }, // Paid At
      ];
      ws['!cols'] = colWidths;

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Orders');

      // Generate filename
      const filename = `orders_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
      toast.success(`Excel file downloaded: ${filename}`);
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast.error('Failed to generate Excel file');
    }
  };

  const openDispatchModal = (order) => {
    setSelectedOrder(order);
    setDispatchData({
      trackingNumber: order.trackingNumber || '',
      courierName: '',
      estimatedDelivery: '',
      notes: ''
    });
    setShowDispatchModal(true);
  };

  const openRefundModal = (order) => {
    setSelectedOrder(order);
    setRefundData({
      amount: order.totalPrice,
      reason: ''
    });
    setShowRefundModal(true);
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setStatusData({
      status: order.orderStatus,
      note: ''
    });
    setShowStatusModal(true);
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.phone?.includes(searchTerm);

    const matchesStatus = !statusFilter || order.orderStatus === statusFilter;
    const matchesPayment = !paymentFilter ||
      (paymentFilter === 'paid' && order.isPaid) ||
      (paymentFilter === 'pending' && !order.isPaid) ||
      (paymentFilter === 'cod' && order.paymentMethod === 'COD') ||
      (paymentFilter === 'online' && order.paymentMethod !== 'COD');

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.orderStatus === 'Pending').length;
    const processing = orders.filter(o => o.orderStatus === 'Processing').length;
    const shipped = orders.filter(o => o.orderStatus === 'Shipped').length;
    const delivered = orders.filter(o => o.orderStatus === 'Delivered').length;
    const cancelled = orders.filter(o => o.orderStatus === 'Cancelled').length;
    const totalRevenue = orders
      .filter(o => o.isPaid)
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    return { total, pending, processing, shipped, delivered, cancelled, totalRevenue };
  };

  const stats = getOrderStats();

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Processing': 'bg-blue-100 text-blue-800 border-blue-300',
      'Shipped': 'bg-purple-100 text-purple-800 border-purple-300',
      'Delivered': 'bg-green-100 text-green-800 border-green-300',
      'Cancelled': 'bg-red-100 text-red-800 border-red-300',
      'Refunded': 'bg-gray-100 text-gray-800 border-gray-300',
      'Payment Failed': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Orders Management</h2>
            <p className="text-gray-600 mt-1">Track, manage and process customer orders</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={downloadExcel}
              disabled={filteredOrders.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
              title="Download all filtered orders as Excel"
            >
              <FaFileExcel /> Download Excel
            </button>
            <button
              onClick={handlePrintStickers}
              disabled={orders.filter(o => o.isPaid).length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
              title="Print shipping stickers for all paid orders"
            >
              <FaPrint /> Print Stickers
            </button>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-[#5A0F1B] text-white rounded-lg hover:bg-[#7A1525] transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow-lg">
            <p className="text-sm opacity-90">Total Orders</p>
            <p className="text-3xl font-bold mt-1">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg p-4 shadow-lg">
            <p className="text-sm opacity-90">Pending</p>
            <p className="text-3xl font-bold mt-1">{stats.pending}</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-lg p-4 shadow-lg">
            <p className="text-sm opacity-90">Processing</p>
            <p className="text-3xl font-bold mt-1">{stats.processing}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4 shadow-lg">
            <p className="text-sm opacity-90">Shipped</p>
            <p className="text-3xl font-bold mt-1">{stats.shipped}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4 shadow-lg">
            <p className="text-sm opacity-90">Delivered</p>
            <p className="text-3xl font-bold mt-1">{stats.delivered}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-4 shadow-lg">
            <p className="text-sm opacity-90">Cancelled</p>
            <p className="text-3xl font-bold mt-1">{stats.cancelled}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg p-4 shadow-lg">
            <p className="text-sm opacity-90">Revenue</p>
            <p className="text-2xl font-bold mt-1">₹{(stats.totalRevenue / 1000).toFixed(1)}k</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order#, Name, Email, Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B] focus:ring-1 focus:ring-[#5A0F1B]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B]"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Refunded">Refunded</option>
              <option value="Payment Failed">Payment Failed</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B]"
            >
              <option value="">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Payment Pending</option>
              <option value="cod">COD</option>
              <option value="online">Online Payment</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#5A0F1B]"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Order #</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4">
                        <div>
                          <span className="font-mono text-sm font-bold text-[#5A0F1B]">
                            {order.orderNumber}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">ID: {order._id.slice(-8)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.user?.name || 'Guest'}</p>
                          <p className="text-xs text-gray-500">{order.user?.email}</p>
                          <p className="text-xs text-gray-500">{order.shippingAddress?.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <FaBox className="text-gray-400" />
                          <span className="text-sm font-medium">{order.items?.length || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-gray-900">₹{order.totalPrice?.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <div className="flex items-center gap-1 text-sm">
                            {order.paymentMethod === 'COD' ? (
                              <FaMoneyBillWave className="text-green-600" />
                            ) : (
                              <FaMoneyBillWave className="text-blue-600" />
                            )}
                            <span className="font-medium">{order.paymentMethod}</span>
                          </div>
                          {order.isPaid ? (
                            <span className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-1">
                              <FaCheck /> Paid
                            </span>
                          ) : (
                            <span className="text-xs text-yellow-600 font-semibold flex items-center gap-1 mt-1">
                              <FaTimes /> Pending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewOrderDetails(order)}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => openStatusModal(order)}
                            className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                            title="Update Status"
                          >
                            <FaEdit />
                          </button>
                          {!['Delivered', 'Cancelled'].includes(order.orderStatus) && (
                            <button
                              onClick={() => openDispatchModal(order)}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                              title="Dispatch Order"
                            >
                              <FaTruck />
                            </button>
                          )}
                          {order.isPaid && !order.isRefunded && (
                            <button
                              onClick={() => openRefundModal(order)}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                              title="Process Refund"
                            >
                              <FaMoneyBillWave />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Orders Found</h3>
            <p className="text-gray-600">No orders match your search criteria</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] text-white">
              <div>
                <h3 className="text-2xl font-bold">Order Details</h3>
                <p className="text-sm opacity-90 mt-1">Order #{selectedOrder.orderNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-white text-[#5A0F1B] rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-semibold"
                >
                  <FaPrint /> Print
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Print content */}
              <div ref={printRef} className="space-y-6">
                {/* Header for print */}
                <div className="print-only text-center mb-6">
                  <h1 className="text-3xl font-bold text-[#5A0F1B]">Saree Elegance</h1>
                  <p className="text-gray-600">Order Invoice</p>
                  <hr className="my-4" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer & Order Info */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FaShoppingCart className="text-[#5A0F1B]" />
                        Order Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-semibold">Order Number:</span> {selectedOrder.orderNumber}</p>
                        <p><span className="font-semibold">Order Date:</span> {formatDate(selectedOrder.createdAt)}</p>
                        <p><span className="font-semibold">Order ID:</span> <span className="font-mono text-xs">{selectedOrder._id}</span></p>
                        <p>
                          <span className="font-semibold">Status:</span>{' '}
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(selectedOrder.orderStatus)}`}>
                            {selectedOrder.orderStatus}
                          </span>
                        </p>
                        {selectedOrder.trackingNumber && (
                          <p><span className="font-semibold">Tracking #:</span> {selectedOrder.trackingNumber}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-bold text-gray-900 mb-3">Customer Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-semibold">Name:</span> {selectedOrder.user?.name || 'Guest'}</p>
                        <p><span className="font-semibold">Email:</span> {selectedOrder.user?.email}</p>
                        <p><span className="font-semibold">Phone:</span> {selectedOrder.shippingAddress?.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-3">Shipping Address</h4>
                    <div className="text-sm space-y-1">
                      <p className="font-semibold">{selectedOrder.shippingAddress?.fullName}</p>
                      <p>{selectedOrder.shippingAddress?.addressLine1}</p>
                      {selectedOrder.shippingAddress?.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                      <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                      <p>{selectedOrder.shippingAddress?.pincode}</p>
                      <p className="mt-2"><span className="font-semibold">Phone:</span> {selectedOrder.shippingAddress?.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex gap-4 bg-gray-50 rounded-lg p-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <div className="flex gap-3 mt-1 text-sm text-gray-600">
                            <span>Qty: {item.quantity}</span>
                            {item.size && <span>• Size: {item.size}</span>}
                            {item.color?.name && <span>• Color: {item.color.name}</span>}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Unit Price: ₹{item.price?.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#5A0F1B] text-lg">₹{(item.price * item.quantity)?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal ({selectedOrder.items?.length} items):</span>
                      <span className="font-semibold">₹{selectedOrder.itemsPrice?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Shipping:</span>
                      <span className="font-semibold text-green-600">
                        {selectedOrder.shippingPrice === 0 ? 'Free' : `₹${selectedOrder.shippingPrice}`}
                      </span>
                    </div>
                    {selectedOrder.taxPrice > 0 && (
                      <div className="flex justify-between text-gray-700">
                        <span>Tax:</span>
                        <span className="font-semibold">₹{selectedOrder.taxPrice?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-[#5A0F1B]">₹{selectedOrder.totalPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 mb-3">Payment Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Payment Method:</p>
                      <p className="font-semibold">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Payment Status:</p>
                      <p className={`font-semibold ${selectedOrder.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedOrder.isPaid ? 'Paid' : 'Pending'}
                      </p>
                    </div>
                    {selectedOrder.isPaid && selectedOrder.paidAt && (
                      <div className="col-span-2">
                        <p className="text-gray-600">Paid On:</p>
                        <p className="font-semibold">{formatDate(selectedOrder.paidAt)}</p>
                      </div>
                    )}
                    {selectedOrder.razorpayOrderId && (
                      <div className="col-span-2">
                        <p className="text-gray-600">Razorpay Order ID:</p>
                        <p className="font-mono text-xs">{selectedOrder.razorpayOrderId}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status History */}
                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Status History</h4>
                    <div className="space-y-2">
                      {selectedOrder.statusHistory.map((history, index) => (
                        <div key={index} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 bg-[#5A0F1B] rounded-full"></div>
                            {index < selectedOrder.statusHistory.length - 1 && (
                              <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{history.status}</p>
                            {history.note && <p className="text-sm text-gray-600">{history.note}</p>}
                            <p className="text-xs text-gray-500 mt-1">{formatDate(history.updatedAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Update Order Status</h3>
              <p className="text-sm text-gray-600 mt-1">Order #{selectedOrder.orderNumber}</p>
            </div>
            <form onSubmit={handleStatusUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Status</label>
                <select
                  value={statusData.status}
                  onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B]"
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Note (Optional)</label>
                <textarea
                  value={statusData.note}
                  onChange={(e) => setStatusData({ ...statusData, note: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B]"
                  placeholder="Add a note about this status change..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={processingAction}
                  className="flex-1 px-4 py-3 bg-[#5A0F1B] text-white rounded-lg hover:bg-[#7A1525] transition font-semibold disabled:opacity-50"
                >
                  {processingAction ? 'Updating...' : 'Update Status'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {showDispatchModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaTruck /> Dispatch Order
              </h3>
              <p className="text-sm opacity-90 mt-1">Order #{selectedOrder.orderNumber}</p>
            </div>
            <form onSubmit={handleDispatchUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tracking Number *</label>
                <input
                  type="text"
                  value={dispatchData.trackingNumber}
                  onChange={(e) => setDispatchData({ ...dispatchData, trackingNumber: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Enter tracking number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Courier Name *</label>
                <select
                  value={dispatchData.courierName}
                  onChange={(e) => setDispatchData({ ...dispatchData, courierName: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select Courier</option>
                  <option value="BlueDart">BlueDart</option>
                  <option value="DTDC">DTDC</option>
                  <option value="Delhivery">Delhivery</option>
                  <option value="FedEx">FedEx</option>
                  <option value="India Post">India Post</option>
                  <option value="Professional Couriers">Professional Couriers</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Delivery</label>
                <input
                  type="date"
                  value={dispatchData.estimatedDelivery}
                  onChange={(e) => setDispatchData({ ...dispatchData, estimatedDelivery: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={dispatchData.notes}
                  onChange={(e) => setDispatchData({ ...dispatchData, notes: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Any additional notes..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={processingAction}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processingAction ? 'Dispatching...' : <><FaTruck /> Dispatch Order</>}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaMoneyBillWave /> Process Refund
              </h3>
              <p className="text-sm opacity-90 mt-1">Order #{selectedOrder.orderNumber}</p>
            </div>
            <form onSubmit={handleRefund} className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This action will process a refund through Razorpay and cannot be undone.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Refund Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={refundData.amount}
                  onChange={(e) => setRefundData({ ...refundData, amount: e.target.value })}
                  max={selectedOrder.totalPrice}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  placeholder={`Max: ₹${selectedOrder.totalPrice}`}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to refund full amount</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Refund Reason *</label>
                <textarea
                  value={refundData.reason}
                  onChange={(e) => setRefundData({ ...refundData, reason: e.target.value })}
                  required
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  placeholder="Explain why refund is being processed..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={processingAction}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50"
                >
                  {processingAction ? 'Processing...' : 'Process Refund'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden Shipping Stickers Print Component */}
      <div style={{ display: 'none' }}>
        <div ref={stickersPrintRef} className="p-0">
          {orders.filter(order => order.isPaid).map((order, index) => (
            <div
              key={order._id}
              className="page-break"
              style={{
                width: '100%',
                minHeight: '380px',
                padding: '12px',
                border: '3px solid #333',
                marginBottom: '15px',
                pageBreakAfter: 'always',
                pageBreakInside: 'avoid',
                boxSizing: 'border-box'
              }}
            >
              {/* Sticker Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', borderBottom: '2px solid #5A0F1B', paddingBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#5A0F1B', margin: 0, lineHeight: '1.2' }}>
                    Saree Elegance
                  </h3>
                  <p style={{ fontSize: '10px', color: '#666', margin: '3px 0' }}>Premium Sarees Collection</p>
                  <p style={{ fontSize: '9px', color: '#333', margin: '2px 0', fontWeight: 'bold' }}>
                    ORDER: {order.orderNumber}
                  </p>
                  <p style={{ fontSize: '8px', color: '#666', margin: '2px 0' }}>
                    Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <QRCodeCanvas
                    value={`ORDER:${order.orderNumber}|AMOUNT:${order.totalPrice}|ITEMS:${order.items?.length || 0}`}
                    size={70}
                    level="M"
                    style={{ display: 'block' }}
                  />
                </div>
              </div>

              {/* Main Content */}
              <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: '10px' }}>
                {/* Left: Shipping Address */}
                <div>
                  <div style={{
                    backgroundColor: '#fff',
                    padding: '10px',
                    border: '3px solid #5A0F1B',
                    borderRadius: '8px',
                    minHeight: '200px'
                  }}>
                    <div style={{
                      backgroundColor: '#5A0F1B',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      DELIVER TO
                    </div>
                    <p style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 4px 0', lineHeight: '1.2', color: '#000' }}>
                      {order.shippingAddress?.fullName}
                    </p>
                    <p style={{ fontSize: '12px', margin: '0', lineHeight: '1.4', color: '#333' }}>
                      {order.shippingAddress?.addressLine1}
                    </p>
                    {order.shippingAddress?.addressLine2 && (
                      <p style={{ fontSize: '12px', margin: '0', lineHeight: '1.4', color: '#333' }}>
                        {order.shippingAddress.addressLine2}
                      </p>
                    )}
                    <p style={{ fontSize: '12px', margin: '4px 0 0 0', lineHeight: '1.4', color: '#333' }}>
                      {order.shippingAddress?.city}, {order.shippingAddress?.state}
                    </p>
                    <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '4px 0', color: '#000' }}>
                      PIN: {order.shippingAddress?.pincode}
                    </p>
                    <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '6px 0 0 0', color: '#000' }}>
                      📞 {order.shippingAddress?.phone}
                    </p>
                  </div>
                </div>

                {/* Order Details */}
                <div>
                  <div style={{
                    backgroundColor: '#fff9f0',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                      <div>
                        <p style={{ margin: '0 0 3px 0', color: '#666' }}>Total Items:</p>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px' }}>
                          {order.items?.length || 0} item(s)
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 3px 0', color: '#666' }}>Order Value:</p>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px', color: '#5A0F1B' }}>
                          ₹{order.totalPrice?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 3px 0', color: '#666' }}>Payment:</p>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '12px' }}>
                          {order.paymentMethod}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 3px 0', color: '#666' }}>Status:</p>
                        <p style={{
                          margin: 0,
                          fontWeight: 'bold',
                          fontSize: '12px',
                          color: order.isPaid ? '#16a34a' : '#ca8a04'
                        }}>
                          {order.isPaid ? '✓ PAID' : 'PENDING'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Info */}
                  {order.trackingNumber && (
                    <div style={{
                      backgroundColor: '#e8f5e9',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #4caf50',
                      marginBottom: '8px'
                    }}>
                      <p style={{ margin: '0 0 3px 0', fontSize: '10px', color: '#2e7d32', fontWeight: 'bold' }}>
                        TRACKING NUMBER:
                      </p>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                        {order.trackingNumber}
                      </p>
                    </div>
                  )}

                  {/* Items List */}
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    maxHeight: '80px',
                    overflowY: 'auto'
                  }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '10px', fontWeight: 'bold', color: '#666' }}>
                      ITEMS:
                    </p>
                    {order.items?.slice(0, 3).map((item, idx) => (
                      <p key={idx} style={{ margin: '2px 0', fontSize: '10px', lineHeight: '1.3' }}>
                        • {item.name} ({item.quantity}x)
                      </p>
                    ))}
                    {order.items?.length > 3 && (
                      <p style={{ margin: '2px 0', fontSize: '10px', fontStyle: 'italic', color: '#666' }}>
                        +{order.items.length - 3} more item(s)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Return Address Section */}
              <div style={{
                borderTop: '2px dashed #999',
                marginTop: '10px',
                paddingTop: '8px'
              }}>
                <p style={{
                  margin: '0 0 5px 0',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  color: '#d32f2f',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  ⚠ If Undelivered, Please Return To:
                </p>
                <div style={{
                  backgroundColor: '#fff3e0',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  border: '1px solid #ff9800'
                }}>
                  <p style={{ margin: '0 0 2px 0', fontSize: '11px', fontWeight: 'bold', color: '#000' }}>
                    Saree Elegance
                  </p>
                  <p style={{ margin: '0', fontSize: '9px', lineHeight: '1.3', color: '#333' }}>
                    123 Fashion Street, Textile Hub<br />
                    Mumbai, Maharashtra - 400001<br />
                    Phone: +91 98765 43210
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                borderTop: '2px solid #5A0F1B',
                marginTop: '8px',
                paddingTop: '6px',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, fontSize: '9px', color: '#666' }}>
                  Thank you for shopping with us! For queries: contact@sareeelegance.com
                </p>
              </div>
            </div>
          ))}

          {/* Print Styles */}
          <style>{`
            @media print {
              .page-break {
                page-break-inside: avoid;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
          `}</style>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
