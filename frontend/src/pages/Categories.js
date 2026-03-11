import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaSeedling, FaChevronRight, FaSearch } from 'react-icons/fa';
import API from '../utils/api';

const categoryIcons = ['🌿', '🥜', '🌾', '🫙', '🌶️', '🍯', '🫚', '🌱', '🥗', '🍃', '🌻', '🥦'];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/categories');
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filtered = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#faf9f7]">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#1a431c] via-[#2d7d32] to-[#1e6623] text-white py-14 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 800 250" preserveAspectRatio="xMidYMid slice">
            <path d="M 0 125 Q 200 25, 400 125 T 800 125" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
            <FaLeaf className="text-[#66BB6A]" /> Browse by Category
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">All Categories</h1>
          <p className="text-green-100 text-lg max-w-xl mx-auto mb-8">
            Explore our full range of natural food categories — from organic grains to wholesome nuts &amp; spices
          </p>

          {/* Search within categories */}
          <div className="max-w-sm mx-auto relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#f77c1c] shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl p-6 shadow-md">
                <div className="w-16 h-16 bg-green-100 rounded-2xl mx-auto mb-4" />
                <div className="h-4 bg-green-100 rounded-full w-3/4 mx-auto mb-2" />
                <div className="h-3 bg-green-50 rounded-full w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSeedling className="text-4xl text-[#2d7d32]" />
            </div>
            <p className="text-gray-600 font-semibold text-lg">
              {searchQuery ? `No categories found for "${searchQuery}"` : 'No categories available yet'}
            </p>
            <p className="text-gray-400 text-sm mt-2">Check back soon for more products</p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-6">{filtered.length} categories found</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {filtered.map((category, index) => (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-transparent hover:border-green-200"
                >
                  {/* Category Image / Icon */}
                  <div className="relative h-32 bg-gradient-to-br from-[#f0faf0] to-[#e8f5e9] flex items-center justify-center overflow-hidden">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.parentElement.innerHTML = `<span class="text-5xl">${categoryIcons[index % categoryIcons.length]}</span>`;
                        }}
                      />
                    ) : (
                      <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                        {categoryIcons[index % categoryIcons.length]}
                      </span>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-[#2d7d32]/0 group-hover:bg-[#2d7d32]/10 transition-all duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-display font-bold text-gray-800 group-hover:text-[#2d7d32] transition-colors text-sm leading-snug mb-1">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-gray-400 text-xs line-clamp-2 mb-2">{category.description}</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-[#2d7d32] text-xs font-semibold group-hover:gap-2 transition-all">
                      Shop Now <FaChevronRight className="text-[10px]" />
                    </span>
                  </div>
                </Link>
              ))}

              {/* Shop All card */}
              <Link
                to="/products"
                className="group bg-gradient-to-br from-[#2d7d32] to-[#1a431c] rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col items-center justify-center p-6 text-white text-center min-h-[196px]"
              >
                <FaLeaf className="text-4xl text-green-300 mb-3 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-display font-bold text-base mb-1">All Products</h3>
                <p className="text-green-200 text-xs mb-3">Browse everything</p>
                <span className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all">
                  View All <FaChevronRight className="text-[10px]" />
                </span>
              </Link>
            </div>
          </>
        )}

        {/* Nature fact banner */}
        <div className="mt-14 bg-gradient-to-r from-[#fff8f0] to-[#f0faf0] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 border border-green-100">
          <div className="text-5xl flex-shrink-0">🌿</div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-display font-bold text-[#1a431c] text-xl mb-1">Can't Find What You're Looking For?</h3>
            <p className="text-gray-500 text-sm">Contact our wellness team for personalised product recommendations based on your nutritional needs.</p>
          </div>
          <Link to="/contact" className="flex-shrink-0 btn btn-primary px-6 py-3 text-sm">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Categories;
