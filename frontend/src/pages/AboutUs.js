import React from 'react';
import { Link } from 'react-router-dom';
import { FaAward, FaShippingFast, FaPhone, FaLeaf, FaSeedling, FaHeart, FaStar, FaCheckCircle } from 'react-icons/fa';

const AboutUs = () => {
  const values = [
    {
      icon: FaLeaf,
      title: '100% Natural',
      desc: 'Every product we source is free from artificial colours, flavours, and preservatives. Pure goodness in every bite.',
      color: '#2d7d32',
    },
    {
      icon: FaAward,
      title: 'Quality Assured',
      desc: 'Rigorous testing and quality checks ensure every product meets the highest standards before reaching you.',
      color: '#f77c1c',
    },
    {
      icon: FaShippingFast,
      title: 'Swift Delivery',
      desc: 'Fresh products delivered safely and quickly to your doorstep. Free delivery on orders above ₹999.',
      color: '#2d7d32',
    },
    {
      icon: FaPhone,
      title: 'Dedicated Support',
      desc: 'Our wellness team is here to guide you — from product selection to nutritional advice.',
      color: '#f77c1c',
    },
  ];

  const milestones = [
    { number: '500+', label: 'Natural Products' },
    { number: '10,000+', label: 'Happy Customers' },
    { number: '50+', label: 'Organic Farms' },
    { number: '99%', label: 'Satisfaction Rate' },
  ];

  const commitments = [
    'No artificial preservatives or additives',
    'Sustainably sourced ingredients',
    'Transparent labelling — know what you eat',
    'Supporting local and organic farmers',
    'Eco-friendly packaging where possible',
    'Third-party quality certification',
  ];

  return (
    <div className="min-h-screen bg-[#faf9f7]">

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#1a431c] via-[#2d7d32] to-[#1e6623] text-white py-20 md:py-28 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 border border-white/10 rounded-full -translate-y-48 translate-x-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 border border-white/10 rounded-full translate-y-32 -translate-x-32" />
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
            <path d="M 0 200 Q 200 50, 400 200 T 800 200" stroke="white" strokeWidth="2" fill="none" />
            <path d="M 0 250 Q 200 100, 400 250 T 800 250" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          {/* Leaf icon badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 text-sm font-semibold mb-6">
            <FaLeaf className="text-[#66BB6A]" />
            Pure Natural Goodness Since Day One
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 leading-tight">
            About <span className="text-[#f77c1c]">NutriPot</span>
          </h1>
          <p className="text-xl text-green-100 font-light max-w-2xl mx-auto leading-relaxed">
            Where nature meets nutrition — bringing you the finest natural food products, honestly sourced and lovingly curated.
          </p>
        </div>
      </div>

      {/* Stats Strip */}
      <section className="bg-white border-b border-green-100 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {milestones.map(({ number, label }) => (
              <div key={label} className="group">
                <p className="text-3xl md:text-4xl font-display font-bold text-[#2d7d32] group-hover:text-[#f77c1c] transition-colors duration-300">{number}</p>
                <p className="text-gray-500 text-sm font-medium mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <span className="text-[#f77c1c] font-bold text-xs tracking-[0.2em] uppercase">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-[#1a431c] mt-2 mb-6">
                Born from a Passion for Pure Living
              </h2>
              <div className="space-y-4 text-gray-600 text-base leading-relaxed">
                <p>
                  At <strong className="text-[#2d7d32]">NutriPot</strong>, we believe that the food you eat should nourish your body, not harm it. Our journey began with a simple mission: make genuinely natural, high-quality food products accessible to every household in India.
                </p>
                <p>
                  We work directly with trusted organic farmers and producers, cutting out the middlemen to bring you products that are both fresher and more affordable. Every ingredient is traceable, every product is honest.
                </p>
                <p>
                  From our wholesome dry fruits and nuts to our pure spice blends and herbal products — every NutriPot item carries our promise of purity, quality, and taste.
                </p>
              </div>
            </div>

            {/* Visual element */}
            <div className="relative flex items-center justify-center">
              <div className="w-72 h-72 md:w-96 md:h-96 relative">
                {/* Outer ring */}
                <div className="absolute inset-0 border-4 border-[#2d7d32]/20 rounded-full" />
                <div className="absolute inset-6 border-2 border-[#f77c1c]/20 rounded-full" />
                {/* Center */}
                <div className="absolute inset-12 bg-gradient-to-br from-[#2d7d32] to-[#1a431c] rounded-full flex items-center justify-center shadow-2xl">
                  <div className="text-center text-white">
                    <FaLeaf className="text-5xl mx-auto mb-2 text-green-200" />
                    <p className="font-display font-bold text-2xl">NutriPot</p>
                    <p className="text-green-300 text-xs tracking-widest">PURE NATURAL</p>
                  </div>
                </div>
                {/* Orbiting badges */}
                {[
                  { icon: '🌿', label: 'Organic', pos: 'top-0 left-1/2 -translate-x-1/2 -translate-y-4' },
                  { icon: '🥜', label: 'Nuts', pos: 'right-0 top-1/2 -translate-y-1/2 translate-x-4' },
                  { icon: '🌾', label: 'Grains', pos: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-4' },
                  { icon: '🫙', label: 'Preserves', pos: 'left-0 top-1/2 -translate-y-1/2 -translate-x-4' },
                ].map(({ icon, label, pos }) => (
                  <div key={label} className={`absolute ${pos} bg-white rounded-xl shadow-lg px-3 py-2 text-center`}>
                    <span className="text-xl">{icon}</span>
                    <p className="text-xs font-bold text-gray-700 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="py-16 bg-gradient-to-b from-[#f0faf0] to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-[#f77c1c] font-bold text-xs tracking-[0.2em] uppercase">Our Commitment</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-[#1a431c] mt-2 mb-6">
                What We Stand For
              </h2>
              <ul className="space-y-3">
                {commitments.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <FaCheckCircle className="text-[#2d7d32] text-lg flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="order-1 lg:order-2 bg-gradient-to-br from-[#1a431c] to-[#2d7d32] rounded-3xl p-8 text-white">
              <FaSeedling className="text-5xl text-green-300 mb-4" />
              <h3 className="text-2xl font-display font-bold mb-3">Farm-to-Table Philosophy</h3>
              <p className="text-green-100 leading-relaxed text-base">
                We believe the shortest path from farm to your table is the best one. Our direct partnerships with over 50 organic farms across India ensure that what you receive is as fresh and pure as nature intended.
              </p>
              <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-display font-bold">50+</p>
                  <p className="text-green-300 text-sm">Partner Farms</p>
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">0</p>
                  <p className="text-green-300 text-sm">Artificial Additives</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose NutriPot */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[#f77c1c] font-bold text-xs tracking-[0.2em] uppercase">Why Us</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#1a431c] mt-2 mb-3">
              Why Choose NutriPot?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">We weave trust, quality, and care into every product we offer</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="group bg-white border border-gray-100 p-7 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: `${color}15` }}>
                  <Icon className="text-3xl" style={{ color }} />
                </div>
                <h3 className="text-lg font-display font-bold text-[#1a431c] mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Promise Quote */}
      <section className="py-16 bg-[#f0faf0]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <FaStar className="text-[#f77c1c]" />
            <FaLeaf className="text-[#2d7d32] text-2xl" />
            <FaStar className="text-[#f77c1c]" />
          </div>
          <blockquote className="text-2xl md:text-3xl font-serif italic text-[#1a431c] leading-relaxed mb-6">
            "When you choose NutriPot, you're not just buying food — you're choosing a healthier, more natural way of life."
          </blockquote>
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#2d7d32] to-[#f77c1c] mx-auto mb-6" />
          <div className="flex items-center gap-1 text-[#2d7d32] justify-center">
            <FaHeart className="text-sm text-[#f77c1c]" />
            <span className="text-sm font-semibold">The NutriPot Family</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-[#1a431c] to-[#2d7d32] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
            <path d="M 0 200 Q 200 100, 400 200 T 800 200" stroke="white" strokeWidth="2" fill="none" />
            <path d="M 0 220 Q 200 320, 400 220 T 800 220" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <FaLeaf className="text-5xl text-green-300 mx-auto mb-4 animate-float" />
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Start Your Natural Journey
          </h2>
          <p className="text-lg text-green-100 mb-8 max-w-xl mx-auto leading-relaxed">
            Explore our full range of natural products and take the first step towards a healthier lifestyle today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/products" className="inline-block bg-[#f77c1c] hover:bg-[#e86010] text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-2xl hover:-translate-y-1">
              Shop Now
            </Link>
            <Link to="/contact" className="inline-block bg-white/15 hover:bg-white/25 border border-white/30 text-white px-10 py-4 rounded-full font-bold text-lg transition-all hover:-translate-y-1 backdrop-blur-sm">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
