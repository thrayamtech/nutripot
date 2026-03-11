import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaCheckCircle, FaPhone, FaUser, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { toast } from 'react-toastify';
import { trackInitiateCheckout, trackPurchase, trackAddPaymentInfo } from '../utils/metaPixel';

const CheckoutNew = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user, login, setAuthData } = useAuth();
  const navigate = useNavigate();

  // Step management
  const [currentStep, setCurrentStep] = useState(1); // 1: Mobile, 2: OTP, 3: Billing Info, 4: Payment
  const [loading, setLoading] = useState(false);

  // Mobile & OTP
  const [mobileNumber, setMobileNumber] = useState('');
  const [verifiedMobile, setVerifiedMobile] = useState(''); // Store verified mobile to prevent tampering
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [timer, setTimer] = useState(60);
  const [otpVerified, setOtpVerified] = useState(false); // Track OTP verification status

  // Billing Information
  const [billingInfo, setBillingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Shipping Information (if different)
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Check if cart is empty only on initial mount
  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      navigate('/cart');
    } else {
      // Meta Pixel: Track InitiateCheckout
      trackInitiateCheckout(cart.items, getCartTotal());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Helper function to check if data is temporary
  const isTempData = (name, email) => {
    // Check if name is in format "User_1234567890"
    const isTempName = name && name.startsWith('User_');
    // Check if email is in format "1234567890@temp.com"
    const isTempEmail = email && email.endsWith('@temp.com');
    return isTempName || isTempEmail;
  };

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuthentication = async () => {
      if (isAuthenticated && user) {
        console.log('User already authenticated, skipping to billing step');

        // Mark OTP as verified since user is already logged in
        setOtpVerified(true);
        setVerifiedMobile(user.phone);
        setMobileNumber(user.phone);

        // Pre-fill billing info with user data
        try {
          const { data } = await API.get('/auth/profile');
          const defaultAddress = data.user.addresses?.find(addr => addr.isDefault) || data.user.addresses?.[0];

          // Check if user has temporary data
          const hasTemporaryData = isTempData(data.user.name, data.user.email);

          if (hasTemporaryData) {
            // Don't pre-fill with temporary data
            setBillingInfo({
              fullName: '',
              email: '',
              phone: data.user.phone || '',
              addressLine1: '',
              addressLine2: '',
              city: '',
              state: '',
              pincode: '',
            });
          } else {
            // Pre-fill with real data
            setBillingInfo({
              fullName: data.user.name || '',
              email: data.user.email || '',
              phone: data.user.phone || '',
              addressLine1: defaultAddress?.addressLine1 || '',
              addressLine2: defaultAddress?.addressLine2 || '',
              city: defaultAddress?.city || '',
              state: defaultAddress?.state || '',
              pincode: defaultAddress?.pincode || '',
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);

          // Check if user has temporary data
          const hasTemporaryData = isTempData(user.name, user.email);

          if (hasTemporaryData) {
            // Don't pre-fill with temporary data
            setBillingInfo({
              fullName: '',
              email: '',
              phone: user.phone || '',
              addressLine1: '',
              addressLine2: '',
              city: '',
              state: '',
              pincode: '',
            });
          } else {
            // Still prefill with available user data
            setBillingInfo({
              fullName: user.name || '',
              email: user.email || '',
              phone: user.phone || '',
              addressLine1: '',
              addressLine2: '',
              city: '',
              state: '',
              pincode: '',
            });
          }
        }

        // Skip to billing step
        setCurrentStep(3);
      }
    };

    checkAuthentication();
  }, [isAuthenticated, user]);

  // OTP Timer
  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  // STEP 1: Send OTP to Mobile
  const handleSendOTP = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      // Check if user exists
      const { data } = await API.post('/auth/check-mobile', { phone: mobileNumber });

      setIsExistingUser(data.exists);
      setOtpSent(true);
      setTimer(60);
      toast.success(`OTP sent to ${mobileNumber}. Use 1234 for testing.`);
      setCurrentStep(2);
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOTP = async () => {
    // For testing, accept 1234 as OTP
    if (otp !== '1234') {
      toast.error('Invalid OTP. Use 1234 for testing.');
      return;
    }

    setLoading(true);
    try {
      if (isExistingUser) {
        // Login existing user
        const { data } = await API.post('/auth/login-otp', {
          phone: mobileNumber,
          otp: otp
        });

        // Update AuthContext immediately to reflect authenticated state in navbar
        setAuthData(data.token, data.user);

        // Check if user has temporary data
        const hasTemporaryData = isTempData(data.user.name, data.user.email);

        if (hasTemporaryData) {
          // Don't pre-fill with temporary data - show empty fields
          setBillingInfo({
            fullName: '',
            email: '',
            phone: mobileNumber,
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            pincode: '',
          });
          toast.success('Please complete your profile information.');
        } else {
          // Pre-fill billing info for existing user with real data
          setBillingInfo({
            fullName: data.user.name || '',
            email: data.user.email || '',
            phone: mobileNumber,
            addressLine1: data.user.address?.addressLine1 || '',
            addressLine2: data.user.address?.addressLine2 || '',
            city: data.user.address?.city || '',
            state: data.user.address?.state || '',
            pincode: data.user.address?.pincode || '',
          });
          toast.success('Welcome back! Please confirm your details.');
        }
      } else {
        // New user - Create account automatically with OTP verification
        const { data } = await API.post('/auth/register-otp', {
          phone: mobileNumber,
          otp: otp
        });

        // Update AuthContext immediately to reflect authenticated state in navbar
        setAuthData(data.token, data.user);

        // New users always get empty fields (except phone)
        setBillingInfo({
          fullName: '',
          email: '',
          phone: mobileNumber,
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
        });
        toast.success('Account created! Please complete your profile.');
      }

      // Store verified mobile number to prevent tampering
      setVerifiedMobile(mobileNumber);
      setOtpVerified(true);
      setCurrentStep(3);
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Handle Billing Info
  const handleBillingSubmit = async () => {
    console.log('=== handleBillingSubmit Debug ===');
    console.log('otpVerified:', otpVerified);
    console.log('verifiedMobile:', verifiedMobile);
    console.log('isExistingUser:', isExistingUser);
    console.log('billingInfo.phone:', billingInfo.phone);
    console.log('Token in localStorage:', localStorage.getItem('token'));

    // Security: Verify OTP was completed before proceeding
    if (!otpVerified) {
      toast.error('Please verify your mobile number first');
      setCurrentStep(1);
      return;
    }

    // Security: Check if phone number matches verified mobile
    if (billingInfo.phone !== verifiedMobile) {
      toast.error('Phone number cannot be changed after OTP verification');
      setBillingInfo({ ...billingInfo, phone: verifiedMobile });
      return;
    }

    // Validate billing info
    if (!billingInfo.fullName || !billingInfo.email || !billingInfo.phone ||
        !billingInfo.addressLine1 || !billingInfo.city || !billingInfo.state || !billingInfo.pincode) {
      toast.error('Please fill in all required billing fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingInfo.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (billingInfo.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    if (billingInfo.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    // Validate shipping info if different from billing
    if (!sameAsBilling) {
      if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.addressLine1 ||
          !shippingInfo.city || !shippingInfo.state || !shippingInfo.pincode) {
        toast.error('Please fill in all required shipping fields');
        return;
      }

      if (shippingInfo.phone.length !== 10) {
        toast.error('Please enter a valid 10-digit shipping phone number');
        return;
      }

      if (shippingInfo.pincode.length !== 6) {
        toast.error('Please enter a valid 6-digit shipping pincode');
        return;
      }
    }

    // Check if user is already authenticated
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

    console.log('Checking authentication...');
    console.log('Token exists:', !!token);
    console.log('Is existing user:', isExistingUser);
    console.log('Stored user:', storedUser);

    // Both new and existing users have token now (from OTP step)
    if (token) {
      console.log('User authenticated - updating profile and adding address');
      setLoading(true);
      try {
        // Update user profile with billing details
        await API.put('/auth/profile', {
          name: billingInfo.fullName,
          email: billingInfo.email,
          phone: verifiedMobile
        });

        // Add billing address
        await API.post('/auth/address', {
          fullName: billingInfo.fullName,
          phone: verifiedMobile,
          addressLine1: billingInfo.addressLine1,
          addressLine2: billingInfo.addressLine2,
          city: billingInfo.city,
          state: billingInfo.state,
          pincode: billingInfo.pincode,
          isDefault: true
        });

        console.log('Profile updated successfully');
        toast.success('Details saved! Proceeding to payment.');
        // Meta Pixel: Track AddPaymentInfo
        trackAddPaymentInfo(getCartTotal());
        setLoading(false);
        setCurrentStep(4);
      } catch (error) {
        console.error('Profile update error:', error);
        const errorMsg = error.response?.data?.message || 'Failed to save details';
        toast.error(errorMsg);
        setLoading(false);
        return;
      }
    } else {
      // No token - something went wrong
      console.error('No token found - authentication error');
      toast.error('Authentication error. Please start over.');
      setCurrentStep(1);
    }
  };

  // STEP 4: Place Order
  const handlePlaceOrder = async () => {
    // Security: Final verification before order placement
    if (!otpVerified) {
      toast.error('Security error: OTP verification required');
      setCurrentStep(1);
      return;
    }

    if (!verifiedMobile) {
      toast.error('Security error: Mobile verification missing');
      setCurrentStep(1);
      return;
    }

    // Ensure user is authenticated (either logged in or just registered)
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please complete account creation first');
      setCurrentStep(3);
      return;
    }

    setLoading(true);
    try {
      const finalShippingAddress = sameAsBilling ? billingInfo : shippingInfo;

      const orderData = {
        items: cart.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.discountPrice || item.product.price,
          size: item.size,
          color: item.color
        })),
        shippingAddress: {
          fullName: finalShippingAddress.fullName,
          phone: finalShippingAddress.phone,
          addressLine1: finalShippingAddress.addressLine1,
          addressLine2: finalShippingAddress.addressLine2,
          city: finalShippingAddress.city,
          state: finalShippingAddress.state,
          pincode: finalShippingAddress.pincode,
        },
        billingAddress: {
          fullName: billingInfo.fullName,
          phone: billingInfo.phone,
          addressLine1: billingInfo.addressLine1,
          addressLine2: billingInfo.addressLine2,
          city: billingInfo.city,
          state: billingInfo.state,
          pincode: billingInfo.pincode,
        },
        paymentMethod: paymentMethod,
        totalAmount: getCartTotal()
      };

      const { data } = await API.post('/orders', orderData);

      // Meta Pixel: Track Purchase
      trackPurchase({
        ...data.order,
        items: cart.items,
        total: getCartTotal()
      });

      // Clear cart
      await clearCart();

      toast.success('Order placed successfully!');
      navigate(`/orders/${data.order._id}`);
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtp('');
    setTimer(60);
    toast.info('OTP resent! Use 1234 for testing.');
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center">
        {[
          { num: 1, label: 'Mobile' },
          { num: 2, label: 'Verify' },
          { num: 3, label: 'Details' },
          { num: 4, label: 'Payment' }
        ].map((step, index) => (
          <React.Fragment key={step.num}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg transition-all ${
                currentStep >= step.num
                  ? 'bg-gradient-to-r from-[#2d7d32] to-[#1e6623] text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > step.num ? <FaCheckCircle /> : step.num}
              </div>
              <span className="text-xs mt-1 font-medium text-gray-600">{step.label}</span>
            </div>
            {index < 3 && (
              <div className={`w-16 h-1 mx-2 rounded transition-all ${
                currentStep > step.num ? 'bg-gradient-to-r from-[#2d7d32] to-[#1e6623]' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 py-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-rose-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-orange-200/20 to-pink-200/20 rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Page Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
            <span className="bg-gradient-to-r from-[#2d7d32] via-[#1e6623] to-[#2d7d32] bg-clip-text text-transparent">
              Secure Checkout
            </span>
          </h1>
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-[#2d7d32] to-transparent"></div>
            <FaLock className="text-[#2d7d32] text-sm" />
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-[#2d7d32] to-transparent"></div>
          </div>
          <p className="text-gray-600 text-sm">
            Complete your order in a few simple steps
          </p>
        </div>

        {renderStepIndicator()}

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8">
          {/* STEP 1: Mobile Number */}
          {currentStep === 1 && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">
                  <span className="bg-gradient-to-r from-[#2d7d32] via-[#1e6623] to-[#2d7d32] bg-clip-text text-transparent">
                    Enter Mobile Number
                  </span>
                </h2>
                <p className="text-gray-600 text-sm">
                  We'll send you an OTP to verify your number
                </p>
              </div>
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-gray-800 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2d7d32]/20 focus:border-[#2d7d32] transition-all text-base bg-white/50"
                    maxLength="10"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    We'll send you a verification code
                  </p>
                </div>
                <button
                  onClick={handleSendOTP}
                  disabled={loading || mobileNumber.length !== 10}
                  className="w-full py-3 bg-gradient-to-r from-[#2d7d32] via-[#1e6623] to-[#2d7d32] hover:from-[#1e6623] hover:via-[#1a431c] hover:to-[#1e6623] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending OTP...
                    </span>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: OTP Verification */}
          {currentStep === 2 && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">
                  <span className="bg-gradient-to-r from-[#2d7d32] via-[#1e6623] to-[#2d7d32] bg-clip-text text-transparent">
                    Verify OTP
                  </span>
                </h2>
              </div>
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-semibold text-gray-800">
                      Verification Code
                    </label>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-sm text-[#2d7d32] hover:text-[#1e6623] font-semibold transition-colors"
                    >
                      Edit Number
                    </button>
                  </div>
                  <div className="mb-4 p-3 bg-gradient-to-r from-[#2d7d32]/10 to-[#1e6623]/10 rounded-xl border border-[#2d7d32]/20">
                    <p className="text-sm text-gray-700 text-center">
                      Code sent to <span className="font-bold text-[#2d7d32]">{mobileNumber}</span>
                    </p>
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="• • • •"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2d7d32]/20 focus:border-[#2d7d32] transition-all text-center text-2xl tracking-[1em] font-bold bg-white/50"
                    maxLength="4"
                  />
                </div>

                {/* Timer and Resend */}
                <div className="text-center mb-6">
                  {timer > 0 ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-[#2d7d32] rounded-full animate-pulse"></div>
                      <p className="text-sm text-gray-600">
                        Resend code in <span className="font-bold text-[#2d7d32]">{timer}s</span>
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleResendOTP}
                      className="text-sm text-[#2d7d32] hover:text-[#1e6623] font-bold underline decoration-2 underline-offset-4 transition-colors"
                    >
                      Resend Verification Code
                    </button>
                  )}
                </div>

                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 4}
                  className="w-full py-3 bg-gradient-to-r from-[#2d7d32] via-[#1e6623] to-[#2d7d32] hover:from-[#1e6623] hover:via-[#1a431c] hover:to-[#1e6623] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Verify & Continue'
                  )}
                </button>

                {/* Test OTP Info */}
                <div className="mt-6 p-3 bg-gradient-to-r from-[#2d7d32]/10 to-[#1e6623]/10 rounded-2xl border-2 border-[#2d7d32]/30">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-2 h-2 bg-[#2d7d32] rounded-full animate-pulse"></div>
                    <p className="text-sm text-[#2d7d32] text-center font-medium">
                      Testing Mode: Use code <span className="font-bold text-[#2d7d32] bg-white px-3 py-1 rounded-lg">1234</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Billing & Shipping Information */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Billing Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={billingInfo.fullName}
                    onChange={(e) => setBillingInfo({ ...billingInfo, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={billingInfo.email}
                    onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone * <span className="text-green-600 text-xs">✓ Verified</span>
                  </label>
                  <input
                    type="tel"
                    value={billingInfo.phone}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    title="Phone number is verified and cannot be changed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={billingInfo.pincode}
                    onChange={(e) => setBillingInfo({ ...billingInfo, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    maxLength="6"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={billingInfo.addressLine1}
                    onChange={(e) => setBillingInfo({ ...billingInfo, addressLine1: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={billingInfo.addressLine2}
                    onChange={(e) => setBillingInfo({ ...billingInfo, addressLine2: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={billingInfo.city}
                    onChange={(e) => setBillingInfo({ ...billingInfo, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={billingInfo.state}
                    onChange={(e) => setBillingInfo({ ...billingInfo, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>

              {/* Shipping Address Toggle */}
              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sameAsBilling}
                    onChange={(e) => setSameAsBilling(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Shipping address same as billing
                  </span>
                </label>
              </div>

              {/* Shipping Address (if different) */}
              {!sameAsBilling && (
                <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">Shipping Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.fullName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                        maxLength="10"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.pincode}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                        maxLength="6"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.addressLine1}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, addressLine1: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.addressLine2}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, addressLine2: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleBillingSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-rose-600 hover:to-pink-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Payment & Order Summary */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Payment Method</h2>

              {/* Payment Methods */}
              <div className="space-y-3 mb-6">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-rose-500">
                  <input
                    type="radio"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay when you receive</div>
                  </div>
                </label>
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-rose-500">
                  <input
                    type="radio"
                    value="Card"
                    checked={paymentMethod === 'Card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold">Online Payment</div>
                    <div className="text-sm text-gray-600">UPI, Card, Net Banking</div>
                  </div>
                </label>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-bold mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal ({cart?.items?.length} items)</span>
                    <span>₹{getCartTotal()?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>₹{getCartTotal()?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FaLock />
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutNew;
