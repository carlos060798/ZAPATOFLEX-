'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchUser(t: string) {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch {
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error en el login');
    setUser(data.usuario);
    setToken(data.token);
    localStorage.setItem('token', data.token);
  }

  async function register(nombre: string, email: string, password: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error en el registro');
    setUser(data.usuario);
    setToken(data.token);
    localStorage.setItem('token', data.token);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
