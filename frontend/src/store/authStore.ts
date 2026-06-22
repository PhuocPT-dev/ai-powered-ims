import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    token: string | null;
    user: { id: number; role: string; full_name: string; email?: string } | null;
    setAuth: (token: string, user: AuthState['user']) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
    hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            setAuth: (token, user) => set({ token, user }),
            logout: () => set({ token: null, user: null }),
            isAuthenticated: () => get().token !== null && get().user !== null,
            hasRole: (role: string) => get().user?.role === role,
        }),
        { name: 'auth-storage' }
    )
);
