import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaCheckCircle, FaCreditCard, FaMoneyBillWave, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { toast } from 'react-toastify';

// AddressForm component - moved outside to prevent recreation on every render
const AddressForm = ({ address, onChange, title }) => (
  <div>
    <h3 className="text-md font-semibold text-gray-800 mb-3">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
        <input
          type="text"
          name="fullName"
          value={address.fullName || ''}
          onChange={onChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B] focus:ring-1 focus:ring-[#5A0F1B] text-sm"
          placeholder="Enter full name"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={address.email || ''}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B] focus:ring-1 focus:ring-[#5A0F1B] text-sm"
          placeholder="Email address"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
        <input
          type="tel"
          name="phone"
          value={address.phone || ''}
          onChange={onChange}
          required
          maxLength="10"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B] focus:ring-1 focus:ring-[#5A0F1B] text-sm"
          placeholder="10-digit mobile"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode *</label>
        <input
          type="text"
          name="pincode"
          value={address.pincode || ''}
          onChange={onChange}
          required
          maxLength="6"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B] focus:ring-1 focus:ring-[#5A0F1B] text-sm"
          placeholder="6-digit pincode"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-xs font-semibold text-gray-700 mb-1">Address *</label>
        <input
          type="text"
          name="addressLine1"
          value={address.addressLine1 || ''}
          onChange={onChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B] focus:ring-1 focus:ring-[#5A0F1B] text-sm"
          placeholder="House No., Street, Area"
        />
      </div>
      <div className="md:col-span-2">
        <input
          type="text"
          name="addressLine2"
          value={address.addressLine2 || ''}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B] focus:ring-1 focus:ring-[#5A0F1B] text-sm"
          placeholder="Apartment, Suite (Optional)"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">City *</label>
        <input
          type="text"
          name="city"
          value={address.city || ''}
          onChange={onChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B] focus:ring-1 focus:ring-[#5A0F1B] text-sm"
          placeholder="City"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">State *</label>
        <input
          type="text"
          name="state"
          value={address.state || ''}
          onChange={onChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B] focus:ring-1 focus:ring-[#5A0F1B] text-sm"
          placeholder="State"
        />
      </div>
    </div>
  </div>
);

const CheckoutSteps = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user, setAuthData } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0); // 0 = OTP (if not authenticated), 1 = Address, 2 = Payment
  const [loading, setLoading] = useState(false);
  const [codEnabled, setCodEnabled] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);

  // OTP verification state
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [billingAddress, setBillingAddress] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('Razorpay');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Wallet points state
  const [walletBalance, setWalletBalance] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [loyaltySettings, setLoyaltySettings] = useState(null);

  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    fetchCodSetting();
    fetchLoyaltySettings();
    if (isAuthenticated) {
      setCurrentStep(1); // Skip OTP step if authenticated
      fetchUserAddresses();
      fetchWalletBalance();
    }
  }, [isAuthenticated]);

  const fetchCodSetting = async () => {
    try {
      const { data } = await API.get('/settings/public');
      const codValue = data.settings?.cod_enabled;
      setCodEnabled(codValue === undefined ? true : codValue);
    } catch (error) {
      console.error('Error fetching COD setting:', error);
      setCodEnabled(true);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const { data } = await API.get('/wallet/stats');
      setWalletBalance(data.stats.balance || 0);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setWalletBalance(0);
    }
  };

  const fetchLoyaltySettings = async () => {
    try {
      const { data } = await API.get('/loyalty/settings');
      setLoyaltySettings(data.settings);
    } catch (error) {
      console.error('Error fetching loyalty settings:', error);
    }
  };

  const removeDuplicateAddresses = (addresses) => {
    const uniqueAddresses = [];
    const seen = new Set();

    for (const address of addresses) {
      const key = `${address.fullName}|${address.phone}|${address.addressLine1}|${address.addressLine2 || ''}|${address.city}|${address.state}|${address.pincode}`;

      if (!seen.has(key)) {
        seen.add(key);
        uniqueAddresses.push(address);
      }
    }

    return uniqueAddresses;
  };

  const fetchUserAddresses = async () => {
    try {
      const { data } = await API.get('/auth/profile');

      // Check if user has real name (not default/placeholder)
      const hasRealName = data.user.name &&
                          !data.user.name.startsWith('User_') &&
                          data.user.name !== 'Guest' &&
                          data.user.name.trim() !== '';

      // Check if user has real email (not temp/placeholder)
      const hasRealEmail = data.user.email &&
                           !data.user.email.includes('@temp.com') &&
                           !data.user.email.startsWith('user_') &&
                           data.user.email.trim() !== '';

      const userName = hasRealName ? data.user.name : '';
      const userEmail = hasRealEmail ? data.user.email : '';
      const userPhone = data.user.phone || user?.phone || '';

      if (data.user.addresses && data.user.addresses.length > 0) {
        const uniqueAddresses = removeDuplicateAddresses(data.user.addresses);
        setSavedAddresses(uniqueAddresses);
        const defaultAddr = uniqueAddresses.find(addr => addr.isDefault) || uniqueAddresses[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
          setShippingAddress({
            fullName: defaultAddr.fullName || userName,
            email: defaultAddr.email || userEmail,
            phone: defaultAddr.phone || userPhone,
            addressLine1: defaultAddr.addressLine1 || '',
            addressLine2: defaultAddr.addressLine2 || '',
            city: defaultAddr.city || '',
            state: defaultAddr.state || '',
            pincode: defaultAddr.pincode || ''
          });
          if (useShippingAsBilling) {
            setBillingAddress({
              fullName: defaultAddr.fullName || userName,
              email: defaultAddr.email || userEmail,
              phone: defaultAddr.phone || userPhone,
              addressLine1: defaultAddr.addressLine1 || '',
              addressLine2: defaultAddr.addressLine2 || '',
              city: defaultAddr.city || '',
              state: defaultAddr.state || '',
              pincode: defaultAddr.pincode || ''
            });
          }
        }
      } else {
        // No saved addresses - only populate if not default values
        setShippingAddress(prev => ({
          ...prev,
          fullName: userName,
          email: userEmail,
          phone: userPhone
        }));
        setBillingAddress(prev => ({
          ...prev,
          fullName: userName,
          email: userEmail,
          phone: userPhone
        }));
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleSendOTP = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/check-mobile', { phone: mobileNumber });
      setIsExistingUser(data.exists);
      setOtpSent(true);

      // Simulate OTP send (in production, this would send actual OTP)
      toast.success(`OTP sent to ${mobileNumber}. Use 1234 for testing.`);
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 4) {
      toast.error('Please enter a valid 4-digit OTP');
      return;
    }

    setLoading(true);
    try {
      let response;

      if (isExistingUser) {
        // Login with OTP
        response = await API.post('/auth/login-otp', {
          phone: mobileNumber,
          otp: otp
        });
      } else {
        // Register with OTP
        response = await API.post('/auth/register-otp', {
          phone: mobileNumber,
          otp: otp
        });
      }

      const { data } = response;

      // Set auth data
      setAuthData(data.token, data.user);

      toast.success(isExistingUser ? 'Login successful!' : 'Account created successfully!');

      // Fetch user profile and addresses
      if (isExistingUser) {
        // Existing user: fetch saved addresses
        await fetchUserAddresses();
      } else {
        // New user: check if name and email are real or default placeholders
        const hasRealName = data.user.name &&
                            !data.user.name.startsWith('User_') &&
                            data.user.name !== 'Guest' &&
                            data.user.name.trim() !== '';

        const hasRealEmail = data.user.email &&
                             !data.user.email.includes('@temp.com') &&
                             !data.user.email.startsWith('user_') &&
                             data.user.email.trim() !== '';

        // Only set name/email if they're real, leave blank if default values
        setShippingAddress(prev => ({
          ...prev,
          fullName: hasRealName ? data.user.name : '',
          email: hasRealEmail ? data.user.email : '',
          phone: data.user.phone || mobileNumber
        }));
        setBillingAddress(prev => ({
          ...prev,
          fullName: hasRealName ? data.user.name : '',
          email: hasRealEmail ? data.user.email : '',
          phone: data.user.phone || mobileNumber
        }));
      }

      setCurrentStep(1); // Move to address step
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpDigitChange = (index, value) => {
    if (value.length > 1) value = value.slice(0, 1);
    if (!/^\d*$/.test(value)) return;

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);
    setOtp(newOtpDigits.join(''));

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    if (useShippingAsBilling) {
      setBillingAddress(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBillingChange = (e) => {
    setBillingAddress({ ...billingAddress, [e.target.name]: e.target.value });
  };

  const handleAddressSelect = (address) => {
    setSelectedAddressId(address._id);
    setShippingAddress({
      fullName: address.fullName,
      email: address.email || '',
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode
    });
    if (useShippingAsBilling) {
      setBillingAddress({
        fullName: address.fullName,
        email: address.email || '',
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || '',
        city: address.city,
        state: address.state,
        pincode: address.pincode
      });
    }
  };

  const handleNewAddress = () => {
    setSelectedAddressId(null);

    // Check if user has real name/email or default values
    const hasRealName = user?.name &&
                        !user.name.startsWith('User_') &&
                        user.name !== 'Guest' &&
                        user.name.trim() !== '';

    const hasRealEmail = user?.email &&
                         !user.email.includes('@temp.com') &&
                         !user.email.startsWith('user_') &&
                         user.email.trim() !== '';

    setShippingAddress({
      fullName: hasRealName ? user.name : '',
      email: hasRealEmail ? user.email : '',
      phone: user?.phone || mobileNumber || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: ''
    });
    if (useShippingAsBilling) {
      setBillingAddress({
        fullName: hasRealName ? user.name : '',
        email: hasRealEmail ? user.email : '',
        phone: user?.phone || mobileNumber || '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: ''
      });
    }
  };

  const handleUseShippingAsBilling = (checked) => {
    setUseShippingAsBilling(checked);
    if (checked) {
      setBillingAddress({ ...shippingAddress });
    }
  };

  const validateStep1 = () => {
    if (!shippingAddress.fullName || !shippingAddress.phone ||
        !shippingAddress.addressLine1 || !shippingAddress.city ||
        !shippingAddress.state || !shippingAddress.pincode) {
      toast.error('Please fill in all required shipping address fields');
      return false;
    }

    if (shippingAddress.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }

    if (shippingAddress.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }

    if (!useShippingAsBilling) {
      if (!billingAddress.fullName || !billingAddress.phone ||
          !billingAddress.addressLine1 || !billingAddress.city ||
          !billingAddress.state || !billingAddress.pincode) {
        toast.error('Please fill in all required billing address fields');
        return false;
      }

      if (billingAddress.phone.length < 10) {
        toast.error('Please enter a valid billing phone number');
        return false;
      }

      if (billingAddress.pincode.length !== 6) {
        toast.error('Please enter a valid billing pincode');
        return false;
      }
    }

    return true;
  };

  const handleNextStep = async () => {
    if (currentStep === 1 && validateStep1()) {
      // Update user profile with name and email if they're not default values
      await updateUserProfile();
      setCurrentStep(2);
      window.scrollTo(0, 0);
    }
  };

  const updateUserProfile = async () => {
    try {
      // Check if current user data has default values
      const hasDefaultName = !user?.name ||
                             user.name.startsWith('User_') ||
                             user.name === 'Guest' ||
                             user.name.trim() === '';

      const hasDefaultEmail = !user?.email ||
                              user.email.includes('@temp.com') ||
                              user.email.startsWith('user_') ||
                              user.email.trim() === '';

      // Check if shipping address has real values
      const hasRealName = shippingAddress.fullName &&
                          shippingAddress.fullName.trim() !== '';

      const hasRealEmail = shippingAddress.email &&
                           shippingAddress.email.trim() !== '' &&
                           !shippingAddress.email.includes('@temp.com');

      // Only update if current user has default values and new values are real
      if ((hasDefaultName && hasRealName) || (hasDefaultEmail && hasRealEmail)) {
        const updateData = {};

        if (hasDefaultName && hasRealName) {
          updateData.name = shippingAddress.fullName;
        }

        if (hasDefaultEmail && hasRealEmail) {
          updateData.email = shippingAddress.email;
        }

        // Update profile
        const { data } = await API.put('/auth/profile', updateData);

        if (data.success) {
          // Update auth context with new user data
          setAuthData(localStorage.getItem('token'), data.user);
        }
      }

      // Save shipping address if it's a new address (not selected from saved addresses)
      if (!selectedAddressId) {
        // Check if this exact address already exists to avoid duplicates
        const addressExists = savedAddresses.some(addr =>
          addr.fullName === shippingAddress.fullName &&
          addr.phone === shippingAddress.phone &&
          addr.addressLine1 === shippingAddress.addressLine1 &&
          addr.addressLine2 === shippingAddress.addressLine2 &&
          addr.city === shippingAddress.city &&
          addr.state === shippingAddress.state &&
          addr.pincode === shippingAddress.pincode
        );

        if (!addressExists) {
          // Save new address
          const addressData = {
            fullName: shippingAddress.fullName,
            email: shippingAddress.email || '',
            phone: shippingAddress.phone,
            addressLine1: shippingAddress.addressLine1,
            addressLine2: shippingAddress.addressLine2 || '',
            city: shippingAddress.city,
            state: shippingAddress.state,
            pincode: shippingAddress.pincode,
            isDefault: savedAddresses.length === 0 // Make it default if it's the first address
          };

          const { data } = await API.post('/auth/address', addressData);

          if (data.success) {
            // Update saved addresses list
            setSavedAddresses(data.addresses);
          }
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // Don't block checkout if profile update fails
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      window.scrollTo(0, 0);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const subtotal = getCartTotal();
      const shipping = subtotal > 999 ? 0 : 50;
      const orderTotal = subtotal + shipping;

      const { data } = await API.post('/coupons/validate', {
        code: couponCode.trim(),
        orderTotal
      });

      if (data.success) {
        setAppliedCoupon(data.coupon);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  const handleRazorpayPayment = async (razorpayOrderId, amount, orderId) => {
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
            navigate('/payment-failure', {
              state: {
                orderId: orderId,
                errorMessage: 'Payment verification failed. Please contact support.',
                errorCode: 'verification_failed'
              }
            });
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          email: user?.email || '',
          contact: shippingAddress.phone
        },
        theme: {
          color: '#5A0F1B'
        },
        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: true
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast.info('Payment cancelled');
            navigate('/payment-failure', {
              state: {
                orderId: orderId,
                errorMessage: 'Payment was cancelled by you.',
                errorCode: 'payment_cancelled'
              }
            });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setLoading(false);
        toast.error('Payment failed');
        navigate('/payment-failure', {
          state: {
            orderId: orderId,
            errorMessage: response.error.description || 'Payment failed',
            errorCode: response.error.code || 'payment_failed'
          }
        });
      });
      rzp.open();
    } catch (error) {
      setLoading(false);
      toast.error('Failed to initialize payment');
      console.error(error);
      navigate('/payment-failure', {
        state: {
          orderId: orderId,
          errorMessage: 'Failed to initialize payment. Please try again.',
          errorCode: 'initialization_failed'
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
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
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2 || '',
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode
        },
        paymentMethod: paymentMethod === 'COD' ? 'COD' : 'Razorpay'
      };

      // Add coupon details if applied
      if (appliedCoupon) {
        orderData.couponCode = appliedCoupon.code;
        orderData.discount = appliedCoupon.discountAmount;
      }

      // Add wallet points details if used
      if (pointsToUse > 0) {
        orderData.pointsUsed = pointsToUse;
        orderData.pointsDiscount = pointsDiscount;
      }

      const { data } = await API.post('/orders', orderData);

      if (paymentMethod !== 'COD') {
        await handleRazorpayPayment(data.razorpayOrderId, data.totalPrice, data._id);
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
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = subtotal + shipping - discount - pointsDiscount;

  const paymentMethods = [
    { value: 'Razorpay', label: 'Online Payment', icon: <FaCreditCard className="text-xl" />, description: 'Card, UPI, Net Banking, Wallets' },
    ...(codEnabled ? [{ value: 'COD', label: 'Cash on Delivery', icon: <FaMoneyBillWave className="text-xl" />, description: 'Pay when you receive' }] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 py-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-rose-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-orange-200/20 to-pink-200/20 rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Page Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
            <span className="bg-gradient-to-r from-[#5A0F1B] via-[#7A1525] to-[#5A0F1B] bg-clip-text text-transparent">
              Secure Checkout
            </span>
          </h1>
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-[#5A0F1B] to-transparent"></div>
            <FaLock className="text-[#5A0F1B] text-sm" />
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-[#5A0F1B] to-transparent"></div>
          </div>
          <p className="text-gray-600 text-sm">
            {currentStep === 0 ? 'Verify your mobile number to continue' : 'Complete your order in 2 easy steps'}
          </p>
        </div>

        {/* Progress Steps - Only show for authenticated users */}
        {currentStep > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg transition-all ${currentStep >= 1 ? 'bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {currentStep > 1 ? <FaCheckCircle /> : 1}
                </div>
                <span className={`text-xs mt-1 font-medium ${currentStep >= 1 ? 'text-[#5A0F1B]' : 'text-gray-500'}`}>Address</span>
              </div>
              <div className={`w-24 h-1 mx-4 rounded transition-all ${currentStep >= 2 ? 'bg-gradient-to-r from-[#5A0F1B] to-[#7A1525]' : 'bg-gray-200'}`}></div>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg transition-all ${currentStep >= 2 ? 'bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  2
                </div>
                <span className={`text-xs mt-1 font-medium ${currentStep >= 2 ? 'text-[#5A0F1B]' : 'text-gray-500'}`}>Payment</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 0: Mobile Verification (Guest Users Only) */}
        {currentStep === 0 && !isAuthenticated && (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8 max-w-md mx-auto">
            {!otpSent ? (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">
                    <span className="bg-gradient-to-r from-[#5A0F1B] via-[#7A1525] to-[#5A0F1B] bg-clip-text text-transparent">
                      Enter Mobile Number
                    </span>
                  </h2>
                  <p className="text-gray-600 text-sm">
                    We'll send you an OTP to verify your number
                  </p>
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-gray-800 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength="10"
                    placeholder="Enter 10-digit mobile number"
                    className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5A0F1B]/20 focus:border-[#5A0F1B] transition-all text-base bg-white/50"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    We'll send you a verification code
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading || mobileNumber.length !== 10}
                  className="w-full py-3 bg-gradient-to-r from-[#5A0F1B] via-[#7A1525] to-[#5A0F1B] hover:from-[#6A1525] hover:via-[#8A1F35] hover:to-[#6A1525] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
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
            ) : (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">
                    <span className="bg-gradient-to-r from-[#5A0F1B] via-[#7A1525] to-[#5A0F1B] bg-clip-text text-transparent">
                      Verify OTP
                    </span>
                  </h2>
                </div>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-semibold text-gray-800">
                      Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpDigits(['', '', '', '']);
                        setOtp('');
                      }}
                      className="text-sm text-[#5A0F1B] hover:text-[#7A1525] font-semibold transition-colors"
                    >
                      Edit Number
                    </button>
                  </div>
                  <div className="mb-4 p-3 bg-gradient-to-r from-[#5A0F1B]/10 to-[#7A1525]/10 rounded-xl border border-[#5A0F1B]/20">
                    <p className="text-sm text-gray-700 text-center">
                      Code sent to <span className="font-bold text-[#5A0F1B]">{mobileNumber}</span>
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 mb-4">
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        value={otpDigits[index]}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        maxLength="1"
                        className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A0F1B]/20 focus:border-[#5A0F1B] transition-all bg-white/50"
                      />
                    ))}
                  </div>
                </div>

                {/* Resend Button */}
                <div className="text-center mb-6">
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    className="text-sm text-[#5A0F1B] hover:text-[#7A1525] font-bold underline decoration-2 underline-offset-4 transition-colors"
                  >
                    Resend Verification Code
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 4}
                  className="w-full py-3 bg-gradient-to-r from-[#5A0F1B] via-[#7A1525] to-[#5A0F1B] hover:from-[#6A1525] hover:via-[#8A1F35] hover:to-[#6A1525] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
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
                <div className="mt-6 p-3 bg-gradient-to-r from-[#5A0F1B]/10 to-[#7A1525]/10 rounded-2xl border-2 border-[#5A0F1B]/30">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-2 h-2 bg-[#5A0F1B] rounded-full animate-pulse"></div>
                    <p className="text-sm text-[#5A0F1B] text-center font-medium">
                      Testing Mode: Use code <span className="font-bold text-[#5A0F1B] bg-white px-3 py-1 rounded-lg">1234</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Address */}
          {currentStep === 1 && (
            <div>
              {savedAddresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Saved Addresses */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Saved Addresses</h3>
                    <div className="grid grid-cols-1 gap-3 mb-4">
                      {savedAddresses.map((address) => (
                        <div
                          key={address._id}
                          onClick={() => handleAddressSelect(address)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedAddressId === address._id ? 'border-[#5A0F1B] bg-[#5A0F1B]/5' : 'border-gray-200 hover:border-[#5A0F1B]/50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{address.fullName}</p>
                              {address.email && <p className="text-sm text-gray-600">{address.email}</p>}
                              <p className="text-sm text-gray-600 mt-1">{address.addressLine1}{address.addressLine2 && `, ${address.addressLine2}`}</p>
                              <p className="text-sm text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                              <p className="text-sm text-gray-600 mt-1">Phone: {address.phone}</p>
                            </div>
                            {address.isDefault && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Default</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <button type="button" onClick={handleNewAddress} className="text-sm text-[#5A0F1B] hover:text-[#7A1525] font-semibold">
                        + Add New Address
                      </button>
                    </div>
                  </div>

                  {/* Right: Address Forms */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <AddressForm address={shippingAddress} onChange={handleShippingChange} title="Shipping Address" />

                    <div className="mt-6">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useShippingAsBilling}
                          onChange={(e) => handleUseShippingAsBilling(e.target.checked)}
                          className="w-4 h-4 text-[#5A0F1B] focus:ring-[#5A0F1B] rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 font-medium">Billing address same as shipping</span>
                      </label>
                    </div>

                    {!useShippingAsBilling && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <AddressForm address={billingAddress} onChange={handleBillingChange} title="Billing Address" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <AddressForm address={shippingAddress} onChange={handleShippingChange} title="Shipping Address" />

                  <div className="mt-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useShippingAsBilling}
                        onChange={(e) => handleUseShippingAsBilling(e.target.checked)}
                        className="w-4 h-4 text-[#5A0F1B] focus:ring-[#5A0F1B] rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 font-medium">Billing address same as shipping</span>
                    </label>
                  </div>

                  {!useShippingAsBilling && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <AddressForm address={billingAddress} onChange={handleBillingChange} title="Billing Address" />
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3 bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] hover:from-[#7A1525] hover:to-[#8A1F35] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  Continue to Payment <FaArrowRight />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Order Summary & Payment Method - LEFT */}
                <div className="space-y-4">
                  {/* Order Summary */}
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Order Summary</h2>
                    <div className="space-y-2 max-h-[280px] overflow-y-auto">
                      {cart.items.map((item) => (
                        <div key={item._id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                          <img src={item.product?.images?.[0]} alt={item.product?.name} className="w-16 h-16 object-cover rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.product?.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                              <span>Qty: {item.quantity}</span>
                              {item.size && <span>• {item.size}</span>}
                            </div>
                            <p className="text-sm font-semibold text-[#5A0F1B] mt-1">₹{((item.product?.discountPrice || item.product?.price) * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Payment Method</h3>
                    <div className="space-y-2">
                      {paymentMethods.map((method) => (
                        <label key={method.value} className={`block p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === method.value ? 'border-[#5A0F1B] bg-[#5A0F1B]/5' : 'border-gray-200 hover:border-[#5A0F1B]/50'
                        }`}>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.value}
                              checked={paymentMethod === method.value}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="w-4 h-4 text-[#5A0F1B] focus:ring-[#5A0F1B]"
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
                                {method.value !== 'COD' && <FaLock className="text-green-600 text-sm ml-2" />}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Coupon, Wallet & Payment Button - RIGHT */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  {/* Coupon Section */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Apply Coupon</h3>
                    {!appliedCoupon ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A0F1B] focus:ring-1 focus:ring-[#5A0F1B]"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 py-2 text-sm font-semibold bg-[#5A0F1B] text-white rounded-lg hover:bg-[#7A1525] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {couponLoading ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FaCheckCircle className="text-green-600" />
                          <div>
                            <p className="text-sm font-semibold text-green-800">{appliedCoupon.code}</p>
                            <p className="text-xs text-green-600">Coupon applied successfully!</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-sm text-red-600 hover:text-red-700 font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Wallet Points Section */}
                  {loyaltySettings?.pointRedemptionEnabled && isAuthenticated && (
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className={`rounded-lg p-4 border-2 ${walletBalance > 0 ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-sm font-bold text-gray-900">💰 Use Wallet Points</h3>
                            <p className="text-xs text-gray-600 mt-1">
                              Available: <span className={`font-bold ${walletBalance > 0 ? 'text-purple-600' : 'text-gray-500'}`}>{walletBalance} points</span>
                              {walletBalance > 0 && <> ({' '}≈ ₹{walletBalance * (loyaltySettings?.pointValue || 1)})</>}
                            </p>
                            {walletBalance === 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                Earn points by making purchases and referring friends
                              </p>
                            )}
                          </div>
                        </div>
                        {walletBalance > 0 && (
                        <>
                          <div className="mb-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              Points to Use
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={Math.min(
                                walletBalance,
                                Math.floor(((subtotal + shipping - discount) * (loyaltySettings?.maxRedemptionPercentage || 50)) / 100 / (loyaltySettings?.pointValue || 1))
                              )}
                              value={pointsToUse}
                              onChange={(e) => {
                                const points = parseInt(e.target.value) || 0;
                                const maxPoints = Math.min(
                                  walletBalance,
                                  Math.floor(((subtotal + shipping - discount) * (loyaltySettings?.maxRedemptionPercentage || 50)) / 100 / (loyaltySettings?.pointValue || 1))
                                );
                                const validPoints = Math.min(points, maxPoints);
                                setPointsToUse(validPoints);
                                setPointsDiscount(validPoints * (loyaltySettings?.pointValue || 1));
                              }}
                              className="w-full px-3 py-2 text-sm border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                              placeholder="Enter points"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Maximum {loyaltySettings?.maxRedemptionPercentage}% of order value can be paid with points
                            </p>
                          </div>
                          {pointsToUse > 0 && (
                            <div className="bg-white rounded-lg p-3 border border-purple-200">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-700">Points Discount:</span>
                                <span className="font-bold text-purple-600">-₹{pointsDiscount}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
                                <span>Remaining Balance:</span>
                                <span className="font-semibold">{walletBalance - pointsToUse} points</span>
                              </div>
                            </div>
                          )}
                        </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price Summary */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal ({cart.items.length} items)</span>
                      <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Shipping</span>
                      <span className="font-medium text-green-600">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({appliedCoupon.code})</span>
                        <span className="font-medium">-₹{discount.toLocaleString()}</span>
                      </div>
                    )}
                    {pointsDiscount > 0 && (
                      <div className="flex justify-between text-sm text-purple-600">
                        <span>Wallet Points ({pointsToUse} pts)</span>
                        <span className="font-medium">-₹{pointsDiscount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Total & Pay Button */}
                  <div className="flex justify-between text-xl font-bold text-gray-900 mb-4">
                    <span>Total</span>
                    <span className="text-[#5A0F1B]">₹{total.toLocaleString()}</span>
                  </div>
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
                        {paymentMethod === 'COD' ? `Place Order - ₹${total.toLocaleString()}` : `Pay Now - ₹${total.toLocaleString()}`}
                      </>
                    )}
                  </button>
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-600">
                    <FaCheckCircle className="text-green-600" />
                    <span>Secure & Encrypted Payment</span>
                  </div>
                </div>
              </div>
              <div>
                <button type="button" onClick={handlePreviousStep} className="flex items-center gap-2 text-[#5A0F1B] hover:text-[#7A1525] font-semibold">
                  <FaArrowLeft /> Back to Address
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CheckoutSteps;
