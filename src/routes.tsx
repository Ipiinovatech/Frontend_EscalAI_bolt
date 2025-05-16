import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DashboardPageAdmin from './pages/DashboardPageAdmin';
import TicketsPage from './pages/TicketsPage';
import NewTicketPage from './pages/tickets/new';
import MainLayout from './components/layout/MainLayout';
import PrivateRoute from './components/PrivateRoute';

const LoadingScreen: React.FC = () => {
  const [dots, setDots] = React.useState('');

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-dark">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-text-primary">Cargando{dots}</p>
        <p className="mt-2 text-sm text-text-secondary">Por favor espere mientras se inicializa la aplicación</p>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { isLoading, isAuthenticated, user } = useAuth();
  const [initialLoad, setInitialLoad] = React.useState(true);

  React.useEffect(() => {
    if (!isLoading) {
      setInitialLoad(false);
    }
  }, [isLoading]);

  if (initialLoad || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? (
          user?.email === 'admin@example.com' ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/tickets" replace />
        ) : <LoginPage />
      } />
      
      <Route element={<MainLayout />}>
        <Route index element={
          user?.email === 'admin@example.com' ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/tickets" replace />
        } />
        <Route path="dashboard" element={
          <PrivateRoute>
            {user?.email === 'admin@example.com' ? <DashboardPageAdmin /> : <DashboardPage />}
          </PrivateRoute>
        } />
        <Route path="tickets" element={
          <PrivateRoute>
            <TicketsPage />
          </PrivateRoute>
        } />
        <Route path="tickets/new" element={
          <PrivateRoute>
            <NewTicketPage />
          </PrivateRoute>
        } />
        <Route path="*" element={
          user?.email === 'admin@example.com' ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/tickets" replace />
        } />
      </Route>
    </Routes>
  );
};

export default AppRoutes; 