import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '../ui/StatusBadge';
import PriorityBadge from '../ui/PriorityBadge';
import { Ticket, TicketStatus, TicketPriority, SLAStatus } from '../../types';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '../ui/table';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TicketsListProps {
  tickets: Partial<Ticket>[];
  isLoading?: boolean;
}

const TicketsList: React.FC<TicketsListProps> = ({ tickets, isLoading = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set());

  const toggleTicket = (ticketId: string) => {
    setExpandedTickets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ticketId)) {
        newSet.delete(ticketId);
      } else {
        newSet.add(ticketId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="py-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-background-card rounded-lg p-4">
              <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-700 rounded w-1/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!tickets.length) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">{t('common.noResults')}</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>{t('tickets.id')}</TableHead>
            <TableHead>{t('tickets.title')}</TableHead>
            <TableHead>{t('tickets.status')}</TableHead>
            <TableHead>{t('tickets.priority')}</TableHead>
            <TableHead>{t('tickets.createdAt')}</TableHead>
            <TableHead>{t('tickets.updatedAt')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <React.Fragment key={ticket.id}>
              <TableRow 
                className="cursor-pointer hover:bg-gray-800/50"
                onClick={() => toggleTicket(ticket.id!)}
              >
                <TableCell>
                  {expandedTickets.has(ticket.id!) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </TableCell>
                <TableCell>#{ticket.id?.toString().slice(-4)}</TableCell>
                <TableCell>{ticket.title}</TableCell>
                <TableCell>
                  <StatusBadge status={ticket.status as TicketStatus} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={ticket.priority as TicketPriority} />
                </TableCell>
                <TableCell>
                  {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '-'}
                </TableCell>
                <TableCell>
                  {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '-'}
                </TableCell>
              </TableRow>
              <AnimatePresence>
                {expandedTickets.has(ticket.id!) && (
                  <TableRow>
                    <TableCell colSpan={7} className="bg-gray-800/30">
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-4 space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-text-secondary mb-2">{t('tickets.description')}</h3>
                            <p className="text-sm">{ticket.description}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-text-secondary mb-2">{t('tickets.type')}</h3>
                            <p className="text-sm">{t(`tickets.types.${ticket.type}`)}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-text-secondary mb-2">{t('tickets.category')}</h3>
                            <p className="text-sm">{ticket.category || '-'}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-text-secondary mb-2">{t('tickets.subcategory')}</h3>
                            <p className="text-sm">{ticket.subcategory || '-'}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-text-secondary mb-2">{t('tickets.assignedTo')}</h3>
                            <p className="text-sm">{ticket.assignedTo || '-'}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-text-secondary mb-2">{t('tickets.clientName')}</h3>
                            <p className="text-sm">{ticket.clientName || '-'}</p>
                          </div>
                          {ticket.closedAt && (
                            <div>
                              <h3 className="text-sm font-medium text-text-secondary mb-2">{t('tickets.closedAt')}</h3>
                              <p className="text-sm">
                                {new Date(ticket.closedAt).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
};

export default TicketsList;