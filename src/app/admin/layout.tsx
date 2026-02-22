'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.rol !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!user || user.rol !== 'ADMIN') return null;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>⚙️ Admin</h2>
        <ul className="admin-nav">
          <li><Link href="/admin">📊 Dashboard</Link></li>
          <li><Link href="/admin/productos">📦 Productos</Link></li>
          <li><Link href="/admin/pedidos">🧾 Pedidos</Link></li>
          <li><Link href="/admin/inventario">📋 Inventario</Link></li>
        </ul>
      </aside>
      <div className="admin-content">
        {children}
      </div>
    </div>
  );
}
