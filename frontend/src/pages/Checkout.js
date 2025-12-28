import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaCheckCircle, FaCreditCard, FaMobile, FaUniversity, FaMoneyBillWave } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { toast } from 'react-toastify';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [codEnabled, setCodEnabled] = useState(true); // Default to enabled
  const [formData, setFormData] = useState({
    // Shipping Address
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    // Payment
    paymentMethod: 'Card'
  });

  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Fetch COD setting
    fetchCodSetting();
  }, []);

  const fetchCodSetting = async () => {
    try {
      const { data } = await API.get('/settings/public');
      const codValue = data.settings?.cod_enabled;
      setCodEnabled(codValue === undefined ? true : codValue);
    } catch (error) {
      console.error('Error fetching COD setting:', error);
      setCodEnabled(true); // Default to enabled if fetch fails
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.phone ||
        !formData.addressLine1 || !formData.city || !formData.state || !formData.pincode) {
      toast.error('Please fill in all required fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (formData.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }

    if (formData.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }

    return true;
  };

  const handleRazorpayPayment = async (razorpayOrderId, amount) => {
    try {
      const { data: keyData } = await API.get('/payment/razorpay-key');

      const options = {
        key: keyData.key,
        amount: amount * 100,
        currency: 'INR',
        name: 'Saree Elegance',
        description: 'Purchase from Saree Elegance',
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            const { data } = await API.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            toast.success('Payment successful!');
            await clearCart();
            navigate(`/orders/${data.order._id}`);
          } catch (error) {
            toast.error('Payment verification failed');
            console.error(error);
            setLoading(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#5A0F1B'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setLoading(false);
      toast.error('Failed to initialize payment');
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await API.post('/orders', {
        items: cart.items.map(item => ({
          product: item.product._id,
          name: item.product.name,
          image: item.product.images?.[0] || '',
          quantity: item.quantity,
          price: item.product.discountPrice || item.product.price,
          size: item.size || 'Standard',
          color: item.color ? { name: item.color } : undefined
        })),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2 || '',
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        paymentMethod: formData.paymentMethod === 'COD' ? 'COD' : formData.paymentMethod
      });

      if (formData.paymentMethod !== 'COD') {
        await handleRazorpayPayment(data.razorpayOrderId, data.totalPrice);
      } else {
        toast.success('Order placed successfully!');
        await clearCart();
        navigate(`/orders/${data._id}`);
      }
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || 'Failed to place order';
      toast.error(message);
      console.error(error);
    }
  };

  if (!cart || !cart.items) {
    return null;
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 999 ? 0 : 50;
  const total = subtotal + shipping;

  const paymentMethods = [
    {
      value: 'Card',
      label: 'Credit / Debit Card',
      icon: <FaCreditCard className="text-xl" />,
      description: 'Visa, Mastercard, RuPay'
    },
    {
      value: 'UPI',
      label: 'UPI',
      icon: <FaMobile className="text-xl" />,
      description: 'Google Pay, PhonePe, Paytm'
    },
    {
      value: 'Net Banking',
      label: 'Net Banking',
      icon: <FaUniversity className="text-xl" />,
      description: 'All major banks'
    },
    ...(codEnabled ? [{
      value: 'COD',
      label: 'Cash on Delivery',
      icon: <FaMoneyBillWave className="text-xl" />,
      description: 'Pay when you receive'
    }] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-1">Checkout</h1>
          <p className="text-sm text-gray-600">Complete your order</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Payment Method & Order Summary - 50/50 Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left 50% - Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.value}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.paymentMethod === method.value
                        ? 'border-[#5A0F1B] bg-[#5A0F1B]/5'
                        : 'border-gray-200 hover:border-[#5A0F1B]/50'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={formData.paymentMethod === method.value}
                        onChange={handleChange}
                        className="w-5 h-5 text-[#5A0F1B] focus:ring-[#5A0F1B]"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[#5A0F1B]">{method.icon}</span>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{method.label}</div>
                              <div className="text-xs text-gray-600">{method.description}</div>
                            </div>
                          </div>
                          {method.value !== 'COD' && (
                            <FaLock className="text-green-600 text-sm ml-2" />
                          )}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Right 50% - Order Summary & Payment Button */}
            <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200 max-h-56 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <img
                      src={item.product?.images?.[0]}
                      alt={item.product?.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                        {item.product?.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>Qty: {item.quantity}</span>
                        {item.size && <span>• {item.size}</span>}
                      </div>
                      <p className="text-sm font-semibold text-[#5A0F1B]">
                        ₹{((item.product?.discountPrice || item.product?.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Summary */}
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                <span>Total</span>
                <span className="text-[#5A0F1B]">₹{total.toLocaleString()}</span>
              </div>

              {/* Place Order / Pay Now Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] hover:from-[#7A1525] hover:to-[#8A1F35] text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaLock className="text-sm" />
                    {formData.paymentMethod === 'COD'
                      ? `Place Order - ₹${total.toLocaleString()}`
                      : `Pay Now - ₹${total.toLocaleString()}`
                    }
                  </>
                )}
              </button>

              {/* Security Badge */}
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-600">
                <FaCheckCircle className="text-green-600" />
                <span>Secure & Encrypted Payment</span>
              </div>
            </div>
          </div>

          {/* Shipping Information - Full Width Below */}
          <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B] focus:ring-1 focus:ring-[#5A0F1B] text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B] focus:ring-1 focus:ring-[#5A0F1B] text-sm"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      maxLength="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B] focus:ring-1 focus:ring-[#5A0F1B] text-sm"
                      placeholder="10-digit mobile"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B] focus:ring-1 focus:ring-[#5A0F1B] text-sm"
                      placeholder="House No., Street, Area"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B] focus:ring-1 focus:ring-[#5A0F1B] text-sm"
                      placeholder="Apartment, Suite (Optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B] focus:ring-1 focus:ring-[#5A0F1B] text-sm"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B] focus:ring-1 focus:ring-[#5A0F1B] text-sm"
                      placeholder="State"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      maxLength="6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B] focus:ring-1 focus:ring-[#5A0F1B] text-sm"
                      placeholder="6-digit pincode"
                    />
                  </div>
                </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
