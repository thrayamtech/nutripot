import React from 'react';
import { FaAward, FaShippingFast, FaLock, FaPhone, FaCrown, FaStar, FaHeart } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0c1a5c] via-[#1e3a8a] to-[#0c1a5c] text-white py-20">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <FaCrown className="text-4xl text-[#93c5fd] mr-3" />
            <h1 className="text-5xl md:text-6xl font-serif font-bold">JJ Trendz Official</h1>
          </div>
          <p className="text-2xl text-blue-200 font-light italic mb-4">
            Fashion that defines you
          </p>
          <p className="text-lg text-blue-300 max-w-3xl mx-auto">
            Where every stitch tells a story of style, elegance, and craftsmanship
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-serif font-bold text-[#1e3a8a] mb-6">
                Our Story
              </h2>
              <div className="space-y-5 text-gray-700 text-lg leading-relaxed">
                <p>
                  At <span className="font-bold text-[#1e3a8a]">JJ Trendz Official</span>,
                  we believe that fashion is more than just clothing – it's an expression of who you are.
                  Every design we create carries the essence of craftsmanship, the spirit of modern trends,
                  and the promise of timeless elegance.
                </p>
                <p>
                  Founded with a passion for boutique fashion, we specialize in handcrafted and designer
                  wear that blends traditional artistry with contemporary style. From kurti sets and
                  co-ords to party wear and bridal collections, we curate pieces for every occasion.
                </p>
                <p>
                  When you wear <span className="italic font-medium">JJ Trendz</span>, you're not just
                  wearing fashion – you're making a statement. We are committed to bringing you pieces
                  that reflect your personality and elevate your confidence.
                </p>
              </div>
            </div>

            {/* Decorative Art */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full h-96">
                <svg viewBox="0 0 400 400" className="w-full h-full opacity-80">
                  {/* Crown outline */}
                  <path
                    d="M 120 280 L 100 160 L 160 220 L 200 120 L 240 220 L 300 160 L 280 280 Z"
                    stroke="#1e3a8a"
                    strokeWidth="2.5"
                    fill="none"
                    opacity="0.5"
                  />
                  {/* Flowing lines */}
                  <path d="M 50 200 Q 100 100, 200 150 T 350 200" stroke="#1e3a8a" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                  <path d="M 50 220 Q 120 280, 200 240 T 350 220" stroke="#2563eb" strokeWidth="2" fill="none" />
                  <path d="M 50 180 Q 80 120, 200 160 T 350 180" stroke="#1d4ed8" strokeWidth="1.5" fill="none" opacity="0.6" />

                  {/* Decorative dots */}
                  <circle cx="100" cy="150" r="4" fill="#1e3a8a" opacity="0.7" />
                  <circle cx="200" cy="180" r="6" fill="#2563eb" />
                  <circle cx="300" cy="200" r="4" fill="#1e3a8a" opacity="0.7" />
                  <circle cx="150" cy="240" r="3" fill="#3b82f6" opacity="0.6" />
                  <circle cx="250" cy="220" r="4" fill="#1d4ed8" />

                  {/* Outer rings */}
                  <circle cx="200" cy="200" r="80" stroke="#1e3a8a" strokeWidth="1" fill="none" opacity="0.2" />
                  <circle cx="200" cy="200" r="60" stroke="#2563eb" strokeWidth="1" fill="none" opacity="0.2" />
                  <circle cx="200" cy="200" r="40" stroke="#3b82f6" strokeWidth="1" fill="none" opacity="0.3" />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <FaCrown className="text-6xl text-[#1e3a8a] opacity-10 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Philosophy Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Decorative Art */}
            <div className="relative flex items-center justify-center order-2 lg:order-1">
              <div className="relative w-full h-96">
                <svg viewBox="0 0 400 400" className="w-full h-full opacity-70">
                  <line x1="50" y1="50" x2="50" y2="350" stroke="#1e3a8a" strokeWidth="1" opacity="0.4" />
                  <line x1="100" y1="50" x2="100" y2="350" stroke="#1e3a8a" strokeWidth="1" opacity="0.4" />
                  <line x1="150" y1="50" x2="150" y2="350" stroke="#2563eb" strokeWidth="1.5" opacity="0.5" />
                  <line x1="200" y1="50" x2="200" y2="350" stroke="#1e3a8a" strokeWidth="2" opacity="0.6" />
                  <line x1="250" y1="50" x2="250" y2="350" stroke="#2563eb" strokeWidth="1.5" opacity="0.5" />
                  <line x1="300" y1="50" x2="300" y2="350" stroke="#1e3a8a" strokeWidth="1" opacity="0.4" />
                  <line x1="350" y1="50" x2="350" y2="350" stroke="#1e3a8a" strokeWidth="1" opacity="0.4" />
                  <path d="M 50 100 Q 200 120, 350 100" stroke="#2563eb" strokeWidth="2" fill="none" opacity="0.5" />
                  <path d="M 50 150 Q 200 130, 350 150" stroke="#1e3a8a" strokeWidth="2" fill="none" opacity="0.6" />
                  <path d="M 50 200 Q 200 220, 350 200" stroke="#2563eb" strokeWidth="2" fill="none" opacity="0.5" />
                  <path d="M 50 250 Q 200 230, 350 250" stroke="#1e3a8a" strokeWidth="2" fill="none" opacity="0.6" />
                  <path d="M 50 300 Q 200 320, 350 300" stroke="#2563eb" strokeWidth="2" fill="none" opacity="0.5" />
                  <circle cx="200" cy="200" r="40" stroke="#1e3a8a" strokeWidth="2" fill="none" />
                  <circle cx="200" cy="200" r="30" stroke="#2563eb" strokeWidth="1" fill="none" opacity="0.6" />
                  <text x="200" y="210" textAnchor="middle" fill="#1e3a8a" fontSize="20" fontWeight="bold" fontFamily="serif">JJ</text>
                </svg>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-serif font-bold text-[#1e3a8a] mb-6">
                Our Philosophy
              </h2>
              <div className="space-y-5 text-gray-700 text-lg leading-relaxed">
                <p>
                  Every person has a unique style – a reflection of their dreams, personality, and journey.
                  At JJ Trendz Official, we celebrate individuality by offering fashion that resonates
                  with your story.
                </p>
                <div className="space-y-4 ml-4 border-l-4 border-[#1e3a8a] pl-6">
                  <div>
                    <h3 className="font-bold text-[#1e3a8a] mb-2">Quality First</h3>
                    <p className="text-gray-600">
                      We source premium fabrics and work with skilled artisans to ensure every piece meets our exacting standards.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1e3a8a] mb-2">Trendsetting Design</h3>
                    <p className="text-gray-600">
                      Our collections blend traditional craftsmanship with modern silhouettes, keeping you ahead of the fashion curve.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1e3a8a] mb-2">Your Confidence</h3>
                    <p className="text-gray-600">
                      Whether it's casual wear or special occasions, we believe the right outfit empowers you to shine.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-[#1e3a8a] mb-4">
              Why Choose JJ Trendz
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We weave trust, quality, and care into every creation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: FaAward, title: 'Premium Quality', desc: 'Every piece is crafted with premium materials, ensuring style and durability that lasts.' },
              { icon: FaShippingFast, title: 'Swift Delivery', desc: 'Your order reaches you safely and quickly. Free delivery on orders above ₹999.' },
              { icon: FaLock, title: 'Secure Shopping', desc: 'Shop with confidence using our secure payment gateway. Your trust is our priority.' },
              { icon: FaPhone, title: 'Dedicated Support', desc: 'Our team is here to guide you, ensuring every shopping experience is seamless.' },
            ].map((item, i) => (
              <div key={i} className="bg-gradient-to-b from-blue-50 to-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className="bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <item.icon className="text-4xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#1e3a8a] mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The JJ Trendz Promise */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <div className="relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#1e3a8a] to-transparent"></div>
            <div className="pt-8">
              <div className="flex items-center justify-center mb-4 gap-2">
                <FaStar className="text-[#2563eb]" />
                <FaCrown className="text-[#1e3a8a] text-2xl" />
                <FaStar className="text-[#2563eb]" />
              </div>
              <h2 className="text-4xl font-serif font-bold text-[#1e3a8a] mb-8">
                The JJ Trendz Promise
              </h2>
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p className="text-xl italic text-[#1e3a8a] font-serif">
                  "When you choose JJ Trendz Official, you're not just buying fashion –
                  you're choosing a lifestyle."
                </p>
                <p>
                  We promise to bring you designs that are as unique as you are. Each piece in our
                  collection is carefully curated to ensure it meets our standards of quality,
                  style, and value.
                </p>
                <p>
                  From the finest fabrics to the last finishing stitch, from our boutique to your wardrobe,
                  every step honors the craft of fashion and celebrates you – the person who brings
                  these designs to life.
                </p>
              </div>
            </div>
            <div className="mt-8 w-24 h-1 bg-gradient-to-r from-transparent via-[#1e3a8a] to-transparent mx-auto"></div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0c1a5c] via-[#1e3a8a] to-[#0c1a5c] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 800 400">
            <path d="M 0 200 Q 200 100, 400 200 T 800 200" stroke="white" strokeWidth="2" fill="none" />
            <path d="M 0 220 Q 200 320, 400 220 T 800 220" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 text-center relative z-10">
          <FaCrown className="text-5xl text-[#93c5fd] mx-auto mb-4" />
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Discover Your Style With Us
          </h2>
          <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Explore our curated collection and find the perfect outfit for every occasion
          </p>
          <a
            href="/products"
            className="inline-block bg-white text-[#1e3a8a] px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl transform hover:-translate-y-1"
          >
            Shop Now
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
