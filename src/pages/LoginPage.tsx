import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Logo from '../components/ui/Logo';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login, isLoading, isAuthenticated } = useAuth();
  const { changeLanguage, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError(t('errors.required'));
      return;
    }
    
    try {
      await login(email, password);
    } catch (err: any) {
      console.error('Error en login:', err);
      if (err.message) {
        setError(err.message);
      } else {
        setError(t('errors.somethingWentWrong'));
      }
    }
  };

  const toggleLanguageDropdown = () => {
    setShowLanguageDropdown(!showLanguageDropdown);
  };

  const handleChangeLanguage = (lang: 'en' | 'es') => {
    changeLanguage(lang);
    setShowLanguageDropdown(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark">
      <div className="absolute top-4 right-4">
        <div className="relative">
          <button 
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            onClick={toggleLanguageDropdown}
          >
            <Globe size={20} className="text-text-primary" />
          </button>
          
          {showLanguageDropdown && (
            <div className="absolute right-0 mt-2 w-40 rounded-lg bg-background-card shadow-lg overflow-hidden">
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
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col flex-grow items-center justify-center p-4">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo size="large" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{t('auth.welcomeBack')}</h1>
            <p className="text-text-secondary">{t('auth.signInMessage')}</p>
          </div>
          
          <div className="bg-background-card shadow-lg rounded-xl p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                  {t('auth.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                />
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                    {t('auth.password')}
                  </label>
                  <a href="#" className="text-xs text-primary-500 hover:text-primary-600">
                    {t('auth.forgotPassword')}
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                />
              </div>
              
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-error-500 bg-opacity-10 text-error-500 text-sm">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    <span>{t('common.loading')}...</span>
                  </div>
                ) : (
                  t('auth.signin')
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
      
      <footer className="py-6 text-center text-text-secondary text-sm">
        &copy; {new Date().getFullYear()} EscalAI. {t('app.tagline')}
      </footer>
    </div>
  );
};

export default LoginPage;