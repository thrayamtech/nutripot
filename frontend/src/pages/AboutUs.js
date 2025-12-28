import React from 'react';
import { FaAward, FaShippingFast, FaLock, FaPhone } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white py-20">
        <div className="max-w-[1600px] mx-auto px-3 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">About Us</h1>
          <p className="text-xl text-amber-100 max-w-3xl mx-auto">
            Weaving dreams and traditions together since our inception
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-serif font-bold text-gray-800 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Welcome to <span className="font-semibold text-amber-700">Saree Elegance</span>,
                  where tradition meets elegance. We are passionate about bringing you the finest
                  collection of sarees from across India, each piece carefully curated to celebrate
                  the rich heritage and craftsmanship of Indian textiles.
                </p>
                <p>
                  Our journey began with a simple vision: to make authentic, high-quality sarees
                  accessible to women everywhere. From the intricate weaves of Banarasi silk to
                  the delicate beauty of Kanjivaram, from the breezy comfort of cotton to the
                  glamorous sheen of designer sarees – we bring you the best of Indian fashion.
                </p>
                <p>
                  Every saree in our collection tells a story – of skilled artisans, timeless
                  traditions, and the enduring beauty of Indian culture. We work directly with
                  weavers and craftspeople to ensure fair trade practices and to preserve these
                  age-old crafts for future generations.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800"
                alt="Our Story"
                className="rounded-lg shadow-2xl w-full h-[500px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-amber-600 text-white p-8 rounded-lg shadow-xl max-w-xs">
                <p className="text-3xl font-bold mb-2">10,000+</p>
                <p className="text-amber-100">Happy Customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-[1400px] mx-auto px-3">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-gray-800 mb-4">
              Why Choose Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We are committed to providing the best shopping experience with authentic products and exceptional service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaAward className="text-4xl text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">100% Authentic</h3>
              <p className="text-gray-600">
                Every saree is sourced directly from trusted artisans and weavers, ensuring authenticity and quality.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShippingFast className="text-4xl text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Fast Delivery</h3>
              <p className="text-gray-600">
                Swift and secure shipping across India. Free delivery on orders above ₹999.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaLock className="text-4xl text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Secure Payment</h3>
              <p className="text-gray-600">
                Shop with confidence using our secure payment gateway. Your data is always protected.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaPhone className="text-4xl text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">24/7 Support</h3>
              <p className="text-gray-600">
                Our dedicated customer service team is always ready to assist you with any queries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800"
                alt="Our Mission"
                className="rounded-lg shadow-2xl w-full h-[400px] object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-serif font-bold text-gray-800 mb-6">
                Our Mission
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Our mission is to be the leading destination for authentic Indian sarees,
                  celebrating the diversity and richness of Indian textile heritage. We strive to:
                </p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start">
                    <span className="text-amber-700 font-bold mr-2">•</span>
                    <span>Preserve traditional weaving techniques by supporting local artisans</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-700 font-bold mr-2">•</span>
                    <span>Provide exceptional quality products at fair prices</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-700 font-bold mr-2">•</span>
                    <span>Deliver an outstanding customer experience from browsing to delivery</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-700 font-bold mr-2">•</span>
                    <span>Promote sustainable and ethical fashion practices</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-700 font-bold mr-2">•</span>
                    <span>Make beautiful sarees accessible to women across the globe</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gradient-to-b from-white to-amber-50">
        <div className="max-w-[1400px] mx-auto px-3">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-gray-800 mb-4">
              Meet Our Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Passionate individuals dedicated to bringing you the finest sarees
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400"
                alt="Team Member"
                className="w-full h-80 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Priya Sharma</h3>
                <p className="text-amber-700 font-medium mb-3">Founder & CEO</p>
                <p className="text-gray-600 text-sm">
                  Passionate about preserving traditional Indian textiles and bringing them to modern wardrobes.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400"
                alt="Team Member"
                className="w-full h-80 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Anjali Reddy</h3>
                <p className="text-amber-700 font-medium mb-3">Head of Curation</p>
                <p className="text-gray-600 text-sm">
                  Expert in identifying authentic handloom sarees and traditional weaving techniques.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400"
                alt="Team Member"
                className="w-full h-80 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Kavya Iyer</h3>
                <p className="text-amber-700 font-medium mb-3">Customer Success Lead</p>
                <p className="text-gray-600 text-sm">
                  Dedicated to ensuring every customer has a delightful shopping experience with us.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-amber-700 to-amber-900 text-white">
        <div className="max-w-[1400px] mx-auto px-3 text-center">
          <h2 className="text-4xl font-serif font-bold mb-6">
            Ready to Explore Our Collection?
          </h2>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            Discover the perfect saree for every occasion from our exquisite collection
          </p>
          <a
            href="/products"
            className="inline-block bg-white text-amber-800 px-8 py-4 rounded-lg font-bold text-lg hover:bg-amber-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            Shop Now
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
