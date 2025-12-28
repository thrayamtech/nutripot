import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaShoppingBag, FaArrowRight } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Cart = () => {
  const { cart, loading, updateCartItem, removeFromCart, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = async (itemId, currentQuantity, change, availableStock) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    // Check if new quantity exceeds available stock
    if (newQuantity > availableStock) {
      toast.info(`Only ${availableStock} items available in stock`);
      return;
    }

    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update cart';
      toast.error(errorMessage);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="bg-white rounded-lg p-6 mb-4">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg p-12 text-center">
            <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some beautiful sarees to your cart</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white font-medium transition-colors"
            >
              Continue Shopping
              <FaArrowRight className="text-sm" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 999 ? 0 : 50;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600 text-sm">{cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item._id} className="bg-white p-4 md:p-6 flex gap-4">
                {/* Product Image */}
                <Link to={`/products/${item.product?._id}`} className="flex-shrink-0">
                  <img
                    src={item.product?.images?.[0] || '/placeholder.jpg'}
                    alt={item.product?.name}
                    className="w-24 h-24 md:w-28 md:h-28 object-cover"
                  />
                </Link>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product?._id}`} className="block">
                    <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1 hover:text-amber-700 transition-colors">
                      {item.product?.name}
                    </h3>
                  </Link>

                  {/* Size & Color */}
                  <div className="flex gap-4 text-sm text-gray-600 mb-2">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                  </div>

                  {/* Stock Info */}
                  {item.product?.stock <= 5 && (
                    <p className="text-xs text-amber-600 mb-2">
                      Only {item.product.stock} left in stock
                    </p>
                  )}

                  {/* Price and Quantity Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity, -1, item.product?.stock)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <FaMinus className="text-xs" />
                      </button>
                      <span className="w-12 text-center font-medium text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity, 1, item.product?.stock)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                        disabled={item.quantity >= item.product?.stock}
                      >
                        <FaPlus className="text-xs" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ₹{((item.product?.discountPrice || item.product?.price) * item.quantity).toLocaleString()}
                        </p>
                        {item.product?.discountPrice && (
                          <p className="text-sm text-gray-500 line-through">
                            ₹{(item.product.price * item.quantity).toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label="Remove item"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-amber-700">
                    Add ₹{(1000 - subtotal).toLocaleString()} more for free shipping
                  </p>
                )}
              </div>

              <div className="flex justify-between text-lg font-semibold text-gray-900 mb-6">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-medium transition-colors mb-3"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/products"
                className="block text-center py-3 text-amber-700 hover:text-amber-800 font-medium transition-colors"
              >
                Continue Shopping
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Secure Checkout
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Free Returns
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    100% Authentic Products
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
