import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaLeaf } from 'react-icons/fa';
import API from '../utils/api';
import { getSliderImage } from '../utils/imageHelper';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultSlides = [
    {
      _id: '1',
      title: 'Pure Natural Goodness',
      subtitle: 'Farm to Table',
      description: 'Discover premium natural food products sourced directly from nature\'s finest origins.',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&q=80',
      cta: 'Shop Now',
      link: '/products'
    },
    {
      _id: '2',
      title: 'Wholesome & Organic',
      subtitle: 'Live Healthier Every Day',
      description: 'Handpicked organic ingredients for a cleaner, healthier lifestyle you deserve.',
      image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1400&q=80',
      cta: 'Explore Collection',
      link: '/products?featured=true'
    },
    {
      _id: '3',
      title: 'Nature\'s Best Selections',
      subtitle: 'No Preservatives, Just Purity',
      description: 'Every product is carefully tested and certified for quality and authenticity.',
      image: 'https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=1400&q=80',
      cta: 'Shop the Range',
      link: '/products?sale=true'
    }
  ];

  const fetchSliders = useCallback(async () => {
    try {
      const { data } = await API.get('/sliders/active');
      if (data.sliders && data.sliders.length > 0) {
        setSlides(data.sliders);
      } else {
        setSlides(defaultSlides);
      }
    } catch (error) {
      console.error('Error fetching sliders:', error);
      setSlides(defaultSlides);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchSliders();
  }, [fetchSliders]);

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5500);
      return () => clearInterval(timer);
    }
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  if (loading) {
    return (
      <div className="relative h-[480px] md:h-[580px] overflow-hidden bg-gradient-to-br from-[#f0faf0] via-[#e8f5e9] to-[#faf9f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2d7d32]/20 border-t-[#2d7d32] rounded-full animate-spin mx-auto mb-4"></div>
          <FaLeaf className="text-[#2d7d32] text-2xl mx-auto animate-bounce" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[480px] md:h-[580px] overflow-hidden">
      {slides.map((slide, index) => {
        const imageUrl = getSliderImage(slide);
        return (
          <div
            key={slide._id || slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background image */}
            <div
              className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[5000ms]"
              style={{
                backgroundImage: `url(${imageUrl})`,
                filter: 'brightness(0.55)',
                transform: index === currentSlide ? 'scale(1)' : 'scale(1.05)',
              }}
            />

            {/* Gradient overlay — left-heavy for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d2611]/80 via-[#1a431c]/50 to-transparent" />

            {/* Decorative leaf elements */}
            <div className="absolute top-10 right-10 w-32 h-32 border-2 border-white/10 rounded-full hidden md:block" />
            <div className="absolute top-16 right-16 w-20 h-20 border border-white/10 rounded-full hidden md:block" />
            <div className="absolute bottom-16 right-20 opacity-20 hidden md:block">
              <FaLeaf className="text-white text-6xl rotate-45" />
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center z-10">
              <div className="container mx-auto px-6 md:px-12">
                <div className="max-w-2xl text-white">
                  {/* Subtitle label */}
                  <div className={`inline-flex items-center gap-2 bg-[#f77c1c]/90 backdrop-blur-sm text-white text-xs font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-4 transition-all duration-700 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <FaLeaf className="text-white text-xs" />
                    {slide.subtitle}
                  </div>

                  {/* Main title */}
                  <h1 className={`text-4xl md:text-6xl font-display font-bold leading-tight mb-4 transition-all duration-700 delay-100 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {slide.title}
                  </h1>

                  {/* Description */}
                  <p className={`text-lg md:text-xl text-gray-200 mb-8 leading-relaxed max-w-xl transition-all duration-700 delay-200 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {slide.description}
                  </p>

                  {/* CTA Buttons */}
                  <div className={`flex flex-wrap gap-4 transition-all duration-700 delay-300 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <Link
                      to={slide.link || '/products'}
                      className="inline-flex items-center gap-2 bg-[#2d7d32] hover:bg-[#1e6623] text-white font-bold py-3.5 px-8 rounded-full transition-all duration-300 shadow-xl hover:shadow-green-900/50 hover:-translate-y-0.5"
                    >
                      {slide.cta || 'Shop Now'}
                      <FaChevronRight className="text-xs" />
                    </Link>
                    <Link
                      to="/categories"
                      className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white font-semibold py-3.5 px-8 rounded-full border border-white/30 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      Browse Categories
                    </Link>
                  </div>

                  {/* Trust badges */}
                  <div className={`flex flex-wrap gap-4 mt-8 transition-all duration-700 delay-400 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                    {['100% Natural', 'No Preservatives', 'Farm Fresh'].map((badge) => (
                      <span key={badge} className="flex items-center gap-1.5 text-xs text-white/80 font-medium">
                        <FaLeaf className="text-[#66BB6A] text-xs" />
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/15 hover:bg-[#2d7d32] backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-300 border border-white/20 hover:border-[#2d7d32] hover:scale-110"
        aria-label="Previous slide"
      >
        <FaChevronLeft className="text-sm" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/15 hover:bg-[#2d7d32] backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-300 border border-white/20 hover:border-[#2d7d32] hover:scale-110"
        aria-label="Next slide"
      >
        <FaChevronRight className="text-sm" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'bg-[#f77c1c] w-8 h-2.5'
                : 'bg-white/40 hover:bg-white/70 w-2.5 h-2.5'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-6 right-6 z-20 text-white/60 text-sm font-medium hidden md:block">
        {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>
    </div>
  );
};

export default HeroSlider;
