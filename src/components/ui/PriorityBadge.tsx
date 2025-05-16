import React from 'react';
import { motion } from 'framer-motion';
import { TicketPriority } from '../../types';
import { ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TicketPriority;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case TicketPriority.HIGH:
        return {
          label: 'High',
          bgColor: 'bg-error-500 bg-opacity-20',
          textColor: 'text-error-500',
          icon: <ArrowUp size={12} className="mr-1" />,
        };
      case TicketPriority.MEDIUM:
        return {
          label: 'Medium',
          bgColor: 'bg-warning-500 bg-opacity-20',
          textColor: 'text-warning-500',
          icon: <ArrowRight size={12} className="mr-1" />,
        };
      case TicketPriority.LOW:
        return {
          label: 'Low',
          bgColor: 'bg-success-500 bg-opacity-20',
          textColor: 'text-success-500',
          icon: <ArrowDown size={12} className="mr-1" />,
        };
      default:
        return {
          label: priority,
          bgColor: 'bg-gray-500 bg-opacity-20',
          textColor: 'text-gray-400',
          icon: null,
        };
    }
  };

  const { label, bgColor, textColor, icon } = getPriorityConfig();

  return (
    <motion.span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {icon}
      {label}
    </motion.span>
  );
};

export default PriorityBadge;