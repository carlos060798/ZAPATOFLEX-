'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CartPage() {
  const { user, token } = useAuth();
  const { cart, loading, fetchCart, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading) router.push('/login');
    if (user && token) fetchCart();
  }, [user, token]);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!user) return null;

  return (
    <div className="cart-page">
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>
        🛒 Mi Carrito
      </h1>

      {!cart || cart.items.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🛒</div>
          <h3>Tu carrito está vacío</h3>
          <p>Agrega productos desde nuestro catálogo</p>
          <Link href="/catalogo" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Ir al Catálogo
          </Link>
        </div>
      ) : (
        <>
          {cart.items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-img">👟</div>
              <div className="cart-item-info">
                <h3>
                  <Link href={`/producto/${item.productoId}`}>{item.producto.nombre}</Link>
                </h3>
                <div className="price">${item.producto.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="cart-item-actions">
                <button className="qty-btn" onClick={() => updateQuantity(item.productoId, Math.max(1, item.cantidad - 1))}>-</button>
                <span className="qty-value">{item.cantidad}</span>
                <button className="qty-btn" onClick={() => updateQuantity(item.productoId, item.cantidad + 1)}>+</button>
              </div>
              <div style={{ fontWeight: 700, minWidth: 100, textAlign: 'right', color: 'var(--accent-gold)' }}>
                ${(item.producto.precio * item.cantidad).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.productoId)}>
                ✕
              </button>
            </div>
          ))}

          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>Subtotal ({cart.items.reduce((s, i) => s + i.cantidad, 0)} productos)</span>
              <span>${cart.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="cart-summary-row">
              <span>Envío</span>
              <span style={{ color: 'var(--success)' }}>{cart.total >= 1500 ? 'Gratis' : '$99.00'}</span>
            </div>
            <div className="cart-summary-total">
              <span>Total</span>
              <span className="amount">
                ${(cart.total + (cart.total >= 1500 ? 0 : 99)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Link href="/catalogo" className="btn btn-secondary">Seguir Comprando</Link>
              <Link href="/checkout" className="btn btn-primary btn-lg">Proceder al Pago →</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
