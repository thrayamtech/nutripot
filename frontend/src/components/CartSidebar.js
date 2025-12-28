import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes, FaTrash, FaShoppingBag } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import confetti from 'canvas-confetti';

const CartSidebar = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();

  useEffect(() => {
    if (isOpen && cart?.items && cart.items.length > 0) {
      // Show confetti when cart opens with items
      triggerConfetti();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const triggerConfetti = () => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d']
      });
    }, 250);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-amber-50 to-orange-50">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FaShoppingBag className="mr-2 text-amber-700" />
              Shopping Cart
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              <FaTimes />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.items && cart.items.length > 0 ? (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex gap-4 bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition">
                    <img
                      src={item.product?.images?.[0]?.url || '/placeholder-saree.jpg'}
                      alt={item.product?.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-2">
                        {item.product?.name}
                      </h3>
                      <p className="text-amber-700 font-bold text-sm mb-2">
                        ₹{item.product?.discountPrice || item.product?.price}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                            className="px-2 py-1 hover:bg-gray-100 text-gray-600"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 border-x border-gray-300 text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="px-2 py-1 hover:bg-gray-100 text-gray-600"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FaShoppingBag className="text-6xl mb-4" />
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm mt-2">Add some beautiful sarees!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.items && cart.items.length > 0 && (
            <div className="border-t p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 font-medium">Subtotal:</span>
                <span className="text-2xl font-bold text-amber-700">
                  ₹{getCartTotal()}
                </span>
              </div>
              <Link
                to="/cart"
                onClick={onClose}
                className="block w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition mb-2"
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                onClick={onClose}
                className="block w-full bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-semibold py-3 px-4 rounded-lg text-center transition"
              >
                Proceed to Checkout
              </Link>
              <button
                onClick={onClose}
                className="block w-full mt-2 bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg text-center transition border border-gray-300"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
