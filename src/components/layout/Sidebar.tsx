import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Ticket, 
  TrendingUp, 
  BarChart4, 
  Users, 
  Settings, 
  ChevronLeft, 
  Menu, 
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import Logo from '../ui/Logo';

interface SidebarProps {
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Define navigation items based on user role
  const getNavigationItems = () => {
    const items = [
      {
        name: t('navigation.dashboard'),
        icon: <LayoutDashboard size={20} />,
        path: '/dashboard',
        allowedRoles: [UserRole.PLATFORM_ADMIN, UserRole.CLIENT_SUPERVISOR, UserRole.CLIENT_AGENT, UserRole.CLIENT_EXECUTIVE],
      },
      {
        name: t('navigation.tickets'),
        icon: <Ticket size={20} />,
        path: '/tickets',
        allowedRoles: [UserRole.PLATFORM_ADMIN, UserRole.CLIENT_SUPERVISOR, UserRole.CLIENT_AGENT, UserRole.CLIENT_EXECUTIVE, UserRole.EXTERNAL_CLIENT],
      },
      {
        name: t('navigation.escalation'),
        icon: <TrendingUp size={20} />,
        path: '/escalation',
        allowedRoles: [UserRole.PLATFORM_ADMIN, UserRole.CLIENT_SUPERVISOR],
      },
      {
        name: t('navigation.reports'),
        icon: <BarChart4 size={20} />,
        path: '/reports',
        allowedRoles: [UserRole.PLATFORM_ADMIN, UserRole.CLIENT_SUPERVISOR, UserRole.CLIENT_EXECUTIVE],
      },
      {
        name: t('navigation.users'),
        icon: <Users size={20} />,
        path: '/users',
        allowedRoles: [UserRole.PLATFORM_ADMIN, UserRole.CLIENT_SUPERVISOR],
      },
      {
        name: t('navigation.settings'),
        icon: <Settings size={20} />,
        path: '/settings',
        allowedRoles: [UserRole.PLATFORM_ADMIN, UserRole.CLIENT_SUPERVISOR],
      },
    ];

    // Filter items based on user role
    return items.filter(
      (item) => !user?.role || item.allowedRoles.includes(user.role)
    );
  };

  const navItems = getNavigationItems();

  // Animation variants
  const sidebarVariants = {
    expanded: { width: 240 },
    collapsed: { width: 80 }
  };

  const mobileSidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' }
  };

  if (!user) return null;

  if (isMobile) {
    return (
      <>
        <button 
          onClick={toggleMobileSidebar} 
          className="fixed top-4 left-4 z-30 p-2 rounded-md bg-background-card"
        >
          <Menu size={24} className="text-text-primary" />
        </button>
        
        <motion.div 
          className="fixed top-0 left-0 z-40 h-full bg-background-dark shadow-xl"
          initial="closed"
          animate={isMobileOpen ? "open" : "closed"}
          variants={mobileSidebarVariants}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="flex flex-col h-full w-64">
            <div className="p-4 border-b border-gray-800">
              <Logo size="small" />
            </div>
            
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-1 px-2">
                {navItems.map((item) => (
                  <div
                    key={item.path}
                    className={`flex items-center px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary-500 bg-opacity-20 text-primary-500'
                        : 'text-text-primary hover:bg-gray-800'
                    }`}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileOpen(false);
                    }}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                ))}
              </nav>
            </div>
            
            <div className="p-4 border-t border-gray-800">
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-3 w-full rounded-lg text-text-primary hover:bg-gray-800 transition-colors"
              >
                <LogOut size={20} className="mr-3" />
                <span className="font-medium">{t('auth.signout')}</span>
              </button>
            </div>
          </div>
        </motion.div>
        
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <motion.div
      className="h-screen bg-background-dark shadow-xl flex flex-col"
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className={`p-4 border-b border-gray-800 flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center`}>
        {!isCollapsed ? (
          <Logo size="small" />
        ) : (
          <Logo size="icon" />
        )}
        
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-gray-800 transition-colors text-text-primary"
        >
          <ChevronLeft 
            size={20} 
            className={`transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
          />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <div
              key={item.path}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-3 rounded-lg cursor-pointer transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary-500 bg-opacity-20 text-primary-500'
                  : 'text-text-primary hover:bg-gray-800'
              }`}
              onClick={() => navigate(item.path)}
            >
              <span className={isCollapsed ? '' : 'mr-3'}>{item.icon}</span>
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
            </div>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-3 w-full rounded-lg text-text-primary hover:bg-gray-800 transition-colors`}
        >
          <LogOut size={20} className={isCollapsed ? '' : 'mr-3'} />
          {!isCollapsed && <span className="font-medium">{t('auth.signout')}</span>}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;