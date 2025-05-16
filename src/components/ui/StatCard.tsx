import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string | number;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  color = 'primary'
}) => {
  const getColorClass = () => {
    switch (color) {
      case 'primary':
        return 'text-primary-500';
      case 'secondary':
        return 'text-secondary-500';
      case 'accent':
        return 'text-accent-500';
      case 'success':
        return 'text-success-500';
      case 'warning':
        return 'text-warning-500';
      case 'error':
        return 'text-error-500';
      default:
        return 'text-primary-500';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-success-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      );
    }
    if (trend === 'down') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-error-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-text-secondary mb-1">
            {title}
          </h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold">{value}</span>
            {trend && trendValue && (
              <div className="flex items-center ml-2 mb-1">
                {getTrendIcon()}
                <span
                  className={`text-xs ml-1 ${
                    trend === 'up'
                      ? 'text-success-500'
                      : trend === 'down'
                      ? 'text-error-500'
                      : 'text-text-secondary'
                  }`}
                >
                  {trendValue}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className={`p-2 rounded-lg ${getColorClass()} bg-opacity-10`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;