import React from 'react';
import { motion } from 'framer-motion';
import { TicketStatus, SLAStatus } from '../../types';

interface StatusBadgeProps {
  status: TicketStatus | SLAStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      // Ticket Statuses
      case TicketStatus.OPEN:
        return {
          label: 'Open',
          bgColor: 'bg-blue-500 bg-opacity-20',
          textColor: 'text-blue-500',
        };
      case TicketStatus.IN_PROGRESS:
        return {
          label: 'In Progress',
          bgColor: 'bg-accent-500 bg-opacity-20',
          textColor: 'text-accent-500',
        };
      case TicketStatus.RESOLVED:
        return {
          label: 'Resolved',
          bgColor: 'bg-success-500 bg-opacity-20',
          textColor: 'text-success-500',
        };
      case TicketStatus.CLOSED:
        return {
          label: 'Closed',
          bgColor: 'bg-gray-500 bg-opacity-20',
          textColor: 'text-gray-400',
        };
      case TicketStatus.REOPENED:
        return {
          label: 'Reopened',
          bgColor: 'bg-purple-500 bg-opacity-20',
          textColor: 'text-purple-500',
        };
      case TicketStatus.ESCALATED:
        return {
          label: 'Escalated',
          bgColor: 'bg-secondary-500 bg-opacity-20',
          textColor: 'text-secondary-500',
        };
        
      // SLA Statuses
      case SLAStatus.ON_TIME:
        return {
          label: 'On Time',
          bgColor: 'bg-success-500 bg-opacity-20',
          textColor: 'text-success-500',
        };
      case SLAStatus.NEAR_DEADLINE:
        return {
          label: 'Near Deadline',
          bgColor: 'bg-warning-500 bg-opacity-20',
          textColor: 'text-warning-500',
        };
      case SLAStatus.OVERDUE:
        return {
          label: 'Overdue',
          bgColor: 'bg-error-500 bg-opacity-20',
          textColor: 'text-error-500',
        };
      default:
        return {
          label: status,
          bgColor: 'bg-gray-500 bg-opacity-20',
          textColor: 'text-gray-400',
        };
    }
  };

  const { label, bgColor, textColor } = getStatusConfig();

  return (
    <motion.span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {label}
    </motion.span>
  );
};

export default StatusBadge;