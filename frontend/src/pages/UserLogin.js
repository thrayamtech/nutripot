import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPhone, FaLock, FaWhatsapp, FaLeaf, FaShieldAlt } from 'react-icons/fa';
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

  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
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
      const { data } = await API.post('/auth/send-whatsapp-otp', { phone: mobileNumber });
      setOtpSent(true);
      setTimer(60);
      toast.success(data.exists ? 'Welcome back! OTP sent to your WhatsApp.' : 'New user! OTP sent to your WhatsApp.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) { toast.error('Please enter OTP'); return; }
    setLoading(true);
    try {
      const response = await API.post('/auth/verify-whatsapp-otp', { phone: mobileNumber, otp });
      setAuthData(response.data.token, response.data.user);
      if (response.data.user.isNewUser) {
        toast.success('Account created! Please update your profile.');
        navigate('/profile');
      } else {
        toast.success('Welcome back to NutriPot!');
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await API.post('/auth/send-whatsapp-otp', { phone: mobileNumber });
      setTimer(60);
      toast.success('OTP resent to your WhatsApp.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#faf9f7]">

      {/* Left Panel — NutriPot Brand */}
      <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-[#1a431c] via-[#2d7d32] to-[#1e6623] text-white flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 border border-white/10 rounded-full -translate-y-40 translate-x-40" />
        <div className="absolute bottom-0 left-0 w-64 h-64 border border-white/10 rounded-full translate-y-32 -translate-x-32" />
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
            <path d="M 0 300 Q 100 100, 200 300 T 400 300" stroke="white" strokeWidth="2" fill="none" />
            <path d="M 0 350 Q 100 150, 200 350 T 400 350" stroke="white" strokeWidth="1" fill="none" />
          </svg>
        </div>

        <div className="relative z-10 text-center max-w-xs">
          <img
            src="/logo.png"
            alt="NutriPot"
            className="w-28 h-28 object-contain mx-auto mb-6 drop-shadow-2xl"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h1 className="text-3xl font-display font-bold mb-1">NutriPot</h1>
          <p className="text-[#f77c1c] text-xs tracking-[0.25em] uppercase font-bold mb-8">Pure Natural Goodness</p>

          <div className="space-y-3 text-left">
            {[
              { icon: '🌿', text: '100% Natural & Organic' },
              { icon: '🚚', text: 'Free delivery on ₹999+' },
              { icon: '🔒', text: 'Secure OTP-based login' },
              { icon: '⭐', text: '10,000+ happy customers' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
                <span className="text-base">{icon}</span>
                <span className="text-sm font-medium text-green-100">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 sm:px-8 lg:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-green-100/40 rounded-full blur-3xl -translate-y-36 translate-x-36 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-amber-100/40 rounded-full blur-3xl translate-y-28 -translate-x-28 pointer-events-none" />

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="NutriPot" className="w-12 h-12 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
              <div>
                <p className="font-display font-bold text-[#1a431c] text-lg leading-tight">NutriPot</p>
                <p className="text-[10px] text-[#f77c1c] font-bold tracking-widest uppercase">Pure Natural Goodness</p>
              </div>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-[#1a431c] mb-1">
              {otpSent ? 'Enter Your OTP' : 'Welcome Back 👋'}
            </h2>
            <p className="text-gray-500 text-sm">
              {otpSent
                ? `Verification code sent to +91 ${mobileNumber}`
                : 'Login or sign up with your mobile number'}
            </p>
          </div>

          {/* Step Progress */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${!otpSent ? 'bg-[#2d7d32] text-white shadow-md' : 'bg-green-100 text-[#2d7d32]'}`}>1</div>
            <div className="flex-1 h-1 rounded-full bg-gradient-to-r from-[#2d7d32] to-green-100" />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${otpSent ? 'bg-[#2d7d32] text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>2</div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-green-50 p-7">
            {!otpSent ? (
              /* Step 1: Mobile Number */
              <form onSubmit={handleSendOTP}>
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none gap-1.5">
                      <FaPhone className="text-[#2d7d32] text-xs" />
                      <span className="text-gray-400 text-sm border-r border-gray-200 pr-2 ml-1">+91</span>
                    </div>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                      className="w-full pl-20 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2d7d32] focus:ring-2 focus:ring-[#2d7d32]/10 transition-all bg-gray-50/50"
                      maxLength="10"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-400 flex items-center gap-1.5">
                    <FaWhatsapp className="text-green-500" />
                    We'll send a WhatsApp OTP to this number
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || mobileNumber.length !== 10}
                  className="w-full py-3.5 bg-gradient-to-r from-[#2d7d32] to-[#1e6623] hover:from-[#1e6623] hover:to-[#1a431c] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending OTP...</>
                    : <>Get OTP on WhatsApp <FaWhatsapp /></>}
                </button>
              </form>
            ) : (
              /* Step 2: OTP Verification */
              <form onSubmit={handleVerifyOTP}>
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">Verification Code</label>
                    <button type="button" onClick={() => { setOtpSent(false); setOtp(''); }} className="text-xs text-[#2d7d32] hover:text-[#1e6623] font-bold transition-colors">
                      Edit Number
                    </button>
                  </div>

                  <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200 flex items-center gap-2.5">
                    <FaWhatsapp className="text-green-600 flex-shrink-0" />
                    <p className="text-sm text-gray-600">
                      Sent to <span className="font-bold text-[#2d7d32]">+91 {mobileNumber}</span>
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-[#2d7d32] text-sm" />
                    </div>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="• • • •"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2d7d32] focus:ring-2 focus:ring-[#2d7d32]/10 transition-all text-center text-3xl tracking-[0.8em] font-bold bg-gray-50/50"
                      maxLength="4"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Resend Timer */}
                <div className="text-center mb-5">
                  {timer > 0 ? (
                    <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                      <span className="w-2 h-2 bg-[#2d7d32] rounded-full animate-pulse" />
                      Resend in <span className="font-bold text-[#2d7d32] ml-1">{timer}s</span>
                    </p>
                  ) : (
                    <button type="button" onClick={handleResendOTP} disabled={loading}
                      className="text-sm text-[#2d7d32] hover:text-[#1e6623] font-bold underline underline-offset-4 transition-colors disabled:opacity-50">
                      Resend Verification Code
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 4}
                  className="w-full py-3.5 bg-gradient-to-r from-[#2d7d32] to-[#1e6623] hover:from-[#1e6623] hover:to-[#1a431c] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying...</>
                    : <><FaShieldAlt className="text-sm" />Verify &amp; Continue</>}
                </button>
              </form>
            )}
          </div>

          {/* Info note */}
          <div className="mt-5 bg-white rounded-2xl border border-green-100 shadow-sm p-4 text-center">
            <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center justify-center gap-1.5">
              <FaLeaf className="text-[#2d7d32]" /> New to NutriPot?
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              No registration needed! Just enter your mobile number — we'll create your account automatically.
            </p>
          </div>

          <div className="text-center mt-5">
            <Link to="/" className="text-xs text-gray-400 hover:text-[#2d7d32] transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
