import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaLeaf, FaLock, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f7] py-10 px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-100/40 rounded-full blur-3xl -translate-y-32 translate-x-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-amber-100/30 rounded-full blur-3xl translate-y-28 -translate-x-28 pointer-events-none" />

      <div className="max-w-sm w-full relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2 group">
            <img src="/logo.png" alt="NutriPot" className="w-16 h-16 object-contain group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-16 h-16 bg-gradient-to-br from-[#2d7d32] to-[#1a431c] rounded-2xl items-center justify-center shadow-xl hidden">
              <FaLeaf className="text-white text-2xl" />
            </div>
          </Link>
          <h2 className="text-2xl font-display font-bold text-[#1a431c] mt-3">Admin Login</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to the NutriPot admin panel</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-50 p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-[#2d7d32] text-sm" />
                </div>
                <input
                  id="email" name="email" type="email" autoComplete="email" required
                  value={formData.email} onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2d7d32] focus:ring-2 focus:ring-[#2d7d32]/10 transition-all bg-gray-50/50"
                  placeholder="admin@nutripot.in"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-[#2d7d32] text-sm" />
                </div>
                <input
                  id="password" name="password" type="password" autoComplete="current-password" required
                  value={formData.password} onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2d7d32] focus:ring-2 focus:ring-[#2d7d32]/10 transition-all bg-gray-50/50"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-[#2d7d32] rounded" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-[#2d7d32] hover:text-[#1e6623] font-semibold transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#2d7d32] to-[#1e6623] hover:from-[#1e6623] hover:to-[#1a431c] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
                : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="text-center mt-5">
          <p className="text-sm text-gray-500">
            Not an admin?{' '}
            <Link to="/user-login" className="font-bold text-[#2d7d32] hover:text-[#1e6623] transition-colors">
              User Login
            </Link>
          </p>
          <Link to="/" className="block mt-2 text-xs text-gray-400 hover:text-[#2d7d32] transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
