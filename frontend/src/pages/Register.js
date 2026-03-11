import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaLeaf, FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);
    try {
      await register({ name: formData.name, email: formData.email, password: formData.password, phone: formData.phone });
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name', icon: <FaUser className="text-[#2d7d32] text-sm" /> },
    { id: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com', icon: <FaEnvelope className="text-[#2d7d32] text-sm" /> },
    { id: 'phone', label: 'Phone Number (Optional)', type: 'tel', placeholder: '9876543210', icon: <FaPhone className="text-[#2d7d32] text-sm" /> },
    { id: 'password', label: 'Password', type: 'password', placeholder: 'At least 6 characters', icon: <FaLock className="text-[#2d7d32] text-sm" /> },
    { id: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Re-enter your password', icon: <FaLock className="text-[#2d7d32] text-sm" /> },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f7] py-10 px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-100/40 rounded-full blur-3xl -translate-y-32 translate-x-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-amber-100/30 rounded-full blur-3xl translate-y-28 -translate-x-28 pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-7">
          <Link to="/" className="inline-flex flex-col items-center gap-2 group">
            <img src="/logo.png" alt="NutriPot" className="w-14 h-14 object-contain group-hover:scale-105 transition-transform"
              onError={(e) => { e.target.style.display = 'none'; }} />
          </Link>
          <h2 className="text-2xl font-display font-bold text-[#1a431c] mt-3">Create Your Account</h2>
          <p className="text-sm text-gray-500 mt-1">
            Already have an account?{' '}
            <Link to="/user-login" className="font-bold text-[#2d7d32] hover:text-[#1e6623] transition-colors">Sign in</Link>
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-50 p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ id, label, type, placeholder, icon }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">{icon}</div>
                  <input
                    id={id} name={id} type={type} required={id !== 'phone'}
                    value={formData[id]} onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7d32]/10 transition-all bg-gray-50/50 ${errors[id] ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[#2d7d32]'}`}
                    placeholder={placeholder}
                  />
                </div>
                {errors[id] && <p className="mt-1 text-xs text-red-500 font-medium">{errors[id]}</p>}
              </div>
            ))}

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#2d7d32] to-[#1e6623] hover:from-[#1e6623] hover:to-[#1a431c] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</>
                : <><FaLeaf className="text-sm" />Create Account</>}
            </button>

            <p className="text-xs text-center text-gray-400 mt-2">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-[#2d7d32] hover:underline">Terms of Service</Link> and{' '}
              <Link to="/privacy" className="text-[#2d7d32] hover:underline">Privacy Policy</Link>
            </p>
          </form>
        </div>

        <div className="text-center mt-5">
          <Link to="/" className="text-xs text-gray-400 hover:text-[#2d7d32] transition-colors">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
