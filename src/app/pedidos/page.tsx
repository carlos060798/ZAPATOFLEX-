'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface OrderItem {
  id: number;
  cantidad: number;
  precioUnit: number;
  producto: { id: number; nombre: string; imagenes: { url: string }[] };
}

interface Order {
  id: number;
  fecha: string;
  estado: string;
  total: number;
  direccion: string;
  items: OrderItem[];
  pago: { estado: string; referencia: string; metodo: string } | null;
}

export default function OrdersPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setOrders(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [user, token, router]);

  if (!user) return null;

  return (
    <div className="orders-page">
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>📦 Mis Pedidos</h1>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📦</div>
          <h3>No tienes pedidos aún</h3>
          <p>Explora nuestro catálogo y realiza tu primera compra</p>
          <Link href="/catalogo" className="btn btn-primary" style={{ marginTop: '1rem' }}>Ir al Catálogo</Link>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <span className="order-id">Pedido #{order.id}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: '1rem', fontSize: '0.85rem' }}>
                  {new Date(order.fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className={`status-badge status-${order.estado}`}>{order.estado}</span>
                {order.pago && <span className={`status-badge status-${order.pago.estado}`}>Pago: {order.pago.estado}</span>}
              </div>
            </div>
            
            {order.items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '1px solid var(--border)', fontSize: '0.9rem' }}>
                <span>
                  <Link href={`/producto/${item.producto.id}`}>{item.producto.nombre}</Link>
                  <span style={{ color: 'var(--text-muted)' }}> × {item.cantidad}</span>
                </span>
                <span style={{ fontWeight: 600 }}>${(item.precioUnit * item.cantidad).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
              <div>
                {order.pago && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Ref: {order.pago.referencia}
                  </span>
                )}
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-gold)' }}>
                Total: ${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
