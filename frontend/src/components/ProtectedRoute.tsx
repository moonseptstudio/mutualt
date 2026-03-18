import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLoader from './common/PageLoader';

interface ProtectedRouteProps {
    allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <PageLoader />;
    }

    if (!isAuthenticated || !user) {
        // Redirect to admin login if trying to access admin routes
        if (location.pathname.startsWith('/admin')) {
            return <Navigate to="/admin/login" state={{ from: location }} replace />;
        }
        // Redirect to standard login otherwise
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    console.log("ProtectedRoute check:", { role: user.role, allowedRoles });

    if (!allowedRoles.includes(user.role)) {
        // If logged in but unauthorized role
        if (user.role === 'ADMIN') {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
