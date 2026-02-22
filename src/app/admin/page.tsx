'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface InventoryAlert {
  productoId: number;
  nombre: string;
  categoria: string;
  cantidadActual: number;
  minimo: number;
  alerta: string;
}

interface Order {
  id: number;
  fecha: string;
  estado: string;
  total: number;
  usuario: { nombre: string };
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, totalProducts: 0 });

  useEffect(() => {
    if (!token) return;
    const h = { Authorization: `Bearer ${token}` };

    fetch('/api/orders?all=true', { headers: h })
      .then(r => r.json())
      .then(d => {
        const arr = Array.isArray(d) ? d : [];
        setOrders(arr.slice(0, 5));
        setStats(s => ({
          ...s,
          totalOrders: arr.length,
          totalRevenue: arr.reduce((sum: number, o: Order) => sum + o.total, 0),
          pendingOrders: arr.filter((o: Order) => o.estado === 'PENDIENTE').length,
        }));
      });

    fetch('/api/inventory?tipo=alertas', { headers: h })
      .then(r => r.json())
      .then(d => setAlerts(Array.isArray(d) ? d : []));

    fetch('/api/products?limit=100')
      .then(r => r.json())
      .then(d => setStats(s => ({ ...s, totalProducts: d.pagination?.total || 0 })));
  }, [token]);

  return (
    <>
      <div className="admin-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total Pedidos</div>
          <div className="value">{stats.totalOrders}</div>
        </div>
        <div className="stat-card">
          <div className="label">Ingresos Totales</div>
          <div className="value">${stats.totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-card">
          <div className="label">Pedidos Pendientes</div>
          <div className="value">{stats.pendingOrders}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Productos</div>
          <div className="value">{stats.totalProducts}</div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>⚠️ Alertas de Inventario</h2>
          {alerts.map(a => (
            <div key={a.productoId} className={`alert ${a.alerta === 'SIN_STOCK' ? 'alert-error' : 'alert-warning'}`}>
              <strong>{a.nombre}</strong> ({a.categoria}) — 
              {a.alerta === 'SIN_STOCK' ? ' Sin stock' : ` Solo ${a.cantidadActual} unidades (mínimo: ${a.minimo})`}
            </div>
          ))}
        </div>
      )}

      <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>🧾 Últimos Pedidos</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td className="order-id">#{o.id}</td>
              <td>{o.usuario?.nombre || 'N/A'}</td>
              <td>{new Date(o.fecha).toLocaleDateString('es-MX')}</td>
              <td><span className={`status-badge status-${o.estado}`}>{o.estado}</span></td>
              <td style={{ fontWeight: 600 }}>${o.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay pedidos</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}
