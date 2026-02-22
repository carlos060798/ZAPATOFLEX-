'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: { nombre: string };
  imagenes: { url: string }[];
  inventario: { cantidad: number; minimo: number } | null;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(d => setProduct(d))
      .catch(() => router.push('/catalogo'))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleAddToCart() {
    if (!user || !token) {
      router.push('/login');
      return;
    }
    setAdding(true);
    try {
      await addToCart(Number(id), cantidad);
      setMessage('✅ Producto agregado al carrito');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? `❌ ${err.message}` : '❌ Error al agregar');
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!product) return <div className="empty-state"><h3>Producto no encontrado</h3></div>;

  const stockLevel = product.stock === 0 ? 'out' : product.stock <= 5 ? 'low' : '';

  return (
    <div className="product-detail">
      <div className="product-gallery">👟</div>
      <div className="product-info">
        <Link href="/catalogo" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          ← Volver al catálogo
        </Link>
        <div className="category" style={{ marginTop: '1rem' }}>{product.categoria.nombre}</div>
        <h1>{product.nombre}</h1>
        <div className="price">${product.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
        <p className="description">{product.descripcion}</p>
        
        <div className="stock-info">
          <span className={`stock-dot ${stockLevel}`}></span>
          {product.stock === 0 ? 'Sin stock' : product.stock <= 5 
            ? `¡Solo ${product.stock} disponibles!` 
            : `${product.stock} disponibles`}
        </div>

        {product.stock > 0 && (
          <div className="add-cart-section">
            <div className="cart-item-actions">
              <button className="qty-btn" onClick={() => setCantidad(q => Math.max(1, q - 1))}>-</button>
              <span className="qty-value">{cantidad}</span>
              <button className="qty-btn" onClick={() => setCantidad(q => Math.min(product.stock, q + 1))}>+</button>
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={adding}>
              {adding ? 'Agregando...' : '🛒 Agregar al Carrito'}
            </button>
          </div>
        )}

        {message && (
          <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '1rem' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
