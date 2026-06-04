import { create } from 'zustand';
import { User, UserRole } from '@workspace/api-client-react';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  setAuth: (user, token) => {
    localStorage.setItem('access_token', token);
    set({ user, accessToken: token, isAuthenticated: true });
  },
  clearAuth: () => {
    localStorage.removeItem('access_token');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
  hasRole: (role) => {
    const user = get().user;
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  }
}));
