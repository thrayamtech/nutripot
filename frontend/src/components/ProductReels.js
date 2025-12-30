import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp, FaTimes, FaChevronLeft, FaChevronRight, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const ProductReels = ({ reels }) => {
  const [selectedReelIndex, setSelectedReelIndex] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const videoRefs = useRef([]);
  const popupVideoRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const { addToCart } = useCart();
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Handle opening reel in popup
  const openReelPopup = (index) => {
    // Don't open if user was dragging
    if (isDragging.current) return;

    setSelectedReelIndex(index);
    // Pause all thumbnail videos
    videoRefs.current.forEach(video => {
      if (video) video.pause();
    });
  };

  // Handle closing popup
  const closePopup = () => {
    setSelectedReelIndex(null);
    setIsPlaying(true);
    setIsMuted(true);
  };

  // Handle next/previous reel
  const goToNextReel = () => {
    if (selectedReelIndex < reels.length - 1) {
      setSelectedReelIndex(selectedReelIndex + 1);
      setIsPlaying(true);
    }
  };

  const goToPreviousReel = () => {
    if (selectedReelIndex > 0) {
      setSelectedReelIndex(selectedReelIndex - 1);
      setIsPlaying(true);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedReelIndex === null) return;

      if (e.key === 'Escape') {
        closePopup();
      } else if (e.key === 'ArrowRight') {
        goToNextReel();
      } else if (e.key === 'ArrowLeft') {
        goToPreviousReel();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReelIndex, isPlaying]);

  // Control popup video playback
  useEffect(() => {
    if (popupVideoRef.current) {
      if (isPlaying) {
        const playPromise = popupVideoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log('Popup video play prevented:', error);
          });
        }
      } else {
        popupVideoRef.current.pause();
      }
    }
  }, [isPlaying, selectedReelIndex]);

  // Control popup video mute
  useEffect(() => {
    if (popupVideoRef.current) {
      popupVideoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Handle add to cart
  const handleAddToCart = async (product) => {
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    try {
      const size = product.sizes?.[0] || 'Free Size';
      const color = product.colors?.[0]?.name || 'Default';
      await addToCart(product._id, 1, size, color);
      // Don't show duplicate toast - addToCart already shows success message
    } catch (error) {
      console.error('Add to cart error:', error);
      // Don't show duplicate toast - addToCart already shows error message
    }
  };

  // Scroll carousel functions
  const scrollCarousel = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Mouse drag to scroll
  const handleMouseDown = (e) => {
    // Only enable drag on container, not on video cards
    if (e.target.closest('.reel-card')) return;

    if (scrollContainerRef.current) {
      isDragging.current = false; // Will be set to true on move
      startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
      scrollLeft.current = scrollContainerRef.current.scrollLeft;
    }
  };

  const handleMouseMove = (e) => {
    if (startX.current === 0) return;

    const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    const walk = Math.abs(x - startX.current);

    // If moved more than 5px, consider it a drag
    if (walk > 5) {
      isDragging.current = true;
      e.preventDefault();

      if (scrollContainerRef.current) {
        const distance = (x - startX.current) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft.current - distance;
        scrollContainerRef.current.style.cursor = 'grabbing';
      }
    }
  };

  const handleMouseUpOrLeave = () => {
    startX.current = 0;

    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
    }

    // Reset dragging state after a small delay to allow click to be blocked
    setTimeout(() => {
      isDragging.current = false;
    }, 100);
  };

  // Check scroll position on mount and scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollPosition();
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [reels]);

  // Handle thumbnail video visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            // Use promise to handle play/pause conflicts
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                // Auto-play was prevented, ignore the error
                console.log('Video autoplay prevented:', error);
              });
            }
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    const currentVideoRefs = videoRefs.current;
    currentVideoRefs.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      currentVideoRefs.forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, [reels]);

  if (!reels || reels.length === 0) return null;

  const selectedReel = selectedReelIndex !== null ? reels[selectedReelIndex] : null;

  return (
    <>
      {/* Reels Grid */}
      <section className="py-10 md:py-16 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          {/* Section Header */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
              Trending Styles
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Watch our latest collection in action
            </p>
          </div>

          {/* Reels Carousel - Horizontal Scrollable */}
          <div className="relative group">
            {/* Left Scroll Button */}
            {showLeftArrow && (
              <button
                onClick={() => scrollCarousel('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Scroll left"
              >
                <FaChevronLeft className="text-lg" />
              </button>
            )}

            {/* Right Scroll Button */}
            {showRightArrow && (
              <button
                onClick={() => scrollCarousel('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Scroll right"
              >
                <FaChevronRight className="text-lg" />
              </button>
            )}

            {/* Scroll Container with Mouse Drag */}
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-hide scroll-smooth cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            >
              <div className="flex gap-3 md:gap-4 pb-4">
                {reels.map((reel, index) => (
                  <div
                    key={reel._id || index}
                    className="reel-card relative aspect-[9/16] w-[180px] sm:w-[200px] md:w-[220px] flex-shrink-0 bg-gray-900 rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => openReelPopup(index)}
                  >
                    {/* Video */}
                    <video
                      ref={(el) => (videoRefs.current[index] = el)}
                      src={reel.videoUrl}
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {/* Play Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <FaPlay className="text-white text-lg ml-1" />
                        </div>
                      </div>
                    </div>

                    {/* Product Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <h3 className="text-white text-xs md:text-sm font-medium line-clamp-2 mb-1">
                        {reel.product?.name}
                      </h3>
                      <p className="text-white/90 text-xs font-semibold">
                        ₹{(reel.product?.discountPrice || reel.product?.price)?.toLocaleString()}
                      </p>
                    </div>

                    {/* View Count Badge */}
                    {reel.views && (
                      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        {reel.views > 1000 ? `${(reel.views / 1000).toFixed(1)}k` : reel.views} views
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Screen Popup - Carousel Style */}
      {selectedReelIndex !== null && selectedReel && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center overflow-hidden">
          {/* Background Overlay - Dark transparent layer */}
          <div className="absolute inset-0 bg-black/50 z-0"></div>

          {/* Close Button */}
          <button
            onClick={closePopup}
            className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
            aria-label="Close"
          >
            <FaTimes className="text-xl" />
          </button>

          {/* Carousel Container - Centered & Compact (50% width) */}
          <div className="relative max-w-[700px] w-full h-full flex items-center justify-center">
            {/* Previous Reel Preview */}
            {selectedReelIndex > 0 && (
              <div className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-10 opacity-70 scale-[0.7] hidden md:block pointer-events-none">
                <div className="w-[200px] h-[360px] rounded-xl overflow-hidden shadow-2xl border border-white/20">
                  <video
                    src={reels[selectedReelIndex - 1].videoUrl}
                    className="w-full h-full object-cover"
                    muted
                    loop
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>
              </div>
            )}

            {/* Next Reel Preview */}
            {selectedReelIndex < reels.length - 1 && (
              <div className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-10 opacity-70 scale-[0.7] hidden md:block pointer-events-none">
                <div className="w-[200px] h-[360px] rounded-xl overflow-hidden shadow-2xl border border-white/20">
                  <video
                    src={reels[selectedReelIndex + 1].videoUrl}
                    className="w-full h-full object-cover"
                    muted
                    loop
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>
              </div>
            )}

            {/* Navigation Arrows */}
            {selectedReelIndex > 0 && (
              <button
                onClick={goToPreviousReel}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
                aria-label="Previous"
              >
                <FaChevronLeft className="text-xl" />
              </button>
            )}

            {selectedReelIndex < reels.length - 1 && (
              <button
                onClick={goToNextReel}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
                aria-label="Next"
              >
                <FaChevronRight className="text-xl" />
              </button>
            )}

            {/* Main Video Container - Vertical Reels Format */}
            <div className="relative w-full h-full max-w-[380px] flex items-center justify-center z-20">
              {/* Video - Vertical aspect ratio like reels */}
              <video
                ref={popupVideoRef}
                src={selectedReel.videoUrl}
                className="w-full h-full object-cover rounded-2xl"
                loop
                autoPlay
                muted={isMuted}
                playsInline
              />

              {/* Top Controls */}
              <div className="absolute top-4 left-0 right-0 px-4 flex items-center justify-between z-30">
                {/* Mute/Unmute Button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-9 h-9 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <FaVolumeMute className="text-sm" /> : <FaVolumeUp className="text-sm" />}
                </button>

                {/* Progress Indicator */}
                <div className="flex gap-1">
                  {reels.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 rounded-full transition-all ${
                        index === selectedReelIndex
                          ? 'w-8 bg-white'
                          : 'w-1 bg-white/30'
                      }`}
                    />
                  ))}
                </div>

                <div className="w-9"></div> {/* Spacer for symmetry */}
              </div>

              {/* Side Actions - Compact */}
              <div className="absolute right-3 bottom-24 flex flex-col gap-3 z-30">
                {/* Like Button */}
                <div className="flex flex-col items-center">
                  <button className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <span className="text-white text-xs mt-1 font-medium">{selectedReel.views > 1000 ? `${(selectedReel.views / 1000).toFixed(1)}k` : selectedReel.views}</span>
                </div>

                {/* Share Button */}
                <div className="flex flex-col items-center">
                  <button className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Product Info Card - Minimal & Inside Video */}
              <div className="absolute bottom-3 left-3 right-3 z-30">
                <div className="bg-gradient-to-t from-black/80 to-transparent rounded-lg p-2.5">
                  <div className="flex items-center gap-2">
                    {/* Product Image - Small */}
                    <img
                      src={selectedReel.product?.images?.[0]}
                      alt={selectedReel.product?.name}
                      className="w-10 h-10 object-cover rounded-md flex-shrink-0 border border-white/20"
                    />

                    {/* Product Info - Minimal */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-[11px] font-semibold line-clamp-1 mb-0.5">
                        {selectedReel.product?.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <span className="text-white text-xs font-bold">
                          ₹{(selectedReel.product?.discountPrice || selectedReel.product?.price)?.toLocaleString()}
                        </span>
                        {selectedReel.product?.discountPrice && (
                          <span className="text-white/60 text-[9px] line-through">
                            ₹{selectedReel.product?.price?.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart Button - Icon Only, Elegant */}
                    <button
                      onClick={() => handleAddToCart(selectedReel.product)}
                      className="flex-shrink-0 w-8 h-8 bg-white/90 hover:bg-white hover:scale-110 text-gray-900 rounded-full transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={selectedReel.product?.stock === 0}
                      aria-label="Add to cart"
                    >
                      <FaShoppingCart className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Play/Pause Button - Center */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all opacity-0 hover:opacity-100"
              >
                {isPlaying ? <FaPause className="text-2xl" /> : <FaPlay className="text-2xl ml-1" />}
              </button>
            </div>

            {/* Touch Swipe Area for Mobile */}
            <div
              className="absolute inset-0 md:hidden"
              onTouchStart={(e) => {
                const touchStart = e.touches[0].clientX;
                const handleTouchEnd = (endEvent) => {
                  const touchEnd = endEvent.changedTouches[0].clientX;
                  const diff = touchStart - touchEnd;

                  if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                      goToNextReel();
                    } else {
                      goToPreviousReel();
                    }
                  }

                  document.removeEventListener('touchend', handleTouchEnd);
                };

                document.addEventListener('touchend', handleTouchEnd);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductReels;
