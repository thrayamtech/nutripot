import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaUndo, FaShieldAlt, FaHeadset, FaTag, FaLeaf, FaFire, FaChevronLeft, FaChevronRight, FaSeedling, FaAward, FaStar } from 'react-icons/fa';
import HeroSlider from '../components/HeroSlider';
import ProductCard from '../components/ProductCard';
import ProductReels from '../components/ProductReels';
import API from '../utils/api';
import { setStructuredData, generateCollectionSchema } from '../utils/seo';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [reels, setReels] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [showFeaturedLeftArrow, setShowFeaturedLeftArrow] = useState(false);
  const [showFeaturedRightArrow, setShowFeaturedRightArrow] = useState(true);
  const [reelsEnabled, setReelsEnabled] = useState(true);
  const featuredScrollRef = useRef(null);

  useEffect(() => {
    fetchData();
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchCategoryProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const fetchSettings = async () => {
    try {
      const { data } = await API.get('/settings/public');
      const reelsValue = data.settings?.reels_enabled;
      setReelsEnabled(reelsValue === undefined ? true : reelsValue);
    } catch (error) {
      setReelsEnabled(true);
    }
  };

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes, reelsRes] = await Promise.all([
        API.get('/categories'),
        API.get('/products?featured=true&limit=12'),
        API.get('/reels/active')
      ]);
      setCategories(categoriesRes.data.categories || []);
      setFeaturedProducts(productsRes.data.products || []);
      setReels(reelsRes.data.reels || []);

      if (productsRes.data.products?.length > 0) {
        setStructuredData(
          generateCollectionSchema(
            { name: 'Featured NutriPot Products', description: 'Our handpicked selection of premium natural food products' },
            productsRes.data.products
          ),
          'homepage-collection-data'
        );
      }
      fetchCategoryProducts();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryProducts = async () => {
    setCategoryLoading(true);
    try {
      const url = selectedCategory === 'all' ? '/products?limit=12' : `/products?category=${selectedCategory}&limit=12`;
      const { data } = await API.get(url);
      setCategoryProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching category products:', error);
    } finally {
      setCategoryLoading(false);
    }
  };

  const scrollFeaturedCarousel = (direction) => {
    if (featuredScrollRef.current) {
      featuredScrollRef.current.scrollTo({
        left: featuredScrollRef.current.scrollLeft + (direction === 'left' ? -300 : 300),
        behavior: 'smooth'
      });
    }
  };

  const checkFeaturedScrollPosition = () => {
    if (featuredScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = featuredScrollRef.current;
      setShowFeaturedLeftArrow(scrollLeft > 0);
      setShowFeaturedRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = featuredScrollRef.current;
    if (container) {
      checkFeaturedScrollPosition();
      container.addEventListener('scroll', checkFeaturedScrollPosition);
      return () => container.removeEventListener('scroll', checkFeaturedScrollPosition);
    }
  }, [featuredProducts]);

  const naturalBenefits = [
    { icon: <FaLeaf />, text: '100% Natural', color: '#2d7d32' },
    { icon: <FaSeedling />, text: 'Organic Sourced', color: '#388E3C' },
    { icon: <FaAward />, text: 'Quality Certified', color: '#f77c1c' },
    { icon: <FaStar />, text: 'Customer Loved', color: '#f77c1c' },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Promo Marquee */}
      <div className="bg-gradient-to-r from-[#1a431c] via-[#2d7d32] to-[#1a431c] text-white py-2.5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-10 md:gap-16 px-8">
              <span className="flex items-center gap-2 font-semibold text-xs md:text-sm tracking-wide">
                <FaFire className="text-[#f77c1c]" /> SPECIAL OFFER: Up to 40% OFF on Select Products
              </span>
              <span className="flex items-center gap-2 font-semibold text-xs md:text-sm tracking-wide">
                <FaTag className="text-[#f77c1c]" /> Free Shipping on Orders Above ₹999
              </span>
              <span className="flex items-center gap-2 font-semibold text-xs md:text-sm tracking-wide">
                <FaLeaf className="text-[#66BB6A]" /> 100% Natural &amp; No Preservatives
              </span>
              <span className="flex items-center gap-2 font-semibold text-xs md:text-sm tracking-wide">
                <FaSeedling className="text-[#66BB6A]" /> Organic Certified Ingredients
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Natural Benefits Strip */}
      <section className="bg-white border-b border-green-100">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {naturalBenefits.map(({ icon, text, color }, i) => (
              <div key={i} className="flex items-center gap-3 justify-center">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>
                  {icon}
                </div>
                <span className="font-bold text-gray-700 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Carousel */}
      <section className="py-10 md:py-14 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0faf0]/60 to-white pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2d7d32]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#f77c1c]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1600px] mx-auto px-4 md:px-6 relative">
          {/* Section Header */}
          <div className="text-center mb-6 md:mb-8">
            <span className="section-subtitle">Handpicked for You</span>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-[#1a431c] mt-1 mb-2">
              Featured Products
            </h2>
            <div className="leaf-divider mb-2" />
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Our most loved natural products — tried, tested, and trusted by thousands
            </p>
          </div>

          {loading ? (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[180px] sm:w-[200px] md:w-[220px] animate-pulse">
                  <div className="bg-gradient-to-br from-green-100 to-green-50 aspect-[3/4] rounded-2xl mb-3" />
                  <div className="bg-green-100 h-4 rounded-full w-3/4 mb-2" />
                  <div className="bg-green-100 h-4 rounded-full w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative group">
              {showFeaturedLeftArrow && (
                <button
                  onClick={() => scrollFeaturedCarousel('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white hover:bg-[#2d7d32] shadow-xl rounded-full flex items-center justify-center text-gray-700 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 border border-green-100"
                >
                  <FaChevronLeft />
                </button>
              )}
              {showFeaturedRightArrow && (
                <button
                  onClick={() => scrollFeaturedCarousel('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white hover:bg-[#2d7d32] shadow-xl rounded-full flex items-center justify-center text-gray-700 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 border border-green-100"
                >
                  <FaChevronRight />
                </button>
              )}
              <div
                ref={featuredScrollRef}
                className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
                onScroll={checkFeaturedScrollPosition}
              >
                {featuredProducts.map(product => (
                  <div key={product._id} className="flex-shrink-0 w-[170px] sm:w-[190px] md:w-[220px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/products?featured=true" className="inline-flex items-center gap-2 btn btn-primary">
              View All Featured
              <FaChevronRight className="text-xs" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why NutriPot - Value Props */}
      <section className="py-10 bg-gradient-to-br from-[#1a431c] to-[#2d7d32] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 border-2 border-white rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 border border-white rounded-full translate-y-24 -translate-x-24" />
        </div>
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="text-center mb-8">
            <span className="text-[#f77c1c] font-bold text-xs tracking-[0.2em] uppercase">Why Choose Us</span>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mt-1">The NutriPot Promise</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <FaTruck className="text-2xl" />, title: 'Free Shipping', desc: 'On orders above ₹999' },
              { icon: <FaLeaf className="text-2xl" />, title: '100% Natural', desc: 'No artificial additives' },
              { icon: <FaShieldAlt className="text-2xl" />, title: 'Secure Payment', desc: '100% safe checkout' },
              { icon: <FaHeadset className="text-2xl" />, title: '24/7 Support', desc: 'Always here for you' },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 bg-white/15 group-hover:bg-[#f77c1c] rounded-2xl flex items-center justify-center text-white mx-auto mb-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                  {item.icon}
                </div>
                <h3 className="font-bold text-white text-sm md:text-base mb-1">{item.title}</h3>
                <p className="text-green-200 text-xs md:text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Reels */}
      {reelsEnabled && (
        <div className="bg-gradient-to-b from-gray-50 to-white">
          <ProductReels reels={reels} />
        </div>
      )}

      {/* Shop by Category */}
      <section className="py-10 md:py-14 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-nature-pattern pointer-events-none" />

        <div className="max-w-[1600px] mx-auto px-4 md:px-6 relative">
          {/* Section Header */}
          <div className="text-center mb-6 md:mb-8">
            <span className="section-subtitle">Browse & Discover</span>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-[#1a431c] mt-1 mb-2">
              Shop by Category
            </h2>
            <div className="leaf-divider mb-2" />
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Explore our curated range of natural food categories
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-5 md:px-6 py-2 md:py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                  selectedCategory === 'all'
                    ? 'bg-[#2d7d32] text-white shadow-lg shadow-[#2d7d32]/30 scale-105'
                    : 'bg-white text-gray-600 hover:bg-green-50 border border-gray-200 hover:border-[#2d7d32]'
                }`}
              >
                🌿 All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat._id)}
                  className={`px-5 md:px-6 py-2 md:py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                    selectedCategory === cat._id
                      ? 'bg-[#2d7d32] text-white shadow-lg shadow-[#2d7d32]/30 scale-105'
                      : 'bg-white text-gray-600 hover:bg-green-50 border border-gray-200 hover:border-[#2d7d32]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {categoryLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gradient-to-br from-green-100 to-green-50 aspect-[3/4] rounded-2xl mb-3" />
                  <div className="bg-green-100 h-4 rounded-full w-3/4 mb-2" />
                  <div className="bg-green-100 h-4 rounded-full w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {categoryProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {categoryProducts.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaSeedling className="text-4xl text-[#2d7d32]" />
                  </div>
                  <p className="text-gray-600 text-base font-semibold">No products in this category yet</p>
                  <p className="text-gray-400 text-sm mt-1">Try selecting a different category</p>
                </div>
              )}

              {categoryProducts.length > 0 && (
                <div className="text-center mt-10">
                  <Link to="/products" className="inline-flex items-center gap-2 btn btn-outline">
                    View All Products
                    <FaChevronRight className="text-xs" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Newsletter / CTA Banner */}
      <section className="py-12 bg-gradient-to-r from-[#fff8f0] via-white to-[#f0faf0]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-[#f77c1c]/10 text-[#e86010] text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
            <FaLeaf /> Stay Natural
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-[#1a431c] mb-3">
            Get Healthy Recipes &amp; Offers
          </h2>
          <p className="text-gray-500 text-sm mb-6 max-w-lg mx-auto">
            Subscribe to our newsletter for exclusive deals, wellness tips, and new product alerts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-5 py-3 border-2 border-green-200 rounded-full text-sm focus:outline-none focus:border-[#2d7d32] bg-white"
            />
            <button className="btn btn-primary px-8 py-3 text-sm">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-8 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: <FaTruck className="text-2xl md:text-3xl" />, title: 'Free Shipping', desc: 'Orders above ₹999', gradient: 'from-[#2d7d32] to-[#388E3C]' },
              { icon: <FaUndo className="text-2xl md:text-3xl" />, title: 'Easy Returns', desc: '7-day return policy', gradient: 'from-[#1a431c] to-[#2d7d32]' },
              { icon: <FaShieldAlt className="text-2xl md:text-3xl" />, title: 'Secure Payment', desc: '100% safe checkout', gradient: 'from-[#f77c1c] to-[#e86010]' },
              { icon: <FaHeadset className="text-2xl md:text-3xl" />, title: '24/7 Support', desc: 'Dedicated care team', gradient: 'from-[#e86010] to-[#c14c0d]' },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-3 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-sm md:text-base mb-0.5">{feature.title}</h3>
                <p className="text-xs md:text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
