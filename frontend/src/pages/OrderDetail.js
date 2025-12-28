import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaBox, FaTruck, FaHome, FaTimesCircle, FaMoneyBillWave, FaCreditCard, FaCalendar, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { toast } from 'react-toastify';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrder();
  }, [id, isAuthenticated]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/orders/${id}`);
      setOrder(data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch order details');
      if (error.response?.status === 404) {
        navigate('/orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancelling(true);
    try {
      await API.put(`/orders/${id}/cancel`);
      toast.success('Order cancelled successfully');
      fetchOrder(); // Refresh order details
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Refunded': 'bg-gray-100 text-gray-800',
      'Payment Failed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': <FaBox className="text-yellow-600" />,
      'Processing': <FaBox className="text-blue-600" />,
      'Shipped': <FaTruck className="text-purple-600" />,
      'Delivered': <FaCheckCircle className="text-green-600" />,
      'Cancelled': <FaTimesCircle className="text-red-600" />,
      'Refunded': <FaMoneyBillWave className="text-gray-600" />,
      'Payment Failed': <FaTimesCircle className="text-red-600" />
    };
    return icons[status] || <FaBox className="text-gray-600" />;
  };

  const canCancelOrder = (order) => {
    return order &&
           !['Cancelled', 'Delivered', 'Refunded'].includes(order.orderStatus) &&
           (!order.isPaid || order.paymentMethod === 'COD');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#5A0F1B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <Link to="/orders" className="px-6 py-3 bg-[#5A0F1B] text-white rounded-lg hover:bg-[#7A1525] transition-colors">
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  const isPaymentSuccess = order.isPaid || order.paymentMethod === 'COD';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Success/Failure Banner */}
        {isPaymentSuccess ? (
          <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-500 rounded-full p-4">
                <FaCheckCircle className="text-5xl text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-green-900 mb-2">
              {order.paymentMethod === 'COD' ? 'Order Placed Successfully!' : 'Payment Successful!'}
            </h1>
            <p className="text-center text-green-800 mb-4">
              Thank you for your order! Your order has been confirmed.
            </p>
            <div className="text-center">
              <p className="text-sm text-green-700">Order Number: <span className="font-bold">{order.orderNumber}</span></p>
              <p className="text-sm text-green-700">Order ID: <span className="font-mono text-xs">{order._id}</span></p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-500 rounded-full p-4">
                <FaTimesCircle className="text-5xl text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-red-900 mb-2">Payment Pending</h1>
            <p className="text-center text-red-800 mb-4">
              Your order is created but payment is not completed yet.
            </p>
            <div className="text-center">
              <p className="text-sm text-red-700">Order Number: <span className="font-bold">{order.orderNumber}</span></p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status</h2>
              <div className="flex items-center gap-3 mb-4">
                {getStatusIcon(order.orderStatus)}
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </div>

              {/* Status Timeline */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Timeline</h3>
                  <div className="space-y-3">
                    {order.statusHistory.map((history, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-[#5A0F1B] rounded-full"></div>
                          {index < order.statusHistory.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-semibold text-gray-900">{history.status}</p>
                          {history.note && <p className="text-sm text-gray-600">{history.note}</p>}
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(history.updatedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancel Order Button */}
              {canCancelOrder(order) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item._id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600">
                        <span>Qty: {item.quantity}</span>
                        {item.size && <span>• Size: {item.size}</span>}
                        {item.color?.name && <span>• Color: {item.color.name}</span>}
                      </div>
                      <p className="text-lg font-bold text-[#5A0F1B] mt-2">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-[#5A0F1B]" />
                Shipping Address
              </h2>
              <div className="text-gray-700">
                <p className="font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
                <p className="mt-2">{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
                <p className="mt-2 flex items-center gap-2">
                  <FaPhone className="text-[#5A0F1B]" />
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Payment & Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              {/* Payment Method */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2 text-gray-700">
                  {order.paymentMethod === 'COD' ? (
                    <FaMoneyBillWave className="text-green-600" />
                  ) : (
                    <FaCreditCard className="text-blue-600" />
                  )}
                  <div>
                    <p className="text-sm font-semibold">Payment Method</p>
                    <p className="text-sm">
                      {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
                    </p>
                  </div>
                </div>
                {order.isPaid && (
                  <div className="mt-2 flex items-center gap-2 text-green-600">
                    <FaCheckCircle />
                    <span className="text-sm font-semibold">Paid on {formatDate(order.paidAt)}</span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Items Total ({order.items.length} items)</span>
                  <span className="font-semibold">₹{order.itemsPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">
                    {order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}
                  </span>
                </div>
                {order.taxPrice > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Tax</span>
                    <span className="font-semibold">₹{order.taxPrice.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-3 border-t-2 border-gray-200 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-[#5A0F1B]">₹{order.totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Order Date */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <FaCalendar />
                  <span>Ordered on {formatDate(order.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/orders"
                  className="block w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-center rounded-lg font-semibold transition-colors"
                >
                  View All Orders
                </Link>
                <Link
                  to="/products"
                  className="block w-full px-4 py-2 bg-[#5A0F1B] hover:bg-[#7A1525] text-white text-center rounded-lg font-semibold transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gradient-to-br from-[#5A0F1B]/10 to-[#7A1525]/10 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-700 mb-4">
                If you have any questions about your order, please contact our customer support.
              </p>
              <Link
                to="/contact"
                className="block w-full px-4 py-2 bg-white hover:bg-gray-50 text-[#5A0F1B] text-center rounded-lg font-semibold border-2 border-[#5A0F1B] transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
