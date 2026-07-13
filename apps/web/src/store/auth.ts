import { create } from 'zustand';

export type UserRole = 'TENANT_OWNER' | 'STORE_MANAGER' | 'SALES' | 'KEEPER' | 'PLATFORM_ADMIN' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  tenantId: string;
  storeId?: string;
  tenantName?: string;
  storeName?: string;
  lastLoginAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}));
