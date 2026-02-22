'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { itemCount, fetchCart } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          ZAPATO<span>FLEX</span>
        </Link>

        <ul className="navbar-links">
          <li><Link href="/">Inicio</Link></li>
          <li><Link href="/catalogo">Catálogo</Link></li>
          {user && <li><Link href="/pedidos">Mis Pedidos</Link></li>}
          {user?.rol === 'ADMIN' && <li><Link href="/admin">Admin</Link></li>}
        </ul>

        <div className="navbar-actions">
          {!loading && (
            <>
              {user && (
                <Link href="/carrito" className="cart-badge">
                  🛒
                  {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
                </Link>
              )}

              {user ? (
                <div className="user-menu">
                  <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    👤 {user.nombre.split(' ')[0]}
                  </button>
                  {dropdownOpen && (
                    <div className="user-dropdown open">
                      <Link href="/pedidos" onClick={() => setDropdownOpen(false)}>📦 Mis Pedidos</Link>
                      {user.rol === 'ADMIN' && (
                        <Link href="/admin" onClick={() => setDropdownOpen(false)}>⚙️ Panel Admin</Link>
                      )}
                      <button onClick={() => { logout(); setDropdownOpen(false); }}>🚪 Cerrar Sesión</button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login" className="btn btn-secondary btn-sm">Ingresar</Link>
                  <Link href="/registro" className="btn btn-primary btn-sm">Registrarse</Link>
                </>
              )}
            </>
          )}
          {loading && <div style={{ width: 150 }} /> /* Placeholder to avoid layout shift */}
        </div>
      </div>
    </nav>
  );
}
