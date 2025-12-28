import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaTruck, FaUndo, FaShieldAlt, FaHeadset, FaTag, FaCrown, FaFire, FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import HeroSlider from '../components/HeroSlider';
import ProductCard from '../components/ProductCard';
import ProductReels from '../components/ProductReels';
import API from '../utils/api';

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
  }, []);

  useEffect(() => {
    fetchCategoryProducts();
  }, [selectedCategory]);

  const fetchSettings = async () => {
    try {
      const { data } = await API.get('/settings/public');
      console.log('Settings response:', data);
      // If reels_enabled setting exists, use its value, otherwise default to true
      const reelsValue = data.settings?.reels_enabled;
      console.log('Reels enabled value:', reelsValue);
      setReelsEnabled(reelsValue === undefined ? true : reelsValue);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setReelsEnabled(true); // Default to enabled if fetch fails
    }
  };

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        API.get('/categories'),
        API.get('/products?featured=true&limit=12')
      ]);
      setCategories(categoriesRes.data.categories || []);
      setFeaturedProducts(productsRes.data.products || []);

      // Fetch reels - for now we'll create sample data from products
      // You can replace this with actual API call when backend is ready
      fetchReels(productsRes.data.products);

      // Fetch initial products for "All" category
      fetchCategoryProducts();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReels = (products) => {
    // Sample reels data - using publicly available sample videos
    // Replace with actual video URLs from your backend when ready
    const sampleVideos = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
    ];

    const sampleReels = products.slice(0, 6).map((product, index) => ({
      _id: `reel-${product._id}`,
      videoUrl: sampleVideos[index % sampleVideos.length],
      product: product,
      views: Math.floor(Math.random() * 10000) + 1000
    }));

    setReels(sampleReels);
  };

  const fetchCategoryProducts = async () => {
    setCategoryLoading(true);
    try {
      const url = selectedCategory === 'all'
        ? '/products?limit=12'
        : `/products?category=${selectedCategory}&limit=12`;
      const { data } = await API.get(url);
      setCategoryProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching category products:', error);
    } finally {
      setCategoryLoading(false);
    }
  };

  // Featured carousel scroll functions
  const scrollFeaturedCarousel = (direction) => {
    if (featuredScrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = featuredScrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      featuredScrollRef.current.scrollTo({
        left: newScrollLeft,
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

  const handleFeaturedScroll = () => {
    checkFeaturedScrollPosition();
  };

  useEffect(() => {
    const container = featuredScrollRef.current;
    if (container) {
      checkFeaturedScrollPosition();
      container.addEventListener('scroll', checkFeaturedScrollPosition);
      return () => container.removeEventListener('scroll', checkFeaturedScrollPosition);
    }
  }, [featuredProducts]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Promo Banner Strip - More Elegant */}
      <div className="bg-gradient-to-r from-[#5A0F1B] via-[#7A1525] to-[#5A0F1B] text-white py-2 overflow-hidden shadow-md">
        <div className="flex animate-marquee whitespace-nowrap">
          <div className="flex items-center gap-8 md:gap-12 px-6">
            <span className="flex items-center gap-2 font-medium text-xs md:text-sm tracking-wide">
              <FaFire className="text-white/90" /> MEGA SALE: Up to 50% OFF
            </span>
            <span className="flex items-center gap-2 font-medium text-xs md:text-sm tracking-wide">
              <FaTag className="text-white/90" /> Free Shipping on Orders Above ₹999
            </span>
            <span className="flex items-center gap-2 font-medium text-xs md:text-sm tracking-wide">
              <FaCrown className="text-white/90" /> Premium Quality Guaranteed
            </span>
          </div>
          <div className="flex items-center gap-8 md:gap-12 px-6">
            <span className="flex items-center gap-2 font-medium text-xs md:text-sm tracking-wide">
              <FaFire className="text-white/90" /> MEGA SALE: Up to 50% OFF
            </span>
            <span className="flex items-center gap-2 font-medium text-xs md:text-sm tracking-wide">
              <FaTag className="text-white/90" /> Free Shipping on Orders Above ₹999
            </span>
            <span className="flex items-center gap-2 font-medium text-xs md:text-sm tracking-wide">
              <FaCrown className="text-white/90" /> Premium Quality Guaranteed
            </span>
          </div>
        </div>
      </div>

      {/* Featured Products Section - Elegant Carousel */}
      <section className="py-6 md:py-10 bg-gradient-to-b from-white via-[#5A0F1B]/5 to-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-[#5A0F1B]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#7A1525]/20 rounded-full blur-3xl"></div>

        <div className="max-w-[1600px] mx-auto px-4 md:px-6 relative">
          <div className="text-center mb-4 md:mb-6">
            <div className="inline-block mb-1">
              <div className="flex items-center gap-1.5 text-[#5A0F1B] font-serif text-xs tracking-[0.15em] uppercase">
                <FaCrown className="text-xs" />
                <span>Handpicked</span>
              </div>
            </div>
            <h2 className="text-xl md:text-3xl font-serif font-bold bg-gradient-to-r from-[#5A0F1B] via-[#7A1525] to-[#5A0F1B] bg-clip-text text-transparent mb-1">
              Featured Collection
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#5A0F1B] to-transparent mx-auto mb-1"></div>
            <p className="text-gray-600 text-xs md:text-sm max-w-2xl mx-auto">
              Trending styles and timeless classics curated just for you
            </p>
          </div>

          {loading ? (
            <div className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide pb-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[170px] sm:w-[190px] md:w-[220px] animate-pulse">
                  <div className="bg-gradient-to-br from-gray-200 to-gray-100 aspect-[3/4] rounded-2xl mb-3"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative group">
              {/* Left Scroll Button - More Elegant */}
              {showFeaturedLeftArrow && (
                <button
                  onClick={() => scrollFeaturedCarousel('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white hover:bg-gradient-to-r hover:from-[#5A0F1B] hover:to-[#7A1525] shadow-xl rounded-full flex items-center justify-center text-gray-800 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 border border-gray-100"
                  aria-label="Scroll left"
                >
                  <FaChevronLeft className="text-lg" />
                </button>
              )}

              {/* Right Scroll Button - More Elegant */}
              {showFeaturedRightArrow && (
                <button
                  onClick={() => scrollFeaturedCarousel('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white hover:bg-gradient-to-r hover:from-[#5A0F1B] hover:to-[#7A1525] shadow-xl rounded-full flex items-center justify-center text-gray-800 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 border border-gray-100"
                  aria-label="Scroll right"
                >
                  <FaChevronRight className="text-lg" />
                </button>
              )}

              <div
                ref={featuredScrollRef}
                className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
                onScroll={handleFeaturedScroll}
              >
                {featuredProducts.map(product => (
                  <div key={product._id} className="flex-shrink-0 w-[170px] sm:w-[190px] md:w-[220px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Product Reels Section - Conditionally rendered */}
      {reelsEnabled && (
        <div className="bg-gradient-to-b from-gray-50 to-white">
          <ProductReels reels={reels} />
        </div>
      )}

      {/* Shop by Category Section - Elegant & Modern */}
      <section className="py-6 md:py-10 bg-white relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#5A0F1B]/10 via-transparent to-[#7A1525]/10 pointer-events-none"></div>

        <div className="max-w-[1600px] mx-auto px-4 md:px-6 relative">
          {/* Section Header - More Artistic */}
          <div className="text-center mb-4 md:mb-6">
            <div className="inline-block mb-1">
              <span className="text-[#5A0F1B] font-serif text-xs tracking-[0.15em] uppercase">Collections</span>
            </div>
            <h2 className="text-xl md:text-3xl font-serif font-bold bg-gradient-to-r from-gray-900 via-[#5A0F1B] to-gray-900 bg-clip-text text-transparent mb-1">
              Shop by Category
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#5A0F1B] to-transparent mx-auto mb-1"></div>
            <p className="text-gray-600 text-xs md:text-sm max-w-2xl mx-auto">
              Discover our exquisite saree collections
            </p>
          </div>

          {/* Category Filter Menu - Modern Pills */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-5 md:px-7 py-2 md:py-2.5 rounded-full font-medium text-sm md:text-base transition-all duration-300 ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] text-white shadow-lg shadow-[#5A0F1B]/30 scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-[#5A0F1B]'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className={`px-5 md:px-7 py-2 md:py-2.5 rounded-full font-medium text-sm md:text-base transition-all duration-300 ${
                    selectedCategory === category._id
                      ? 'bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] text-white shadow-lg shadow-[#5A0F1B]/30 scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-[#5A0F1B]'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {categoryLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gradient-to-br from-gray-200 to-gray-100 aspect-[3/4] rounded-xl mb-3"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                {categoryProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* No Products Message */}
              {categoryProducts.length === 0 && !categoryLoading && (
                <div className="text-center py-16">
                  <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-base md:text-lg font-medium">No products found in this category</p>
                  <p className="text-gray-400 text-sm mt-2">Try selecting a different category</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Features Section - Modern & Elegant */}
      <section className="py-6 md:py-8 bg-gradient-to-r from-gray-50 via-white to-gray-50">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                icon: <FaTruck className="text-2xl md:text-3xl" />,
                title: 'Free Shipping',
                desc: 'On orders above ₹999',
                gradient: 'from-[#5A0F1B] to-[#7A1525]'
              },
              {
                icon: <FaUndo className="text-2xl md:text-3xl" />,
                title: 'Easy Returns',
                desc: '7 days return policy',
                gradient: 'from-[#6A1525] to-[#8A1F35]'
              },
              {
                icon: <FaShieldAlt className="text-2xl md:text-3xl" />,
                title: 'Secure Payment',
                desc: '100% secure checkout',
                gradient: 'from-[#7A1525] to-[#5A0F1B]'
              },
              {
                icon: <FaHeadset className="text-2xl md:text-3xl" />,
                title: '24/7 Support',
                desc: 'Dedicated customer care',
                gradient: 'from-[#8A1F35] to-[#6A1525]'
              }
            ].map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-3 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-500">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
