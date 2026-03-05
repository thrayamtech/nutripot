import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaPinterest, FaYoutube, FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#0c1a5c] to-[#060e35] text-gray-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-serif font-bold mb-1 bg-gradient-to-r from-white to-[#93c5fd] bg-clip-text text-transparent">
              JJ Trendz
            </h3>
            <p className="text-blue-300 text-xs font-semibold tracking-widest mb-4 uppercase">Official</p>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Your one-stop destination for premium boutique fashion. We bring you the finest collection of handcrafted and designer wear, blending tradition with modern elegance.
            </p>
            <div className="flex space-x-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-[#1e3a8a]/50 hover:bg-[#1e3a8a] p-3 rounded-full transition">
                <FaFacebook className="text-xl" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-[#1e3a8a]/50 hover:bg-[#1e3a8a] p-3 rounded-full transition">
                <FaInstagram className="text-xl" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-[#1e3a8a]/50 hover:bg-[#1e3a8a] p-3 rounded-full transition">
                <FaTwitter className="text-xl" />
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="bg-[#1e3a8a]/50 hover:bg-[#1e3a8a] p-3 rounded-full transition">
                <FaPinterest className="text-xl" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="bg-[#1e3a8a]/50 hover:bg-[#1e3a8a] p-3 rounded-full transition">
                <FaYoutube className="text-xl" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4 border-b border-[#1e3a8a] pb-2">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-[#60a5fa] transition flex items-center"><span className="mr-2">›</span> Home</Link></li>
              <li><Link to="/products" className="hover:text-[#60a5fa] transition flex items-center"><span className="mr-2">›</span> Shop</Link></li>
              <li><Link to="/categories" className="hover:text-[#60a5fa] transition flex items-center"><span className="mr-2">›</span> Categories</Link></li>
              <li><Link to="/about" className="hover:text-[#60a5fa] transition flex items-center"><span className="mr-2">›</span> About Us</Link></li>
              <li><Link to="/blogs" className="hover:text-[#60a5fa] transition flex items-center"><span className="mr-2">›</span> Blogs</Link></li>
              <li><Link to="/contact" className="hover:text-[#60a5fa] transition flex items-center"><span className="mr-2">›</span> Contact Us</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4 border-b border-[#1e3a8a] pb-2">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link to="/contact" className="hover:text-[#60a5fa] transition flex items-center"><span className="mr-2">›</span> Contact Us</Link></li>
              <li><Link to="/track-order" className="hover:text-[#60a5fa] transition flex items-center"><span className="mr-2">›</span> Track Order</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-[#60a5fa] transition flex items-center"><span className="mr-2">›</span> Shipping Information</Link></li>
              <li><Link to="/refund-policy" className="hover:text-[#60a5fa] transition flex items-center"><span className="mr-2">›</span> Returns & Exchange</Link></li>
              <li><Link to="/faq" className="hover:text-[#60a5fa] transition flex items-center"><span className="mr-2">›</span> FAQ</Link></li>
              <li><Link to="/size-guide" className="hover:text-[#60a5fa] transition flex items-center"><span className="mr-2">›</span> Size Guide</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4 border-b border-[#1e3a8a] pb-2">Get In Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-[#60a5fa] mt-1 mr-3 flex-shrink-0" />
                <span className="text-sm">
                  11/109/2, Edavattam, Thirunanthikarai,<br />
                  Kulasekharam, Kanyakumari Dist,<br />
                  629161, Tamilnadu
                </span>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-[#60a5fa] mr-3 flex-shrink-0" />
                <a href="tel:+918807259471" className="hover:text-[#60a5fa] transition text-sm">+91 88072 59471</a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-[#60a5fa] mr-3 flex-shrink-0" />
                <a href="mailto:info@jjtrendz.com" className="hover:text-[#60a5fa] transition text-sm">info@jjtrendz.com</a>
              </li>
              <li className="flex items-center">
                <FaWhatsapp className="text-[#60a5fa] mr-3 flex-shrink-0" />
                <a href="https://wa.me/918807259471" target="_blank" rel="noopener noreferrer" className="hover:text-[#60a5fa] transition text-sm">Chat on WhatsApp</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment & Trust Badges */}
      <div className="border-t border-[#1e3a8a]/40 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 text-center">
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-semibold text-white">Secure Payment:</span>
              <span className="text-gray-400">Visa, MasterCard, UPI, Net Banking</span>
            </div>
            <div className="text-gray-600 text-sm">|</div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-semibold text-white">100% Authentic</span>
            </div>
            <div className="text-gray-600 text-sm">|</div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-semibold text-white">Free Shipping</span>
              <span className="text-gray-400">On Orders ₹999+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-[#1e3a8a]/40 bg-[#060e35] py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-gray-400 mb-2 md:mb-0">
              © 2025 JJ Trendz Official. All rights reserved.
            </p>
            <div className="flex items-center text-gray-400">
              <span>Made with</span>
              <FaHeart className="text-blue-400 mx-2 animate-pulse" />
              <span>in India</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 md:mt-0">
              <Link to="/privacy-policy" className="hover:text-[#60a5fa] transition">Privacy Policy</Link>
              <span className="text-gray-600">|</span>
              <Link to="/terms-conditions" className="hover:text-[#60a5fa] transition">Terms & Conditions</Link>
              <span className="text-gray-600">|</span>
              <Link to="/refund-policy" className="hover:text-[#60a5fa] transition">Refund Policy</Link>
              <span className="text-gray-600">|</span>
              <Link to="/shipping-policy" className="hover:text-[#60a5fa] transition">Shipping Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
