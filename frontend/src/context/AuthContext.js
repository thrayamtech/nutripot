import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../utils/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  // Helper function to clear localStorage except specific keys
  const clearLocalStorageExcept = (keysToKeep = []) => {
    const itemsToPreserve = {};

    // Save items we want to keep
    keysToKeep.forEach(key => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        itemsToPreserve[key] = value;
      }
    });

    // Clear all localStorage
    localStorage.clear();

    // Restore preserved items
    Object.entries(itemsToPreserve).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  };

  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });

      // Clear all localStorage except guestCart before setting new auth data
      // This ensures clean state and cart will be synced by CartContext
      clearLocalStorageExcept(['guestCart']);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      toast.success('Login successful!');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await API.post('/auth/register', userData);

      // Clear all localStorage except guestCart before setting new auth data
      clearLocalStorageExcept(['guestCart']);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      toast.success('Registration successful!');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    // Clear all localStorage completely on logout (including guestCart)
    // User starts fresh after logout
    localStorage.clear();
    setToken(null);
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const setAuthData = (authToken, userData) => {
    // This is called during OTP login/registration
    // Clear all localStorage except guestCart before setting auth data
    clearLocalStorageExcept(['guestCart']);

    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    setAuthData,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
