import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
    allowedRoles: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { token, logout } = useAuthStore();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decoded = jwtDecode<{ role: string; exp: number }>(token);
        
        if (Date.now() >= decoded.exp * 1000) {
            logout();
            return <Navigate to="/login" replace />;
        }
        
        if (!allowedRoles.includes(decoded.role)) {
            if (decoded.role === 'CANDIDATE') return <Navigate to="/careers" replace />;
            return <Navigate to="/dashboard" replace />;
        }
        
        return <Outlet />;
    } catch {
        logout();
        return <Navigate to="/login" replace />;
    }
}
