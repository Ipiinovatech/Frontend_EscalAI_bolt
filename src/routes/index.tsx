import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import LoginPage from '../pages/LoginPage';
import DashboardPageCliente from '../pages/DashboardPageCliente';
import DashboardPageAgente from '../pages/DashboardPageAgente';
import DashboardPageSupervisor from '../pages/DashboardPageSupervisor';
import DashboardPageGerente from '../pages/DashboardPageGerente';
import DashboardPageAdmin from '../pages/DashboardPageAdmin';

const PrivateRoute: React.FC<{ children: React.ReactNode; allowedRoles: UserRole[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route
        path="/dashboard"
        element={
          <PrivateRoute allowedRoles={[UserRole.CLIENT]}>
            <DashboardPageCliente />
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboard/agente"
        element={
          <PrivateRoute allowedRoles={[UserRole.AGENT]}>
            <DashboardPageAgente />
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboard/supervisor"
        element={
          <PrivateRoute allowedRoles={[UserRole.SUPERVISOR]}>
            <DashboardPageSupervisor />
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboard/gerente"
        element={
          <PrivateRoute allowedRoles={[UserRole.MANAGER]}>
            <DashboardPageGerente />
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboard/admin"
        element={
          <PrivateRoute allowedRoles={[UserRole.ADMIN]}>
            <DashboardPageAdmin />
          </PrivateRoute>
        }
      />

      <Route path="/unauthorized" element={<div>No tienes permiso para acceder a esta página</div>} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes; 