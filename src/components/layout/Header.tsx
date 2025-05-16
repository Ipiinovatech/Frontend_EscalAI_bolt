import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, User, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { changeLanguage, currentLanguage } = useLanguage();
  const { user } = useAuth();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const toggleLanguageDropdown = () => {
    setShowLanguageDropdown(!showLanguageDropdown);
    if (showUserDropdown) setShowUserDropdown(false);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
    if (showLanguageDropdown) setShowLanguageDropdown(false);
  };

  const handleChangeLanguage = (lang: 'en' | 'es') => {
    changeLanguage(lang);
    setShowLanguageDropdown(false);
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  return (
    <header className="bg-background-card shadow-md py-3 px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary">
          {user?.name ? `Welcome, ${user.name}` : t('app.name')}
        </h1>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-800 transition-colors relative">
            <Bell size={20} className="text-text-primary" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-primary-500 rounded-full"></span>
          </button>
          
          <div className="relative">
            <button 
              className="p-2 rounded-full hover:bg-gray-800 transition-colors flex items-center"
              onClick={toggleLanguageDropdown}
            >
              <Globe size={20} className="text-text-primary" />
            </button>
            
            <AnimatePresence>
              {showLanguageDropdown && (
                <motion.div 
                  className="absolute right-0 mt-2 w-40 rounded-lg bg-background-card shadow-lg z-10 overflow-hidden"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dropdownVariants}
                  transition={{ duration: 0.2 }}
                >
                  <div className="py-1">
                    <button
                      className={`px-4 py-2 text-sm w-full text-left ${
                        currentLanguage === 'en' ? 'bg-primary-500 bg-opacity-20 text-primary-500' : 'text-text-primary hover:bg-gray-800'
                      }`}
                      onClick={() => handleChangeLanguage('en')}
                    >
                      English
                    </button>
                    <button
                      className={`px-4 py-2 text-sm w-full text-left ${
                        currentLanguage === 'es' ? 'bg-primary-500 bg-opacity-20 text-primary-500' : 'text-text-primary hover:bg-gray-800'
                      }`}
                      onClick={() => handleChangeLanguage('es')}
                    >
                      Español
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="relative">
            <button 
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-800 transition-colors"
              onClick={toggleUserDropdown}
            >
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
            </button>
            
            <AnimatePresence>
              {showUserDropdown && (
                <motion.div 
                  className="absolute right-0 mt-2 w-48 rounded-lg bg-background-card shadow-lg z-10 overflow-hidden"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dropdownVariants}
                  transition={{ duration: 0.2 }}
                >
                  <div className="py-2 px-4">
                    <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                    <p className="text-xs text-text-secondary mt-1">{user?.email}</p>
                    <p className="text-xs text-primary-500 mt-1 capitalize">
                      {user?.role.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="border-t border-gray-800">
                    <button className="px-4 py-2 text-sm w-full text-left text-text-primary hover:bg-gray-800">
                      {t('navigation.settings')}
                    </button>
                    <button className="px-4 py-2 text-sm w-full text-left text-error-500 hover:bg-gray-800">
                      {t('auth.signout')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;