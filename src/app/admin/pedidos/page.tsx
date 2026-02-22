'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Order {
  id: number;
  fecha: string;
  estado: string;
  total: number;
  usuario: { nombre: string; email: string };
  pago: { estado: string; referencia: string } | null;
}

const ESTADOS = ['PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  function fetchOrders() {
    fetch('/api/orders?all=true', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setOrders(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { if (token) fetchOrders(); }, [token]);

  async function updateStatus(id: number, estado: string) {
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ estado }),
    });
    fetchOrders();
  }

  return (
    <>
      <div className="admin-header">
        <h1>🧾 Gestión de Pedidos</h1>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Pago</th>
              <th>Estado</th>
              <th>Cambiar Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td className="order-id">#{o.id}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{o.usuario?.nombre}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.usuario?.email}</div>
                </td>
                <td>{new Date(o.fecha).toLocaleDateString('es-MX')}</td>
                <td style={{ fontWeight: 600 }}>${o.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                <td>
                  {o.pago ? (
                    <span className={`status-badge status-${o.pago.estado}`}>{o.pago.estado}</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Sin pago</span>
                  )}
                </td>
                <td><span className={`status-badge status-${o.estado}`}>{o.estado}</span></td>
                <td>
                  <select
                    className="form-select"
                    style={{ maxWidth: 180, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                    value={o.estado}
                    onChange={e => updateStatus(o.id, e.target.value)}
                  >
                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay pedidos</td></tr>
            )}
          </tbody>
        </table>
      )}
    </>
  );
}
