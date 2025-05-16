import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layers } from 'lucide-react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'icon';
}

const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
  const { t } = useTranslation();

  const renderIcon = () => {
    return (
      <div className="relative">
        <div 
          className="w-8 h-8 bg-gradient-to-br from-secondary-500 via-accent-500 to-primary-500 rounded"
          style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
        ></div>
        <Layers 
          size={16} 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white" 
        />
      </div>
    );
  };

  if (size === 'icon') {
    return renderIcon();
  }

  return (
    <div className="flex items-center">
      {renderIcon()}
      <span 
        className={`ml-2 font-bold text-text-primary ${
          size === 'small' ? 'text-lg' 
            : size === 'large' ? 'text-3xl' 
            : 'text-xl'
        }`}
      >
        {t('app.name')}
      </span>
    </div>
  );
};

export default Logo;