import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

/**
 * ProtectedRoute component that guards routes requiring authentication.
 * 
 * @param {React.ReactNode} children - The component to render if authenticated
 * @param {string[]} allowedRoles - Optional array of roles allowed to access this route
 *                                   e.g. ['ADMIN'], ['RECRUITER', 'SECURITY_ADMIN']
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    // Show nothing while checking auth state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Not logged in â€” redirect to login with return path
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // User is authenticated but wrong role â€” redirect to their appropriate dashboard
        if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'RECRUITER') return <Navigate to="/recruiter/dashboard" replace />;
        if (user.role === 'SECURITY_ADMIN') return <Navigate to="/recruiter/security/dashboard" replace />;
        return <Navigate to="/jobs" replace />;
    }

    return children;
};

export default ProtectedRoute;
