import React from 'react';
import { Tag } from 'antd';
import { TicketStatus, TicketPriority } from '../types';

interface StatusBadgeProps {
  type: 'status' | 'priority';
  value: TicketStatus | TicketPriority;
}

const statusColors: Record<TicketStatus, { color: string; text: string }> = {
  [TicketStatus.OPEN]: { color: 'blue', text: 'Abierto' },
  [TicketStatus.IN_PROGRESS]: { color: 'processing', text: 'En Progreso' },
  [TicketStatus.WAITING]: { color: 'orange', text: 'En Espera' },
  [TicketStatus.RESOLVED]: { color: 'green', text: 'Resuelto' },
  [TicketStatus.CLOSED]: { color: 'default', text: 'Cerrado' }
};

const priorityColors: Record<TicketPriority, { color: string; text: string }> = {
  [TicketPriority.LOW]: { color: 'green', text: 'Baja' },
  [TicketPriority.MEDIUM]: { color: 'blue', text: 'Media' },
  [TicketPriority.HIGH]: { color: 'orange', text: 'Alta' },
  [TicketPriority.URGENT]: { color: 'red', text: 'Urgente' }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value }) => {
  const colors = type === 'status' ? statusColors : priorityColors;
  const { color, text } = colors[value as TicketStatus | TicketPriority];

  return (
    <Tag color={color}>
      {text}
    </Tag>
  );
}; 