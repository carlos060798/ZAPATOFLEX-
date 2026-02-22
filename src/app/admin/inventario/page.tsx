'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface InventoryItem {
  productoId: number;
  nombre: string;
  categoria: string;
  cantidad: number;
  minimo: number;
  estado: string;
}

interface InventoryReport {
  resumen: { totalProductos: number; sinStock: number; bajoStock: number; enStock: number };
  items: InventoryItem[];
}

export default function AdminInventoryPage() {
  const { token } = useAuth();
  const [report, setReport] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [editQty, setEditQty] = useState(0);

  function fetchInventory() {
    fetch('/api/inventory', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setReport(d))
      .finally(() => setLoading(false));
  }

  useEffect(() => { if (token) fetchInventory(); }, [token]);

  async function updateStock(productoId: number) {
    await fetch('/api/inventory', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ productoId, cantidad: editQty }),
    });
    setEditing(null);
    fetchInventory();
  }

  return (
    <>
      <div className="admin-header">
        <h1>📋 Gestión de Inventario</h1>
      </div>

      {report && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="label">Total Productos</div>
            <div className="value">{report.resumen.totalProductos}</div>
          </div>
          <div className="stat-card">
            <div className="label">En Stock</div>
            <div className="value" style={{ WebkitTextFillColor: 'var(--success)' }}>{report.resumen.enStock}</div>
          </div>
          <div className="stat-card">
            <div className="label">Bajo Stock</div>
            <div className="value" style={{ WebkitTextFillColor: 'var(--warning)' }}>{report.resumen.bajoStock}</div>
          </div>
          <div className="stat-card">
            <div className="label">Sin Stock</div>
            <div className="value" style={{ WebkitTextFillColor: 'var(--danger)' }}>{report.resumen.sinStock}</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Cantidad</th>
              <th>Mínimo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {report?.items.map(item => (
              <tr key={item.productoId}>
                <td style={{ fontWeight: 600 }}>{item.nombre}</td>
                <td>{item.categoria}</td>
                <td>
                  {editing === item.productoId ? (
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: 80, padding: '0.3rem 0.5rem' }}
                      value={editQty}
                      onChange={e => setEditQty(Number(e.target.value))}
                      min={0}
                    />
                  ) : (
                    item.cantidad
                  )}
                </td>
                <td>{item.minimo}</td>
                <td>
                  <span className={`status-badge status-${item.estado === 'SIN_STOCK' ? 'CANCELADO' : item.estado === 'BAJO_STOCK' ? 'PENDIENTE' : 'CONFIRMADO'}`}>
                    {item.estado.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  {editing === item.productoId ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => updateStock(item.productoId)}>Guardar</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}>Cancelar</button>
                    </div>
                  ) : (
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(item.productoId); setEditQty(item.cantidad); }}>
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
