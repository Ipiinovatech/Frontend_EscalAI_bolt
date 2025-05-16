import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setInitialLoad(false);
    }
  }, [isLoading]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Si no está autenticado, redirigir al login
  if (!initialLoad && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Mostrar pantalla de carga durante la carga inicial
  if (initialLoad || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-text-primary">{t('common.loading')}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background-dark">
      <Sidebar isMobile={isMobile} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;