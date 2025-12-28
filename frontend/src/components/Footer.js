import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaPinterest, FaYoutube, FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-serif font-bold text-white mb-4 bg-gradient-to-r from-[#8A1F35] to-[#5A0F1B] bg-clip-text text-transparent">
              Saree Elegance
            </h3>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Your one-stop destination for exquisite traditional and contemporary sarees. We bring you the finest collection of handcrafted sarees from across India.
            </p>
            <div className="flex space-x-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-[#5A0F1B] p-3 rounded-full transition">
                <FaFacebook className="text-xl" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-[#5A0F1B] p-3 rounded-full transition">
                <FaInstagram className="text-xl" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-[#5A0F1B] p-3 rounded-full transition">
                <FaTwitter className="text-xl" />
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-[#5A0F1B] p-3 rounded-full transition">
                <FaPinterest className="text-xl" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-[#5A0F1B] p-3 rounded-full transition">
                <FaYoutube className="text-xl" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4 border-b border-[#5A0F1B] pb-2">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-[#8A1F35] transition flex items-center">
                  <span className="mr-2">›</span> Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-[#8A1F35] transition flex items-center">
                  <span className="mr-2">›</span> Shop
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-[#8A1F35] transition flex items-center">
                  <span className="mr-2">›</span> Categories
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#8A1F35] transition flex items-center">
                  <span className="mr-2">›</span> About Us
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-[#8A1F35] transition flex items-center">
                  <span className="mr-2">›</span> Blogs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#8A1F35] transition flex items-center">
                  <span className="mr-2">›</span> Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4 border-b border-[#5A0F1B] pb-2">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="hover:text-[#8A1F35] transition flex items-center">
                  <span className="mr-2">›</span> Contact Us
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-[#8A1F35] transition flex items-center">
                  <span className="mr-2">›</span> Track Order
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-[#8A1F35] transition flex items-center">
                  <span className="mr-2">›</span> Shipping Information
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-[#8A1F35] transition flex items-center">
                  <span className="mr-2">›</span> Returns & Exchange
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[#8A1F35] transition flex items-center">
                  <span className="mr-2">›</span> FAQ
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="hover:text-[#8A1F35] transition flex items-center">
                  <span className="mr-2">›</span> Size Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4 border-b border-[#5A0F1B] pb-2">Get In Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-[#8A1F35] mt-1 mr-3 flex-shrink-0" />
                <span className="text-sm">
                  123 Saree Street, Fashion District,<br />
                  Mumbai, Maharashtra 400001
                </span>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-[#8A1F35] mr-3 flex-shrink-0" />
                <a href="tel:+919744707060" className="hover:text-[#8A1F35] transition text-sm">
                  +91 97447 07060
                </a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-[#8A1F35] mr-3 flex-shrink-0" />
                <a href="mailto:[email protected]" className="hover:text-[#8A1F35] transition text-sm">
                  [email protected]
                </a>
              </li>
              <li className="flex items-center">
                <FaWhatsapp className="text-[#8A1F35] mr-3 flex-shrink-0" />
                <a href="https://wa.me/919744707060" target="_blank" rel="noopener noreferrer" className="hover:text-[#8A1F35] transition text-sm">
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment & Trust Badges */}
      <div className="border-t border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 text-center">
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-semibold text-white">Secure Payment:</span>
              <span className="text-gray-400">Visa, MasterCard, UPI, Net Banking</span>
            </div>
            <div className="text-gray-400 text-sm">|</div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-semibold text-white">100% Authentic</span>
            </div>
            <div className="text-gray-400 text-sm">|</div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-semibold text-white">Free Shipping</span>
              <span className="text-gray-400">On Orders ₹999+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800 bg-black py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-gray-400 mb-2 md:mb-0">
              © 2025 Saree Elegance. All rights reserved.
            </p>
            <div className="flex items-center text-gray-400">
              <span>Made with</span>
              <FaHeart className="text-red-500 mx-2 animate-pulse" />
              <span>in India</span>
            </div>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <Link to="/privacy" className="hover:text-[#8A1F35] transition">
                Privacy Policy
              </Link>
              <span className="text-gray-600">|</span>
              <Link to="/terms" className="hover:text-[#8A1F35] transition">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
