import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import API from '../utils/api';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default slides as fallback
  const defaultSlides = [
    {
      _id: '1',
      title: 'Exquisite Silk Sarees',
      subtitle: 'Embrace Timeless Elegance',
      description: 'Discover our premium collection of handwoven silk sarees',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200',
      cta: 'Shop Now',
      link: '/products?category=silk'
    },
    {
      _id: '2',
      title: 'New Arrival Collection',
      subtitle: 'Fresh Designs for You',
      description: 'Explore the latest trends in traditional wear',
      image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=1200',
      cta: 'Explore Collection',
      link: '/products?featured=true'
    },
    {
      _id: '3',
      title: 'Festive Special',
      subtitle: 'Celebrate in Style',
      description: 'Get up to 40% off on selected sarees',
      image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=1200',
      cta: 'Shop Sale',
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
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (loading) {
    return (
      <div className="relative h-[500px] md:h-[600px] overflow-hidden bg-gradient-to-r from-[#5A0F1B]/5 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#5A0F1B]"></div>
      </div>
    );
  }

  return (
    <div className="relative h-[500px] md:h-[600px] overflow-hidden bg-gradient-to-r from-[#5A0F1B]/5 to-white">
      {slides.map((slide, index) => {
        const imageUrl = slide.image.startsWith('http')
          ? slide.image
          : `${process.env.REACT_APP_API_URL}${slide.image}`;

        return (
          <div
            key={slide._id || slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${imageUrl})`,
                filter: 'brightness(0.7)'
              }}
            />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl text-white space-y-6 animate-fadeIn">
              <p className="text-[#5A0F1B] font-semibold text-lg tracking-wider uppercase">
                {slide.subtitle}
              </p>
              <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
                {slide.title}
              </h1>
              <p className="text-xl text-gray-200">
                {slide.description}
              </p>
              <Link
                to={slide.link}
                className="inline-block bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] hover:from-[#7A1525] hover:to-[#8A1F35] text-white font-bold py-4 px-8 rounded-full transition transform hover:scale-105 shadow-xl"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        </div>
        );
      })}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-4 rounded-full transition z-10"
      >
        <FaChevronLeft className="text-2xl" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-4 rounded-full transition z-10"
      >
        <FaChevronRight className="text-2xl" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-[#5A0F1B] w-10'
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
