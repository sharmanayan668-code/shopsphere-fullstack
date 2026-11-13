import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], itemCount: 0, subtotal: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCart({ items: [], itemCount: 0, subtotal: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to load cart:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      throw new Error('Please login to add products to your cart');
    }
    const res = await api.post('/cart/items', { productId, quantity });
    setCart(res.data);
    return res;
  };

  const updateQuantity = async (productId, quantity) => {
    const res = await api.put(`/cart/items/${productId}`, { quantity });
    setCart(res.data);
    return res;
  };

  const removeFromCart = async (productId) => {
    const res = await api.delete(`/cart/items/${productId}`);
    setCart(res.data);
    return res;
  };

  const clearCart = async () => {
    await api.delete('/cart');
    setCart({ items: [], itemCount: 0, subtotal: 0 });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount: cart.itemCount || 0,
        subtotal: cart.subtotal || 0,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
