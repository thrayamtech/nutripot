import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWhatsapp, FaLock, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const WhatsAppLogin = () => {
  const navigate = useNavigate();
  const { setAuthData, isAuthenticated } = useAuth();

  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [userExists, setUserExists] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // OTP Timer
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!mobileNumber || mobileNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/send-whatsapp-otp', {
        phone: mobileNumber
      });

      setUserExists(data.exists);
      setOtpSent(true);
      setTimer(60);

      if (data.exists) {
        toast.success(`Welcome back! OTP sent to your WhatsApp (${mobileNumber})`);
      } else {
        toast.success(`New user detected! OTP sent to your WhatsApp (${mobileNumber})`);
      }

      // Show OTP in development mode
      if (data.otp) {
        toast.info(`Development Mode - OTP: ${data.otp}`, { autoClose: 10000 });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to send OTP';
      toast.error(errorMsg);
      console.error('Send OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length < 4) {
      toast.error('Please enter a valid OTP');
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/verify-whatsapp-otp', {
        phone: mobileNumber,
        otp: otp
      });

      setAuthData(data.token, data.user);

      if (data.user.isNewUser) {
        toast.success('Account created! Please complete your profile.');
        navigate('/profile');
      } else {
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid OTP. Please try again.';
      toast.error(errorMsg);
      console.error('Verify OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtp('');
    setOtpSent(false);
    setTimer(0);
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/user-login')}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-[#2d7d32] transition-colors font-medium text-sm"
        >
          <FaArrowLeft className="text-xs" />
          <span>Back to Login</span>
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-50 p-8">
          {/* Logo/Header */}
          <div className="text-center mb-7">
            <div className="w-20 h-20 bg-gradient-to-br from-[#2d7d32] to-[#1a431c] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FaWhatsapp className="text-4xl text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-[#1a431c] mb-1">
              WhatsApp Login
            </h1>
            <p className="text-gray-500 text-sm">
              Verify securely via WhatsApp OTP
            </p>
          </div>

          {!otpSent ? (
            // Phone Number Form
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d7d32]/20 focus:border-[#2d7d32]"
                    maxLength="10"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  OTP will be sent to your WhatsApp number
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || mobileNumber.length !== 10}
                className="w-full bg-gradient-to-r from-[#2d7d32] to-[#1e6623] text-white py-3.5 rounded-xl font-bold hover:from-[#1e6623] hover:to-[#1a431c] focus:outline-none focus:ring-2 focus:ring-[#2d7d32]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <FaWhatsapp />
                    <span>Send OTP via WhatsApp</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            // OTP Verification Form
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Enter OTP
                  </label>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-sm text-[#2d7d32] hover:text-[#1e6623] font-medium"
                  >
                    Change Number
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 4-digit OTP"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d7d32]/20 focus:border-[#2d7d32] text-center text-2xl tracking-widest"
                    maxLength="6"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 text-center">
                  OTP sent to WhatsApp: +91 {mobileNumber}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  `Verify & ${userExists ? 'Login' : 'Create Account'}`
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend OTP in <span className="font-semibold text-[#2d7d32]">{timer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="text-sm text-[#2d7d32] hover:text-[#1e6623] font-medium hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Info Box */}
          <div className="mt-6 p-4 bg-[#f0faf0] border border-green-200 rounded-xl">
            <p className="text-xs text-gray-600 text-center">
              <FaWhatsapp className="inline mr-1 text-[#2d7d32]" />
              Secure authentication via WhatsApp
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-[#2d7d32] hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-[#2d7d32] hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppLogin;
