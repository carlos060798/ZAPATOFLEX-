'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
  const { user, token } = useAuth();
  const { cart, fetchCart } = useCart();
  const router = useRouter();

  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'address' | 'payment' | 'success'>('address');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paymentResult, setPaymentResult] = useState<{ exitoso: boolean; mensaje: string; pago: { referencia: string } } | null>(null);

  useEffect(() => {
    if (!user) router.push('/login');
    else fetchCart();
  }, [user]);

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ direccion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrderId(data.id);
      setStep('payment');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear pedido');
    } finally { setLoading(false); }
  }

  async function handlePayment() {
    if (!orderId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pedidoId: orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPaymentResult(data);
      if (data.exitoso) {
        setStep('success');
        fetchCart();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error en el pago');
    } finally { setLoading(false); }
  }

  if (!user) return null;

  const total = cart?.total || 0;
  const shipping = total >= 1500 ? 0 : 99;

  return (
    <div className="checkout-page">
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>
        {step === 'success' ? '✅ Pedido Confirmado' : '💳 Checkout'}
      </h1>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {['Dirección', 'Pago', 'Confirmación'].map((s, i) => (
          <div key={i} style={{
            flex: 1, padding: '0.75rem', textAlign: 'center', borderRadius: 'var(--radius-sm)',
            background: i <= ['address', 'payment', 'success'].indexOf(step) ? 'rgba(212,168,83,0.15)' : 'var(--bg-card)',
            border: `1px solid ${i <= ['address', 'payment', 'success'].indexOf(step) ? 'var(--accent-gold)' : 'var(--border)'}`,
            color: i <= ['address', 'payment', 'success'].indexOf(step) ? 'var(--accent-gold)' : 'var(--text-muted)',
            fontWeight: 600, fontSize: '0.85rem',
          }}>
            {i + 1}. {s}
          </div>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {step === 'address' && (
        <div className="checkout-grid">
          <div>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>Dirección de Envío</h2>
            <form onSubmit={handleCreateOrder}>
              <div className="form-group">
                <label className="form-label">Dirección completa</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Calle, número, colonia, ciudad, estado, CP"
                  value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Procesando...' : 'Continuar al Pago →'}
              </button>
            </form>
          </div>

          <div className="order-summary-card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Resumen del Pedido</h3>
            {cart?.items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{item.producto.nombre} × {item.cantidad}</span>
                <span>${(item.producto.precio * item.cantidad).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: '1rem', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                <span>Envío</span>
                <span style={{ color: shipping === 0 ? 'var(--success)' : undefined }}>{shipping === 0 ? 'Gratis' : `$${shipping}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent-gold)' }}>${(total + shipping).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <div className="order-summary-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Simulación de Pago</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Pedido #{orderId} — Total: <strong style={{ color: 'var(--accent-gold)' }}>
                ${(total + shipping).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </strong>
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Este es un pago simulado. Haz clic en el botón para procesar.
            </p>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handlePayment} disabled={loading}>
              {loading ? 'Procesando pago...' : '🔒 Pagar Ahora'}
            </button>
            {paymentResult && !paymentResult.exitoso && (
              <div className="alert alert-error" style={{ marginTop: '1rem' }}>{paymentResult.mensaje}</div>
            )}
          </div>
        </div>
      )}

      {step === 'success' && paymentResult && (
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
          <div className="order-summary-card">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>¡Pago Exitoso!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{paymentResult.mensaje}</p>
            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Referencia de pago</div>
              <div style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-gold)' }}>
                {paymentResult.pago.referencia}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <a href={`/pedidos`} className="btn btn-primary">Ver Mis Pedidos</a>
              <a href="/catalogo" className="btn btn-secondary">Seguir Comprando</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
