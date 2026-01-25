import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaHeart, FaRegHeart, FaShoppingBag, FaPlay, FaEye, FaVolumeMute, FaVolumeUp, FaTimes, FaChevronUp, FaChevronDown, FaShare } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import API from '../utils/api';
import { getProductImage, handleImageError } from '../utils/imageHelper';

const ProductReels = ({ reels: initialReels }) => {
  const [reels, setReels] = useState(initialReels || []);
  const [popupOpen, setPopupOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [likeAnimations, setLikeAnimations] = useState({});
  const videoRefs = useRef({});
  const popupContainerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setReels(initialReels || []);
  }, [initialReels]);

  // Format count (1000 -> 1K)
  const formatCount = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count?.toString() || '0';
  };

  // Track view
  const trackView = useCallback(async (reelId) => {
    try {
      await API.post(`/reels/${reelId}/view`);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }, []);

  // Handle like
  const handleLike = async (reelId, e) => {
    if (e) e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please login to like reels');
      navigate('/login');
      return;
    }

    // Trigger animation
    setLikeAnimations(prev => ({ ...prev, [reelId]: true }));
    setTimeout(() => {
      setLikeAnimations(prev => ({ ...prev, [reelId]: false }));
    }, 600);

    try {
      const { data } = await API.post(`/reels/${reelId}/like`);
      setReels(prev => prev.map(reel =>
        reel._id === reelId
          ? { ...reel, isLiked: data.isLiked, likes: data.likes }
          : reel
      ));
    } catch (error) {
      console.error('Error liking reel:', error);
    }
  };

  // Handle double tap to like
  const handleDoubleTap = (reelId) => {
    handleLike(reelId);
  };

  // Handle add to cart
  const handleAddToCart = async (product, e) => {
    if (e) e.stopPropagation();

    if (!product) {
      toast.error('No product linked');
      return;
    }

    try {
      const size = product.sizes?.[0] || 'Free Size';
      const color = product.colors?.[0]?.name || 'Default';
      await addToCart(product._id, 1, size, color);
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  };

  // Navigate to product
  const handleViewProduct = (product) => {
    if (product?.slug) {
      navigate(`/products/${product.slug}`);
    }
  };

  // Share reel
  const handleShare = async (reel) => {
    const url = `${window.location.origin}/reels/${reel._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: reel.product?.name || 'Check out this reel',
          url: url
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  // Open popup
  const openPopup = (index) => {
    setActiveIndex(index);
    setPopupOpen(true);
    document.body.style.overflow = 'hidden';
    // Track view when opening
    if (reels[index]) {
      trackView(reels[index]._id);
    }
  };

  // Close popup
  const closePopup = () => {
    setPopupOpen(false);
    document.body.style.overflow = 'auto';
  };

  // Navigate reels
  const goToNext = useCallback(() => {
    if (activeIndex < reels.length - 1) {
      const newIndex = activeIndex + 1;
      setActiveIndex(newIndex);
      trackView(reels[newIndex]._id);
    }
  }, [activeIndex, reels, trackView]);

  const goToPrev = useCallback(() => {
    if (activeIndex > 0) {
      const newIndex = activeIndex - 1;
      setActiveIndex(newIndex);
      trackView(reels[newIndex]._id);
    }
  }, [activeIndex, reels, trackView]);

  // Handle scroll/swipe in popup
  useEffect(() => {
    const container = popupContainerRef.current;
    if (!container || !popupOpen) return;

    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e) => {
      const endY = e.changedTouches[0].clientY;
      const diff = startY - endY;
      const timeDiff = Date.now() - startTime;

      // Swipe threshold
      if (Math.abs(diff) > 50 && timeDiff < 300) {
        if (diff > 0) {
          goToNext(); // Swipe up - next
        } else {
          goToPrev(); // Swipe down - prev
        }
      }
    };

    const handleWheel = (e) => {
      e.preventDefault();
      if (e.deltaY > 30) {
        goToNext();
      } else if (e.deltaY < -30) {
        goToPrev();
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [popupOpen, goToNext, goToPrev]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!popupOpen) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'Escape') closePopup();
      if (e.key === ' ') {
        e.preventDefault();
        setIsMuted(!isMuted);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [popupOpen, goToNext, goToPrev, isMuted]);

  if (!reels || reels.length === 0) return null;

  const activeReel = reels[activeIndex];

  return (
    <>
      {/* Homepage Section - Elegant Carousel */}
      <section className="py-6 md:py-10 bg-gradient-to-b from-white via-[#5A0F1B]/5 to-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#5A0F1B]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#7A1525]/20 rounded-full blur-3xl"></div>

        <div className="max-w-[1600px] mx-auto px-4 md:px-6 relative">
          {/* Section Header - Matching site design */}
          <div className="text-center mb-4 md:mb-6">
            <div className="inline-block mb-1">
              <div className="flex items-center justify-center gap-1.5 text-[#5A0F1B] font-serif text-xs tracking-[0.15em] uppercase">
                <FaPlay className="text-xs" />
                <span>Trending</span>
              </div>
            </div>
            <h2 className="text-xl md:text-3xl font-serif font-bold bg-gradient-to-r from-[#5A0F1B] via-[#7A1525] to-[#5A0F1B] bg-clip-text text-transparent mb-1">
              Shop Our Reels
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#5A0F1B] to-transparent mx-auto mb-1"></div>
            <p className="text-gray-600 text-xs md:text-sm max-w-2xl mx-auto">
              Watch & shop our latest styles
            </p>
          </div>

          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide scroll-smooth -mx-4 px-4"
          >
            <div className="flex gap-4 justify-center">
              {reels.slice(0, 8).map((reel, index) => (
                <div
                  key={reel._id}
                  onClick={() => openPopup(index)}
                  className="flex-shrink-0 w-[150px] sm:w-[170px] md:w-[190px] cursor-pointer group"
                >
                  <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <video
                      src={reel.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      autoPlay
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />

                    {/* Play overlay on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                        <FaPlay className="text-white text-lg ml-1" />
                      </div>
                    </div>

                    {/* Bottom info */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-3 text-white text-xs">
                        <span className="flex items-center gap-1">
                          <FaEye className="text-[10px]" />
                          {formatCount(reel.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaHeart className="text-[10px]" />
                          {formatCount(reel.likes)}
                        </span>
                      </div>
                      {reel.product && (
                        <p className="text-white text-xs font-semibold truncate mt-1">
                          ₹{(reel.product.salePrice || reel.product.price)?.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fullscreen Reels Popup - Instagram Style */}
      {popupOpen && activeReel && (
        <div className="fixed inset-0 z-[100] bg-black">
          {/* Main Container */}
          <div
            ref={popupContainerRef}
            className="h-screen w-full flex items-center justify-center"
          >
            {/* Video Container - Full height */}
            <div className="relative h-full w-full md:max-w-[450px] md:max-h-[100vh] mx-auto flex items-center justify-center">
              {/* Close Button - Inside video container */}
              <button
                onClick={closePopup}
                className="absolute top-4 left-4 z-50 w-10 h-10 flex items-center justify-center text-white bg-black/30 backdrop-blur-sm rounded-full"
              >
                <FaTimes className="text-lg" />
              </button>

              {/* Reel Counter */}
              <div className="absolute top-4 right-4 z-50 text-white text-sm font-medium bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                {activeIndex + 1}/{reels.length}
              </div>

              {/* Progress Indicators - At very top */}
              <div className="absolute top-2 left-2 right-2 flex gap-1 z-50">
                {reels.map((_, index) => (
                  <div
                    key={index}
                    className={`h-0.5 flex-1 rounded-full transition-all ${
                      index === activeIndex
                        ? 'bg-white'
                        : index < activeIndex
                        ? 'bg-white/60'
                        : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Hints */}
              {activeIndex > 0 && (
                <button
                  onClick={goToPrev}
                  className="absolute top-20 left-1/2 -translate-x-1/2 z-40 text-white/50 animate-bounce hidden md:block"
                >
                  <FaChevronUp className="text-2xl" />
                </button>
              )}
              {activeIndex < reels.length - 1 && (
                <button
                  onClick={goToNext}
                  className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40 text-white/50 animate-bounce hidden md:block"
                >
                  <FaChevronDown className="text-2xl" />
                </button>
              )}

              <video
                key={activeReel._id}
                ref={el => videoRefs.current[activeReel._id] = el}
                src={activeReel.videoUrl}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                onDoubleClick={() => handleDoubleTap(activeReel._id)}
              />

              {/* Like Animation */}
              {likeAnimations[activeReel._id] && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <FaHeart className="text-red-500 text-8xl animate-ping" />
                </div>
              )}

              {/* Right Side Actions */}
              <div className="absolute right-3 bottom-32 md:bottom-40 flex flex-col items-center gap-5 z-30">
                {/* Like */}
                <button
                  onClick={(e) => handleLike(activeReel._id, e)}
                  className="flex flex-col items-center"
                >
                  {activeReel.isLiked ? (
                    <FaHeart className="text-3xl text-red-500 drop-shadow-lg transform hover:scale-110 transition-transform" />
                  ) : (
                    <FaRegHeart className="text-3xl text-white drop-shadow-lg transform hover:scale-110 transition-transform" />
                  )}
                  <span className="text-white text-xs mt-1 font-medium">
                    {formatCount(activeReel.likes)}
                  </span>
                </button>

                {/* Views */}
                <div className="flex flex-col items-center">
                  <FaEye className="text-2xl text-white drop-shadow-lg" />
                  <span className="text-white text-xs mt-1 font-medium">
                    {formatCount(activeReel.views)}
                  </span>
                </div>

                {/* Share */}
                <button
                  onClick={() => handleShare(activeReel)}
                  className="flex flex-col items-center"
                >
                  <FaShare className="text-2xl text-white drop-shadow-lg transform hover:scale-110 transition-transform" />
                  <span className="text-white text-xs mt-1">Share</span>
                </button>

                {/* Mute/Unmute */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
                >
                  {isMuted ? (
                    <FaVolumeMute className="text-white text-lg" />
                  ) : (
                    <FaVolumeUp className="text-white text-lg" />
                  )}
                </button>
              </div>

              {/* Bottom Product Card */}
              {activeReel.product && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
                  <div className="flex items-end gap-3">
                    {/* Product Image */}
                    <div
                      onClick={() => handleViewProduct(activeReel.product)}
                      className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0 cursor-pointer border-2 border-white/20"
                    >
                      <img
                        src={getProductImage(activeReel.product)}
                        alt={activeReel.product.name}
                        onError={(e) => handleImageError(e, 'product')}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        onClick={() => handleViewProduct(activeReel.product)}
                        className="text-white font-medium text-sm truncate cursor-pointer hover:underline"
                      >
                        {activeReel.product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-white font-bold">
                          ₹{(activeReel.product.salePrice || activeReel.product.price)?.toLocaleString()}
                        </span>
                        {activeReel.product.salePrice && activeReel.product.price > activeReel.product.salePrice && (
                          <span className="text-white/60 text-sm line-through">
                            ₹{activeReel.product.price?.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => handleAddToCart(activeReel.product, e)}
                      className="px-4 py-2.5 bg-white text-gray-900 rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors flex-shrink-0"
                    >
                      <FaShoppingBag className="text-sm" />
                      Add
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes heartBeat {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .animate-heartbeat {
          animation: heartBeat 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default ProductReels;
