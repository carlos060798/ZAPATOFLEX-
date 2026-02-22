'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface CartItem {
  id: number;
  cantidad: number;
  productoId: number;
  producto: {
    id: number;
    nombre: string;
    precio: number;
    stock: number;
    imagenes: { url: string }[];
  };
}

interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productoId: number, cantidad?: number) => Promise<void>;
  updateQuantity: (productoId: number, cantidad: number) => Promise<void>;
  removeFromCart: (productoId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);

  const fetchCart = useCallback(async () => {
    if (!token) { setCart(null); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/cart', { headers: headers() });
      if (res.ok) setCart(await res.json());
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [token, headers]);

  async function addToCart(productoId: number, cantidad = 1) {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ productoId, cantidad }),
      });
      if (res.ok) setCart(await res.json());
      else { const d = await res.json(); throw new Error(d.error); }
    } finally { setLoading(false); }
  }

  async function updateQuantity(productoId: number, cantidad: number) {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ productoId, cantidad }),
      });
      if (res.ok) setCart(await res.json());
    } finally { setLoading(false); }
  }

  async function removeFromCart(productoId: number) {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cart?productoId=${productoId}`, {
        method: 'DELETE',
        headers: headers(),
      });
      if (res.ok) setCart(await res.json());
    } finally { setLoading(false); }
  }

  async function clearCart() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: headers(),
      });
      if (res.ok) setCart(await res.json());
    } finally { setLoading(false); }
  }

  const itemCount = cart?.items.reduce((sum, item) => sum + item.cantidad, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
