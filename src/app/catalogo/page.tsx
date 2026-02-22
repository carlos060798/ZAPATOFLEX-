'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

interface Product {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: { id: number; nombre: string };
  imagenes: { url: string }[];
}

interface Category {
  id: number;
  nombre: string;
  _count: { productos: number };
}

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const { user, token } = useAuth();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoriaId, setCategoriaId] = useState(searchParams.get('categoriaId') || '');
  const [orderBy, setOrderBy] = useState('reciente');
  const [page, setPage] = useState(1);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d || []));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [categoriaId, orderBy, page]);

  function fetchProducts() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categoriaId) params.set('categoriaId', categoriaId);
    params.set('orderBy', orderBy);
    params.set('page', String(page));
    params.set('limit', '12');
    
    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(d => {
        setProducts(d.productos || []);
        setPagination(d.pagination || { page: 1, totalPages: 1, total: 0 });
      })
      .finally(() => setLoading(false));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  }

  async function handleAddToCart(productoId: number) {
    if (!user || !token) {
      window.location.href = '/login';
      return;
    }
    setAddingToCart(productoId);
    try {
      await addToCart(productoId, 1);
    } catch { /* ignore */ }
    finally { setAddingToCart(null); }
  }

  return (
    <>
      <div className="page-header">
        <h1>Catálogo</h1>
        <p>Explora nuestra colección completa de calzado premium</p>
      </div>
      
      <div className="section">
        {/* Filters */}
        <div className="filters-bar">
          <form onSubmit={handleSearch} className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="form-input"
              placeholder="Buscar productos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </form>

          <select
            className="form-select"
            style={{ maxWidth: 200 }}
            value={categoriaId}
            onChange={e => { setCategoriaId(e.target.value); setPage(1); }}
          >
            <option value="">Todas las categorías</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.nombre} ({c._count.productos})</option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ maxWidth: 200 }}
            value={orderBy}
            onChange={e => { setOrderBy(e.target.value); setPage(1); }}
          >
            <option value="reciente">Más recientes</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
            <option value="nombre">Nombre A-Z</option>
          </select>
        </div>

        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          {pagination.total} productos encontrados
        </p>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🔍</div>
            <h3>No se encontraron productos</h3>
            <p>Intenta con otros filtros o términos de búsqueda</p>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {products.map(p => (
                <div key={p.id} className="card">
                  <Link href={`/producto/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card-img">👟</div>
                    <div className="card-body">
                      <div className="card-category">{p.categoria.nombre}</div>
                      <h3 className="card-title">{p.nombre}</h3>
                      <div className="card-price">${p.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                    </div>
                  </Link>
                  <div style={{ padding: '0 1.25rem 1.25rem' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%' }}
                      disabled={p.stock === 0 || addingToCart === p.id}
                      onClick={() => handleAddToCart(p.id)}
                    >
                      {p.stock === 0 ? 'Agotado' : addingToCart === p.id ? 'Agregando...' : '🛒 Agregar al Carrito'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Anterior</button>
                {Array.from({ length: pagination.totalPages }, (_, i) => (
                  <button key={i} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </button>
                ))}
                <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Siguiente →</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="loading-spinner"><div className="spinner"></div></div>}>
      <CatalogContent />
    </Suspense>
  );
}
