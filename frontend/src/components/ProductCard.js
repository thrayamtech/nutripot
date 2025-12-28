import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaHeart, FaEye } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();

  const hasMultipleSizes = product.sizes && product.sizes.length > 1;
  const hasMultipleImages = product.images && product.images.length > 1;

  const handleAddToCart = async (size = '') => {
    const finalSize = size || selectedSize || product.sizes?.[0] || 'Free Size';
    const finalColor = product.colors?.[0]?.name || 'Default';

    try {
      await addToCart(product._id, 1, finalSize, finalColor);
      // Don't show duplicate toast - addToCart already shows success
      setShowSizeDropdown(false);
      setSelectedSize('');
    } catch (error) {
      console.error('Add to cart error:', error);
      // Don't show duplicate toast - addToCart already shows error
    }
  };

  const handleQuickSelect = () => {
    if (hasMultipleSizes) {
      setShowSizeDropdown(!showSizeDropdown);
    } else {
      handleAddToCart();
    }
  };

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="group relative bg-white overflow-hidden transition-all duration-300">
      {/* Image Container */}
      <div
        className="relative overflow-hidden bg-gray-50 aspect-[3/4]"
        onMouseEnter={() => hasMultipleImages && setCurrentImageIndex(1)}
        onMouseLeave={() => setCurrentImageIndex(0)}
      >
        <Link to={`/products/${product._id}`}>
          <img
            src={product.images?.[currentImageIndex]?.url || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Discount Badge - Top Left */}
        {product.discountPrice && (
          <div className="absolute top-2 left-0 z-10">
            <div className="bg-gradient-to-r from-[#5A0F1B] to-[#8A1F35] text-white pl-2.5 pr-3 py-1 rounded-r-full shadow-md">
              <span className="text-[11px] font-bold">-{discountPercent}%</span>
            </div>
          </div>
        )}

        {/* Stock Badge - Top Right (if low stock) */}
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-red-500 text-white px-2 py-0.5 rounded-full shadow-md">
              <span className="text-[9px] font-bold uppercase">Low Stock</span>
            </div>
          </div>
        )}

        {/* Hover Icons - Top Right */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <button
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-[#5A0F1B] hover:text-white transition-all duration-200"
            title="Add to Wishlist"
          >
            <FaHeart className="text-xs" />
          </button>
          <Link
            to={`/products/${product._id}`}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-[#5A0F1B] hover:text-white transition-all duration-200"
            title="Quick View"
          >
            <FaEye className="text-xs" />
          </Link>
        </div>

        {/* Hover Overlay with Select Options Button */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4 z-10">
          <button
            onClick={handleQuickSelect}
            className="bg-gradient-to-r from-[#5A0F1B] to-[#8A1F35] hover:from-[#7A1525] hover:to-[#8A1F35] text-white px-8 py-2.5 rounded-lg font-semibold text-sm shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {hasMultipleSizes ? 'Select options' : 'Add to cart'}
          </button>
        </div>

        {/* Size Selector Modal - Compact Design */}
        {showSizeDropdown && hasMultipleSizes && (
          <>
            {/* Backdrop with smooth fade */}
            <div
              className="fixed inset-0 bg-black/30 z-30 transition-opacity duration-200"
              onClick={() => setShowSizeDropdown(false)}
              style={{ animation: 'fadeIn 0.2s ease-out' }}
            />

            {/* Compact Size Selector - Bottom positioned */}
            <div
              className="absolute left-1/2 bottom-2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl z-40 w-[92%] max-w-sm overflow-hidden"
              style={{ animation: 'slideUpBottom 0.25s ease-out' }}
            >
              {/* Compact Content */}
              <div className="p-4">
                {/* Header with close */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Select Size</h3>
                  <button
                    onClick={() => setShowSizeDropdown(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Size Selection - Compact Grid */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${
                          selectedSize === size
                            ? 'border-[#5A0F1B] bg-[#5A0F1B] text-white shadow-md'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-[#5A0F1B]/60'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleAddToCart(selectedSize)}
                  disabled={!selectedSize}
                  className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    selectedSize
                      ? 'bg-gradient-to-r from-[#5A0F1B] to-[#8A1F35] hover:from-[#7A1525] hover:to-[#8A1F35] text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {selectedSize ? 'Add to Cart' : 'Select a size'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-sm font-medium text-gray-800 hover:text-[#5A0F1B] transition-colors duration-200 line-clamp-2 mb-2 h-10">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.averageRating > 0 && (
          <div className="flex items-center mb-2">
            <div className="flex text-[#8A1F35] text-xs">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={i < Math.floor(product.averageRating) ? 'text-[#8A1F35]' : 'text-gray-200'}
                />
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          {product.discountPrice && (
            <span className="text-sm text-gray-400 line-through">
              ₹{product.price.toLocaleString()}
            </span>
          )}
          <span className="text-lg font-bold text-gray-900">
            ₹{(product.discountPrice || product.price).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
