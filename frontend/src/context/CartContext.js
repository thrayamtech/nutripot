import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  // Initialize cart from localStorage for guest users
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Load guest cart from localStorage
      const guestCart = localStorage.getItem('guestCart');
      if (guestCart) {
        try {
          setCart(JSON.parse(guestCart));
        } catch (error) {
          // If parsing fails, reset to empty cart
          console.error('Error parsing guest cart:', error);
          localStorage.removeItem('guestCart');
          setCart({ items: [] });
        }
      } else {
        // No guest cart exists - start with empty cart
        setCart({ items: [] });
      }
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/cart');
      setCart(data.cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity, size, color) => {
    try {
      if (isAuthenticated) {
        // Authenticated user - use API
        const { data } = await API.post('/cart', {
          productId,
          quantity,
          size,
          color
        });
        setCart(data.cart);
        toast.success('Item added to cart');
        setIsCartSidebarOpen(true);
        return data;
      } else {
        // Guest user - use localStorage
        // Fetch product details
        const { data: productData } = await API.get(`/products/${productId}`);
        const product = productData.product;

        const guestCart = JSON.parse(localStorage.getItem('guestCart')) || { items: [] };

        // Check if item already exists
        const existingItemIndex = guestCart.items.findIndex(
          item => item.product._id === productId && item.size === size && item.color === color
        );

        if (existingItemIndex > -1) {
          // Update quantity
          guestCart.items[existingItemIndex].quantity += quantity;
        } else {
          // Add new item
          guestCart.items.push({
            _id: `guest-${Date.now()}`,
            product: product,
            quantity: quantity,
            size: size,
            color: color,
            price: product.discountPrice || product.price
          });
        }

        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        setCart(guestCart);
        toast.success('Item added to cart');
        setIsCartSidebarOpen(true);
        return { cart: guestCart };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      toast.error(message);
      throw error;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const { data } = await API.put(`/cart/${itemId}`, { quantity });
      setCart(data.cart);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart';
      toast.error(message);
      throw error;
    }
  };

  const getCartTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      const price = item.product?.discountPrice || item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      if (isAuthenticated) {
        const { data } = await API.put(`/cart/${itemId}`, { quantity });
        setCart(data.cart);
        toast.success('Cart updated');
        return data;
      } else {
        // Guest user - update localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart')) || { items: [] };
        const itemIndex = guestCart.items.findIndex(item => item._id === itemId);

        if (itemIndex > -1) {
          guestCart.items[itemIndex].quantity = quantity;
          localStorage.setItem('guestCart', JSON.stringify(guestCart));
          setCart(guestCart);
          toast.success('Cart updated');
        }
        return { cart: guestCart };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart';
      toast.error(message);
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      if (isAuthenticated) {
        const { data } = await API.delete(`/cart/${itemId}`);
        setCart(data.cart);
        toast.success('Item removed from cart');
        return data;
      } else {
        // Guest user - update localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart')) || { items: [] };
        guestCart.items = guestCart.items.filter(item => item._id !== itemId);
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        setCart(guestCart);
        toast.success('Item removed from cart');
        return { cart: guestCart };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item';
      toast.error(message);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        const { data } = await API.delete('/cart');
        setCart(data.cart);
        toast.success('Cart cleared');
        return data;
      } else {
        localStorage.removeItem('guestCart');
        setCart({ items: [] });
        toast.success('Cart cleared');
        return { cart: { items: [] } };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
      throw error;
    }
  };

  // Sync guest cart to server when user logs in
  const syncGuestCart = async () => {
    const guestCart = localStorage.getItem('guestCart');
    if (guestCart && isAuthenticated) {
      try {
        const guestItems = JSON.parse(guestCart).items;

        // Add each item to the authenticated cart
        for (const item of guestItems) {
          await API.post('/cart', {
            productId: item.product._id,
            quantity: item.quantity,
            size: item.size,
            color: item.color
          });
        }

        // Clear guest cart from localStorage
        localStorage.removeItem('guestCart');

        // Fetch updated cart
        await fetchCart();

        if (guestItems.length > 0) {
          toast.success('Cart items synced successfully');
        }
      } catch (error) {
        console.error('Error syncing guest cart:', error);
      }
    }
  };

  // Sync cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      syncGuestCart();
    }
  }, [isAuthenticated]);

  const getCartCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cart,
    loading,
    fetchCart,
    addToCart,
    updateCartItem,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartCount,
    getCartTotal,
    isCartSidebarOpen,
    setIsCartSidebarOpen
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
