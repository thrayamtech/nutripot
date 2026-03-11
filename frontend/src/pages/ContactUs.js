import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaWhatsapp, FaPaperPlane, FaLeaf } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Thank you for reaching out! We will get back to you within 24 hours.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  const contactCards = [
    {
      icon: <FaPhone className="text-2xl" />,
      title: 'Call Us',
      sub: 'Mon–Sat (10 AM – 7 PM)',
      value: '+91 88072 59471',
      href: 'tel:+918807259471',
      color: '#2d7d32',
    },
    {
      icon: <FaEnvelope className="text-2xl" />,
      title: 'Email Us',
      sub: 'Response within 24 hours',
      value: 'info@nutripot.in',
      href: 'mailto:info@nutripot.in',
      color: '#f77c1c',
    },
    {
      icon: <FaWhatsapp className="text-2xl" />,
      title: 'WhatsApp',
      sub: 'Chat with us instantly',
      value: 'Start Chat',
      href: 'https://wa.me/918807259471',
      color: '#2d7d32',
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f7]">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#1a431c] via-[#2d7d32] to-[#1e6623] text-white py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice">
            <path d="M 0 150 Q 200 50, 400 150 T 800 150" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
            <FaLeaf className="text-[#66BB6A]" /> We're Here to Help
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Get In Touch</h1>
          <p className="text-lg text-green-100 max-w-xl mx-auto">
            Have a question about our products or your order? We'd love to hear from you and help you choose the right natural products.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {contactCards.map(({ icon, title, sub, value, href, color }) => (
            <div key={title} className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group" style={{ borderTop: `4px solid ${color}` }}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${color}15`, color }}>
                {icon}
              </div>
              <h3 className="text-base font-display font-bold text-gray-800 mb-1">{title}</h3>
              <p className="text-xs text-gray-400 mb-2">{sub}</p>
              <a
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="font-bold text-sm transition-colors"
                style={{ color }}
              >
                {value}
              </a>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-md p-8 border border-green-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#2d7d32]/10 rounded-xl flex items-center justify-center">
                <FaPaperPlane className="text-[#2d7d32]" />
              </div>
              <h2 className="text-xl font-display font-bold text-gray-800">Send Us a Message</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6 ml-13">Fill out the form and we'll respond as soon as possible</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name *</label>
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange} required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7d32]/30 focus:border-[#2d7d32] bg-gray-50/50 transition-all"
                  placeholder="Enter your name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange} required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7d32]/30 focus:border-[#2d7d32] bg-gray-50/50 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7d32]/30 focus:border-[#2d7d32] bg-gray-50/50 transition-all"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject *</label>
                <select
                  name="subject" value={formData.subject} onChange={handleChange} required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7d32]/30 focus:border-[#2d7d32] bg-gray-50/50 transition-all"
                >
                  <option value="">Select a topic</option>
                  <option value="product-inquiry">Product Inquiry</option>
                  <option value="order-status">Order Status</option>
                  <option value="return-exchange">Return / Refund</option>
                  <option value="nutritional-advice">Nutritional Advice</option>
                  <option value="bulk-order">Bulk / Wholesale Order</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Message *</label>
                <textarea
                  name="message" value={formData.message} onChange={handleChange} required rows="5"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7d32]/30 focus:border-[#2d7d32] bg-gray-50/50 resize-none transition-all"
                  placeholder="How can we help you today?"
                />
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-[#2d7d32] to-[#1e6623] hover:from-[#1e6623] hover:to-[#1a431c] text-white py-3.5 px-6 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
                ) : (
                  <><FaPaperPlane className="text-sm" />Send Message</>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar info */}
          <div className="space-y-5">
            {/* Office Location */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-green-50">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-[#2d7d32]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="text-[#2d7d32]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-gray-800 mb-2">Our Office</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    11/109/2, Edavattam,<br />
                    Thirunanthikarai, Kulasekharam,<br />
                    Kanyakumari Dist – 629161,<br />
                    Tamilnadu, India
                  </p>
                </div>
              </div>
              <div className="w-full h-48 bg-green-50 rounded-xl overflow-hidden mt-2">
                <iframe
                  title="Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.886539092!2d77.49085284335113!3d12.953945614058336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-green-50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#f77c1c]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaClock className="text-[#f77c1c]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-gray-800 mb-3">Business Hours</h3>
                  <div className="space-y-2 text-sm">
                    {[
                      { day: 'Monday – Friday', time: '10:00 AM – 7:00 PM' },
                      { day: 'Saturday', time: '10:00 AM – 6:00 PM' },
                      { day: 'Sunday', time: 'Closed', closed: true },
                    ].map(({ day, time, closed }) => (
                      <div key={day} className="flex justify-between text-gray-600">
                        <span className="font-medium">{day}:</span>
                        <span className={closed ? 'text-red-500 font-semibold' : ''}>{time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick CTA */}
            <div className="bg-gradient-to-br from-[#2d7d32] to-[#1a431c] rounded-2xl p-6 text-white">
              <FaLeaf className="text-3xl text-green-300 mb-3" />
              <h3 className="text-lg font-display font-bold mb-2">Need Instant Help?</h3>
              <p className="text-green-100 text-sm mb-4 leading-relaxed">
                Chat with us on WhatsApp for quick answers about products, orders, or nutritional advice.
              </p>
              <a
                href="https://wa.me/918807259471" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#2d7d32] px-5 py-2.5 rounded-full font-bold hover:bg-green-50 transition-all text-sm shadow-md"
              >
                <FaWhatsapp className="text-green-600" /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
