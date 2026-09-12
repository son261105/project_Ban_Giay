import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCart } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();

  const refreshCart = async () => {
    const token = localStorage.getItem('token');
if (!user || !token) { setCartCount(0); return; }
    try {
      const res = await getCart();
      const total = res.data.cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    } catch { setCartCount(0); }
  };

  useEffect(() => { refreshCart(); }, [user]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
