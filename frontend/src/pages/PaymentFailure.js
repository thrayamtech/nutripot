import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTimesCircle, FaExclamationTriangle, FaRedo, FaHome, FaShoppingBag } from 'react-icons/fa';

const PaymentFailure = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, errorMessage, errorCode } = location.state || {};

  useEffect(() => {
    // If accessed directly without state, redirect to home
    if (!orderId && !errorMessage) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [orderId, errorMessage, navigate]);

  const getErrorDetails = () => {
    if (errorMessage) {
      return errorMessage;
    }

    switch (errorCode) {
      case 'payment_cancelled':
        return 'Payment was cancelled by you.';
      case 'payment_timeout':
        return 'Payment session expired. Please try again.';
      case 'insufficient_funds':
        return 'Insufficient funds in your account.';
      case 'authentication_failed':
        return 'Payment authentication failed.';
      case 'network_error':
        return 'Network error occurred. Please check your connection.';
      default:
        return 'An unexpected error occurred during payment processing.';
    }
  };

  const handleRetryPayment = () => {
    if (orderId) {
      navigate('/checkout', { state: { retryOrderId: orderId } });
    } else {
      navigate('/cart');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {/* Error Banner */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-8 mb-6">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-red-500 rounded-full p-6 animate-pulse">
              <FaTimesCircle className="text-6xl text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-center text-red-900 mb-3">
            Payment Failed
          </h1>
          <p className="text-center text-red-800 text-lg mb-6">
            We couldn't process your payment. Don't worry, no money was deducted.
          </p>

          {/* Error Details */}
          <div className="bg-white border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-red-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 mb-1">Error Details:</p>
                <p className="text-gray-700">{getErrorDetails()}</p>
                {errorCode && (
                  <p className="text-xs text-gray-500 mt-2">Error Code: {errorCode}</p>
                )}
              </div>
            </div>
          </div>

          {orderId && (
            <div className="text-center">
              <p className="text-sm text-red-700">
                Order ID: <span className="font-mono font-semibold">{orderId}</span>
              </p>
              <p className="text-xs text-red-600 mt-1">
                Your order is saved. You can complete the payment later from your orders page.
              </p>
            </div>
          )}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Retry Payment */}
          <button
            onClick={handleRetryPayment}
            className="bg-white hover:bg-gray-50 border-2 border-[#2d7d32] rounded-lg p-6 text-center transition-all transform hover:scale-105"
          >
            <div className="flex justify-center mb-3">
              <div className="bg-[#2d7d32] rounded-full p-4">
                <FaRedo className="text-3xl text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Retry Payment</h3>
            <p className="text-sm text-gray-600">
              Try completing your payment again
            </p>
          </button>

          {/* View Order */}
          {orderId && (
            <Link
              to={`/orders/${orderId}`}
              className="bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-lg p-6 text-center transition-all transform hover:scale-105"
            >
              <div className="flex justify-center mb-3">
                <div className="bg-blue-600 rounded-full p-4">
                  <FaShoppingBag className="text-3xl text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">View Order</h3>
              <p className="text-sm text-gray-600">
                Check your order details
              </p>
            </Link>
          )}
        </div>

        {/* Information Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Why did this happen?</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-[#2d7d32] font-bold mt-1">•</span>
              <span>Insufficient balance in your account</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#2d7d32] font-bold mt-1">•</span>
              <span>Payment gateway timeout or network issue</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#2d7d32] font-bold mt-1">•</span>
              <span>Incorrect card details or CVV</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#2d7d32] font-bold mt-1">•</span>
              <span>Bank declined the transaction</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#2d7d32] font-bold mt-1">•</span>
              <span>Payment cancelled by user</span>
            </li>
          </ul>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-br from-[#2d7d32]/10 to-[#1e6623]/10 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Need Assistance?</h3>
          <p className="text-gray-700 mb-4">
            If you're facing repeated payment failures, our support team is here to help.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="px-6 py-3 bg-[#2d7d32] hover:bg-[#1e6623] text-white rounded-lg font-semibold transition-colors"
            >
              Contact Support
            </Link>
            <Link
              to="/orders"
              className="px-6 py-3 bg-white hover:bg-gray-50 text-[#2d7d32] border-2 border-[#2d7d32] rounded-lg font-semibold transition-colors"
            >
              My Orders
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#2d7d32] hover:text-[#1e6623] font-semibold"
          >
            <FaHome />
            <span>Return to Home</span>
          </Link>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 All transactions are secure and encrypted. No payment information is stored on our servers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
