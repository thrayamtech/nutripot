import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeart, FaLeaf, FaSeedling } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#1a431c] to-[#0d2611] text-gray-300">
      {/* Decorative top wave */}
      <div className="w-full overflow-hidden leading-none" style={{ height: '40px' }}>
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,20 C300,40 600,0 900,20 C1050,30 1150,15 1200,20 L1200,40 L0,40 Z" fill="#faf9f7" />
        </svg>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 pt-4 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img src="/logo.png" alt="NutriPot" className="w-14 h-14 object-contain"
                onError={(e) => { e.target.style.display = 'none'; }} />
              <div>
                <h3 className="text-xl font-display font-bold text-white leading-tight">NutriPot</h3>
                <span className="text-[10px] font-bold text-[#f77c1c] tracking-[0.2em] uppercase">Pure Natural Goodness</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-5 leading-relaxed">
              Your trusted source for premium natural food products. From farm-fresh ingredients to wholesome snacks — we bring nature's best to your table.
            </p>
            <div className="flex space-x-2.5">
              {[
                { href: 'https://facebook.com', icon: <FaFacebook className="text-lg" /> },
                { href: 'https://instagram.com', icon: <FaInstagram className="text-lg" /> },
                { href: 'https://twitter.com', icon: <FaTwitter className="text-lg" /> },
                { href: 'https://youtube.com', icon: <FaYoutube className="text-lg" /> },
              ].map(({ href, icon }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 hover:bg-[#2d7d32] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                  {icon}
                </a>
              ))}
            </div>

            {/* Green badge */}
            <div className="mt-5 inline-flex items-center gap-2 bg-[#2d7d32]/30 border border-[#2d7d32]/50 rounded-full px-4 py-1.5">
              <FaLeaf className="text-[#4a9d4a] text-xs" />
              <span className="text-xs font-semibold text-green-300">100% Natural Certified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <FaSeedling className="text-[#4a9d4a] text-sm" />
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'Shop All Products' },
                { to: '/categories', label: 'Categories' },
                { to: '/about', label: 'About NutriPot' },
                { to: '/blogs', label: 'Health & Nutrition Blog' },
                { to: '/contact', label: 'Contact Us' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-gray-400 hover:text-[#66BB6A] transition-colors duration-200 text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2d7d32] group-hover:bg-[#f77c1c] transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <FaLeaf className="text-[#4a9d4a] text-sm" />
              Customer Service
            </h4>
            <ul className="space-y-2.5">
              {[
                { to: '/contact', label: 'Help & Support' },
                { to: '/track-order', label: 'Track Your Order' },
                { to: '/shipping-policy', label: 'Shipping Information' },
                { to: '/refund-policy', label: 'Returns & Refunds' },
                { to: '/faq', label: 'FAQ' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-gray-400 hover:text-[#66BB6A] transition-colors duration-200 text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2d7d32] group-hover:bg-[#f77c1c] transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <FaPhone className="text-[#4a9d4a] text-sm" />
              Get In Touch
            </h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-[#f77c1c] mt-0.5 flex-shrink-0 text-sm" />
                <span className="text-gray-400 text-sm leading-relaxed">
                  11/109/2, Edavattam, Thirunanthikarai,<br />
                  Kulasekharam, Kanyakumari Dist,<br />
                  629161, Tamilnadu, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-[#f77c1c] flex-shrink-0 text-sm" />
                <a href="tel:+918807259471" className="text-gray-400 hover:text-[#66BB6A] transition-colors text-sm">+91 88072 59471</a>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-[#f77c1c] flex-shrink-0 text-sm" />
                <a href="mailto:info@nutripot.in" className="text-gray-400 hover:text-[#66BB6A] transition-colors text-sm">info@nutripot.in</a>
              </li>
              <li className="flex items-center gap-3">
                <FaWhatsapp className="text-[#f77c1c] flex-shrink-0 text-sm" />
                <a href="https://wa.me/918807259471" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#66BB6A] transition-colors text-sm">Chat on WhatsApp</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-t border-[#2d7d32]/30 py-5">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 text-center">
            {[
              { label: '100% Natural', desc: 'All ingredients' },
              { label: 'No Preservatives', desc: 'Pure & clean' },
              { label: 'Free Shipping', desc: 'On orders ₹999+' },
              { label: 'Secure Payment', desc: 'UPI, Cards, Net Banking' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <FaLeaf className="text-[#4a9d4a]" />
                <div>
                  <span className="font-bold text-white">{label}</span>
                  <span className="text-gray-500 ml-1 text-xs">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-[#2d7d32]/20 bg-[#0a1e0c] py-5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm">
            <p className="text-gray-500">
              © 2025 NutriPot. All rights reserved.
            </p>
            <div className="flex items-center text-gray-500 gap-1">
              <span>Made with</span>
              <FaHeart className="text-[#f77c1c] animate-pulse mx-1" />
              <span>in India</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
              {[
                { to: '/privacy-policy', label: 'Privacy Policy' },
                { to: '/terms-conditions', label: 'Terms' },
                { to: '/refund-policy', label: 'Refund Policy' },
                { to: '/shipping-policy', label: 'Shipping' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="text-gray-500 hover:text-[#66BB6A] transition-colors">{label}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
