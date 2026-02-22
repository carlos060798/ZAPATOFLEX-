'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Product {
  id: number;
  nombre: string;
  slug: string;
  precio: number;
  stock: number;
  categoria: { nombre: string };
  imagenes: { url: string }[];
}

interface Category {
  id: number;
  nombre: string;
  slug: string;
  _count: { productos: number };
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/products?limit=8&orderBy=reciente')
      .then(r => r.json())
      .then(d => {
        if (d && d.productos && Array.isArray(d.productos)) {
          setProducts(d.productos);
        }
      });
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          setCategories(d);
        }
      });
  }, []);

  const categoryIcons: Record<string, string> = {
    'Deportivos': '🏃',
    'Casuales': '👟',
    'Formales': '👞',
  };

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">✨ Nueva Colección 2026</div>
          <h1>
            Calzado <span className="highlight">Premium</span><br />
            Para Cada Momento
          </h1>
          <p>
            Descubre la perfecta combinación de estilo, comodidad y calidad.
            Desde deportivos hasta formales, ZAPATOFLEX tiene el zapato ideal para ti.
          </p>
          <div className="hero-actions">
            <Link href="/catalogo" className="btn btn-primary btn-lg">
              Explorar Catálogo
            </Link>
            <Link href="/registro" className="btn btn-secondary btn-lg">
              Crear Cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="section-header">
          <h2>Nuestras Categorías</h2>
          <p>Encuentra el estilo perfecto para cada ocasión</p>
        </div>
        <div className="categories-grid">
          {categories.map(cat => (
            <Link key={cat.id} href={`/catalogo?categoriaId=${cat.id}`} style={{ textDecoration: 'none' }}>
              <div className="category-card">
                <div className="category-card-content">
                  <h3>{categoryIcons[cat.nombre] || '👠'} {cat.nombre}</h3>
                  <span className="count">{cat._count.productos} productos</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-header">
          <h2>Productos Destacados</h2>
          <p>Lo más nuevo de nuestra colección</p>
        </div>
        <div className="product-grid">
          {products.map(p => (
            <Link key={p.id} href={`/producto/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card">
                <div className="card-img">👟</div>
                <div className="card-body">
                  <div className="card-category">{p.categoria.nombre}</div>
                  <h3 className="card-title">{p.nombre}</h3>
                  <div className="card-price">${p.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                  <div className={`card-stock ${p.stock <= 5 ? (p.stock === 0 ? 'out' : 'low') : ''}`}>
                    {p.stock === 0 ? 'Agotado' : p.stock <= 5 ? `¡Solo ${p.stock} disponibles!` : `${p.stock} disponibles`}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/catalogo" className="btn btn-secondary">Ver Todo el Catálogo →</Link>
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="categories-grid">
          {[
            { icon: '🚚', title: 'Envío Gratis', desc: 'En compras mayores a $1,500' },
            { icon: '🔄', title: 'Devolución Fácil', desc: '30 días para cambios y devoluciones' },
            { icon: '🛡️', title: 'Pago Seguro', desc: 'Transacciones 100% protegidas' },
            { icon: '⭐', title: 'Calidad Premium', desc: 'Materiales de primera calidad' },
          ].map((f, i) => (
            <div key={i} className="stat-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem', color: 'var(--text-primary)' }}>{f.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
