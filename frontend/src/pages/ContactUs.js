import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaWhatsapp, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success('Thank you for contacting us! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] text-white py-16">
        <div className="max-w-[1600px] mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Get In Touch</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-12">
        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow border-t-4 border-[#5A0F1B]">
            <div className="bg-[#5A0F1B]/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaPhone className="text-2xl text-[#5A0F1B]" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Call Us</h3>
            <p className="text-sm text-gray-600 mb-2">Mon-Sat (10 AM - 7 PM)</p>
            <a href="tel:+919744707060" className="text-[#5A0F1B] font-semibold hover:text-[#7A1525]">
              +91 97447 07060
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow border-t-4 border-[#5A0F1B]">
            <div className="bg-[#5A0F1B]/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaEnvelope className="text-2xl text-[#5A0F1B]" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Email Us</h3>
            <p className="text-sm text-gray-600 mb-2">We'll respond within 24 hours</p>
            <a href="mailto:[email protected]" className="text-[#5A0F1B] font-semibold hover:text-[#7A1525]">
              [email protected]
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow border-t-4 border-[#5A0F1B]">
            <div className="bg-[#5A0F1B]/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaWhatsapp className="text-2xl text-[#5A0F1B]" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">WhatsApp</h3>
            <p className="text-sm text-gray-600 mb-2">Chat with us instantly</p>
            <a
              href="https://wa.me/919744707060"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5A0F1B] font-semibold hover:text-[#7A1525]"
            >
              Start Chat
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Send Us a Message</h2>
            <p className="text-gray-600 mb-6">
              Fill out the form below and we'll get back to you as soon as possible
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A0F1B] focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A0F1B] focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A0F1B] focus:border-transparent"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A0F1B] focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="product-inquiry">Product Inquiry</option>
                  <option value="order-status">Order Status</option>
                  <option value="return-exchange">Return/Exchange</option>
                  <option value="bulk-order">Bulk Order</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Your Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A0F1B] focus:border-transparent resize-none"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] text-white py-3 px-6 rounded-lg font-bold hover:from-[#7A1525] hover:to-[#8A1F35] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            {/* Office Location */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-[#5A0F1B]/10 p-3 rounded-full">
                  <FaMapMarkerAlt className="text-xl text-[#5A0F1B]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Our Office</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    123, Silk Market Street,<br />
                    Textile Hub, Bangalore,<br />
                    Karnataka - 560001, India
                  </p>
                </div>
              </div>

              {/* Map */}
              <div className="w-full h-52 bg-gray-200 rounded-lg overflow-hidden mt-4">
                <iframe
                  title="Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.886539092!2d77.49085284335113!3d12.953945614058336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-4">
                <div className="bg-[#5A0F1B]/10 p-3 rounded-full">
                  <FaClock className="text-xl text-[#5A0F1B]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Business Hours</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span className="font-medium">Monday - Friday:</span>
                      <span>10:00 AM - 7:00 PM</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span className="font-medium">Saturday:</span>
                      <span>10:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span className="font-medium">Sunday:</span>
                      <span className="text-red-600 font-medium">Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Center CTA */}
            <div className="bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] rounded-lg shadow-md p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Need Quick Answers?</h3>
              <p className="text-white/90 text-sm mb-4">
                Check our FAQ section for instant answers to common questions about orders, shipping, and returns.
              </p>
              <button className="bg-white text-[#5A0F1B] px-5 py-2.5 rounded-lg font-bold hover:bg-gray-100 transition-all text-sm">
                View FAQ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
