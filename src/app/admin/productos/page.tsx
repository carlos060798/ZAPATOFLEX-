'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Product {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  categoria: { nombre: string };
}

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  function fetchProducts() {
    fetch('/api/products?limit=100')
      .then(r => r.json())
      .then(d => setProducts(d.productos || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchProducts(); }, []);

  async function handleDelete(id: number) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchProducts();
  }

  return (
    <>
      <div className="admin-header">
        <h1>📦 Gestión de Productos</h1>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                <td>{p.categoria.nombre}</td>
                <td>${p.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                <td>
                  <span className={p.stock === 0 ? 'card-stock out' : p.stock <= 5 ? 'card-stock low' : ''}>
                    {p.stock}
                  </span>
                </td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
