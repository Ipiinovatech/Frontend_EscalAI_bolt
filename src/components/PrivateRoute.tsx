import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si el usuario es admin@example.com, solo permitir acceso a /dashboard
  if (user?.email === 'admin@example.com') {
    if (location.pathname !== '/dashboard') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Si se especifican roles permitidos, verificar que el usuario tenga uno de esos roles
  if (allowedRoles && user?.user_metadata?.role) {
    if (!allowedRoles.includes(user.user_metadata.role)) {
      return <Navigate to="/tickets" replace />;
    }
  }

  return <>{children}</>;
};

export default PrivateRoute; 