import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPhone, FaLock, FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { toast } from 'react-toastify';

const UserLogin = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  const { setAuthData } = useAuth();
  const navigate = useNavigate();

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

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!mobileNumber || mobileNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      // Send WhatsApp OTP for all users (new and existing)
      const { data } = await API.post('/auth/send-whatsapp-otp', { phone: mobileNumber });

      setOtpSent(true);
      setTimer(60);

      if (data.exists) {
        toast.success(`Welcome back! OTP sent to your WhatsApp number.`);
      } else {
        toast.success(`New user! OTP sent to your WhatsApp number.`);
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp) {
      toast.error('Please enter OTP');
      return;
    }

    setLoading(true);
    try {
      // Verify WhatsApp OTP for all users (handles both login and registration)
      const response = await API.post('/auth/verify-whatsapp-otp', {
        phone: mobileNumber,
        otp: otp
      });

      // Update AuthContext immediately
      setAuthData(response.data.token, response.data.user);

      // Show success message
      if (response.data.user.isNewUser) {
        toast.success('Account created successfully! Please update your profile.');
      } else {
        toast.success('Welcome back!');
      }

      // Navigate based on user type
      if (response.data.user.isNewUser) {
        // New user - redirect to profile update
        navigate('/profile');
      } else {
        // Existing user - redirect to home
        navigate('/');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to verify OTP';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      // Resend WhatsApp OTP for all users
      await API.post('/auth/send-whatsapp-otp', { phone: mobileNumber });

      setTimer(60);
      toast.success(`OTP resent to your WhatsApp number.`);
    } catch (error) {
      console.error('Resend OTP error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditNumber = () => {
    setOtpSent(false);
    setOtp('');
    setTimer(60);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-amber-50 py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-rose-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-orange-200/20 to-pink-200/20 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Header - Modern & Clean */}
        <div className="text-center mb-4">
          <h1 className="text-2xl md:text-3xl font-serif font-bold mb-2">
            <span className="bg-gradient-to-r from-[#5A0F1B] via-[#7A1525] to-[#5A0F1B] bg-clip-text text-transparent">
              Login or Register
            </span>
          </h1>
          <p className="text-gray-600 text-sm mb-1">
            Continue with your mobile number
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-[#5A0F1B] to-transparent"></div>
            <p className="text-xs text-[#5A0F1B] font-medium">
              One-step authentication
            </p>
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-[#5A0F1B] to-transparent"></div>
          </div>
        </div>

        {/* Login Card - Modern Glass Effect */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8">
          {!otpSent ? (
            // Mobile Number Step
            <form onSubmit={handleSendOTP}>
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-800 mb-2">
                  Mobile Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <FaPhone className="text-[#5A0F1B] group-focus-within:text-[#7A1525] transition-colors" />
                  </div>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-14 pr-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5A0F1B]/20 focus:border-[#5A0F1B] transition-all text-base bg-white/50"
                    maxLength="10"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  We'll send you a verification code
                </p>
              </div>

              <button
                type="submit"
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

            </form>
          ) : (
            // OTP Verification Step
            <form onSubmit={handleVerifyOTP}>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-semibold text-gray-800">
                    Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={handleEditNumber}
                    className="text-sm text-[#5A0F1B] hover:text-[#7A1525] font-semibold transition-colors"
                  >
                    Edit Number
                  </button>
                </div>
                <div className="mb-4 p-3 bg-gradient-to-r from-[#5A0F1B]/10 to-[#7A1525]/10 rounded-xl border border-[#5A0F1B]/20">
                  <p className="text-sm text-gray-700 text-center">
                    <FaWhatsapp className="inline text-green-600 mr-1" />
                    WhatsApp OTP sent to <span className="font-bold text-[#5A0F1B]">{mobileNumber}</span>
                  </p>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <FaLock className="text-[#5A0F1B] group-focus-within:text-[#7A1525] transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="• • • •"
                    className="w-full pl-14 pr-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5A0F1B]/20 focus:border-[#5A0F1B] transition-all text-center text-2xl tracking-[1em] font-bold bg-white/50"
                    maxLength="4"
                    required
                  />
                </div>
              </div>

              {/* Timer and Resend */}
              <div className="text-center mb-6">
                {timer > 0 ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-[#5A0F1B] rounded-full animate-pulse"></div>
                    <p className="text-sm text-gray-600">
                      Resend code in <span className="font-bold text-[#5A0F1B]">{timer}s</span>
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-sm text-[#5A0F1B] hover:text-[#7A1525] font-bold underline decoration-2 underline-offset-4 transition-colors"
                  >
                    Resend Verification Code
                  </button>
                )}
              </div>

              <button
                type="submit"
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
            </form>
          )}
        </div>

        {/* Footer Links - Modern Design */}
        <div className="mt-6 text-center space-y-3">
          <div className="bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/30 shadow-lg">
            <p className="text-sm text-gray-700 font-medium mb-2">
              ✨ New to JJ Trendz Official?
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              No registration needed! Just enter your mobile number and we'll create your account automatically.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserLogin;
