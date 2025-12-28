import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBox, FaShippingFast, FaCheckCircle, FaTruck, FaTimesCircle, FaChevronDown, FaChevronUp, FaDownload, FaExclamationCircle } from 'react-icons/fa';
import API from '../utils/api';
import { toast } from 'react-toastify';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [cancellingOrder, setCancellingOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/orders');
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancellingOrder(orderId);
    try {
      await API.put(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled successfully');
      fetchOrders(); // Refresh orders
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel order';
      toast.error(message);
    } finally {
      setCancellingOrder(null);
    }
  };

  const canCancelOrder = (order) => {
    const status = order.orderStatus?.toLowerCase();
    return status === 'pending' || status === 'processing';
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    const colors = {
      pending: 'text-yellow-700 bg-yellow-100 border-yellow-200',
      processing: 'text-blue-700 bg-blue-100 border-blue-200',
      shipped: 'text-purple-700 bg-purple-100 border-purple-200',
      delivered: 'text-green-700 bg-green-100 border-green-200',
      cancelled: 'text-red-700 bg-red-100 border-red-200',
      refunded: 'text-gray-700 bg-gray-100 border-gray-200'
    };
    return colors[statusLower] || 'text-gray-700 bg-gray-100 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    const icons = {
      pending: <FaBox />,
      processing: <FaShippingFast />,
      shipped: <FaTruck />,
      delivered: <FaCheckCircle />,
      cancelled: <FaTimesCircle />,
      refunded: <FaTimesCircle />
    };
    return icons[statusLower] || <FaBox />;
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.orderStatus?.toLowerCase() === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
              <FaBox className="text-5xl text-amber-600" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-800 mb-3">No orders yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start shopping for beautiful sarees and your orders will appear here
            </p>
            <Link
              to="/products"
              className="inline-block px-8 py-3 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 text-white font-semibold rounded-lg shadow-md transition-all"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">{orders.length} {orders.length === 1 ? 'order' : 'orders'} placed</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm capitalize transition-all ${
                filterStatus === status
                  ? 'bg-amber-700 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {status}
              {status === 'all' && ` (${orders.length})`}
              {status !== 'all' && ` (${orders.filter(o => o.orderStatus?.toLowerCase() === status).length})`}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <FaExclamationCircle className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No orders found with status: <span className="font-semibold capitalize">{filterStatus}</span></p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                {/* Order Header */}
                <div
                  className="p-4 md:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleOrderExpand(order._id)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">
                        {getStatusIcon(order.orderStatus)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 text-lg">
                            Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                          </h3>
                          <span className={`px-3 py-1 text-xs font-bold capitalize rounded-full border ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{order.totalPrice?.toLocaleString()}
                        </p>
                        <p className={`text-xs font-semibold capitalize mt-1 px-2 py-1 rounded ${order.isPaid ? 'text-green-700 bg-green-100' : 'text-yellow-700 bg-yellow-100'}`}>
                          {order.paymentMethod === 'COD' ? 'Cash on Delivery' : (order.isPaid ? 'Paid' : 'Payment Pending')}
                        </p>
                      </div>
                      <div className="text-gray-400">
                        {expandedOrder === order._id ? <FaChevronUp size={20} /> : <FaChevronDown size={20} />}
                      </div>
                    </div>
                  </div>

                  {/* Quick Summary - Visible when collapsed */}
                  {expandedOrder !== order._id && (
                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                      <span>{order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}</span>
                      <span>•</span>
                      <span className="truncate">{order.shippingAddress?.city}, {order.shippingAddress?.state}</span>
                    </div>
                  )}
                </div>

                {/* Order Details - Expandable */}
                {expandedOrder === order._id && (
                  <div className="border-t border-gray-200 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white">
                    {/* Order Items */}
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-900 mb-4 text-lg">Order Items</h4>
                      <div className="space-y-3">
                        {order.items?.map((item, index) => (
                          <div key={index} className="flex gap-4 bg-white p-4 rounded-lg border border-gray-100 hover:border-amber-200 transition-colors">
                            <Link to={`/products/${item.product?._id}`} className="flex-shrink-0">
                              <img
                                src={item.product?.images?.[0] || '/placeholder.jpg'}
                                alt={item.product?.name}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                            </Link>
                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/products/${item.product?._id}`}
                                className="block font-semibold text-gray-900 hover:text-amber-700 transition-colors mb-2"
                              >
                                {item.product?.name}
                              </Link>
                              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                                {item.size && <span className="px-2 py-1 bg-gray-100 rounded">Size: {item.size}</span>}
                                {item.color && <span className="px-2 py-1 bg-gray-100 rounded">Color: {item.color}</span>}
                                <span className="px-2 py-1 bg-gray-100 rounded">Qty: {item.quantity}</span>
                              </div>
                              <p className="text-lg font-bold text-gray-900">
                                ₹{(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Shipping Address */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 text-lg">Shipping Address</h4>
                        <div className="bg-white p-5 rounded-lg border border-gray-200">
                          <p className="font-semibold text-gray-900 text-lg">{order.shippingAddress?.fullName}</p>
                          <p className="text-gray-600 mt-1 flex items-center gap-2">
                            <span className="text-amber-600">📞</span>
                            {order.shippingAddress?.phone}
                          </p>
                          <p className="text-gray-600 mt-3">
                            {order.shippingAddress?.addressLine1}
                          </p>
                          {order.shippingAddress?.addressLine2 && (
                            <p className="text-gray-600">
                              {order.shippingAddress.addressLine2}
                            </p>
                          )}
                          <p className="text-gray-600">
                            {order.shippingAddress?.city}, {order.shippingAddress?.state}
                          </p>
                          <p className="text-gray-600">
                            PIN: {order.shippingAddress?.pincode}
                          </p>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 text-lg">Order Summary</h4>
                        <div className="bg-white p-5 rounded-lg border border-gray-200 space-y-3">
                          <div className="flex justify-between text-gray-700">
                            <span>Items Price</span>
                            <span className="font-semibold">₹{order.itemsPrice?.toLocaleString()}</span>
                          </div>
                          {order.taxPrice > 0 && (
                            <div className="flex justify-between text-gray-700">
                              <span>Tax</span>
                              <span className="font-semibold">₹{order.taxPrice.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-gray-700">
                            <span>Shipping</span>
                            <span className="font-semibold">
                              {order.shippingPrice === 0 ? <span className="text-green-600">FREE</span> : `₹${order.shippingPrice}`}
                            </span>
                          </div>
                          <div className="flex justify-between pt-3 border-t-2 border-gray-200 text-lg">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="font-bold text-amber-700">₹{order.totalPrice?.toLocaleString()}</span>
                          </div>
                          <div className="pt-3 border-t border-gray-200 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Payment Method</span>
                              <span className="font-semibold text-gray-900">
                                {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Payment Status</span>
                              <span className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                                {order.isPaid ? '✓ Paid' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tracking Info */}
                    {order.trackingNumber && (
                      <div className="mt-6">
                        <h4 className="font-bold text-gray-900 mb-3 text-lg">Tracking Information</h4>
                        <div className="bg-amber-50 p-5 rounded-lg border border-amber-200">
                          <p className="text-gray-700">
                            Tracking Number: <span className="font-bold text-amber-700">{order.trackingNumber}</span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Order Timeline */}
                    {order.statusHistory && order.statusHistory.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-bold text-gray-900 mb-4 text-lg">Order Timeline</h4>
                        <div className="bg-white p-5 rounded-lg border border-gray-200">
                          <div className="space-y-5">
                            {order.statusHistory.map((history, index) => (
                              <div key={index} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                  <div className={`w-4 h-4 rounded-full ${index === 0 ? 'bg-amber-600 shadow-lg' : 'bg-gray-300'}`}></div>
                                  {index < order.statusHistory.length - 1 && (
                                    <div className="w-0.5 flex-1 bg-gray-300 my-1"></div>
                                  )}
                                </div>
                                <div className="flex-1 pb-2">
                                  <p className="font-semibold text-gray-900 capitalize text-lg">{history.status}</p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {new Date(history.updatedAt).toLocaleString('en-IN', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                  {history.note && (
                                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">{history.note}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      {canCancelOrder(order) && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancellingOrder === order._id}
                          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingOrder === order._id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                      <Link
                        to={`/orders/${order._id}`}
                        className="px-6 py-3 border-2 border-amber-600 text-amber-700 hover:bg-amber-50 font-semibold rounded-lg transition-all"
                      >
                        View Details
                      </Link>
                      <button
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg transition-all flex items-center gap-2"
                        onClick={() => toast.info('Invoice download feature coming soon')}
                      >
                        <FaDownload />
                        Download Invoice
                      </button>
                    </div>

                    {/* Cancellation Notice */}
                    {canCancelOrder(order) && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>Note:</strong> You can cancel this order until it's shipped. Once shipped, cancellation is not possible.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
