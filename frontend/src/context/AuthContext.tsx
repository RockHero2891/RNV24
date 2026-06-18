import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, setAuthToken, type User } from '../services/api';

export interface UserWithAdmin extends User {
  isAdmin?: boolean;
}

interface AuthContextValue {
  user: UserWithAdmin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rnv24_token');
    if (!token) { setLoading(false); return; }
    api.me()
      .then(({ user }) => setUser(user as UserWithAdmin))
      .catch(() => setAuthToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await api.login(email, password);
    setAuthToken(token);
    setUser(user as UserWithAdmin);
  };

  const register = async (email: string, password: string, name: string) => {
    const { token, user } = await api.register(email, password, name);
    setAuthToken(token);
    setUser(user as UserWithAdmin);
  };

  const logout = () => { setAuthToken(null); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
