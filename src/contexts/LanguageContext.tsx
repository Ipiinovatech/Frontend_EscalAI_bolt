import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';

interface LanguageContextProps {
  changeLanguage: (lang: 'en' | 'es') => void;
  currentLanguage: 'en' | 'es';
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const { user, updateUserLanguage } = useAuth();

  // Set language based on user preference or browser default
  useEffect(() => {
    if (user?.language) {
      i18n.changeLanguage(user.language);
    }
  }, [user, i18n]);

  const changeLanguage = async (lang: 'en' | 'es') => {
    await i18n.changeLanguage(lang);
    
    if (user) {
      // Update user preference if logged in
      await updateUserLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        changeLanguage,
        currentLanguage: (i18n.language as 'en' | 'es') || 'en',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};