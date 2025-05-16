import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  ArrowUpDown, 
  DownloadCloud,
  LayoutDashboard
} from 'lucide-react';
import TicketsList from '../components/tickets/TicketsList';
import { Ticket, TicketStatus, TicketPriority, TicketType, SLAStatus } from '../types';
import { ticketService } from '../services/ticketService';

const TicketsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Partial<Ticket>[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Partial<Ticket>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '' as TicketStatus | '',
    priority: '' as TicketPriority | '',
    type: '' as TicketType | '',
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    let result = [...tickets];
    
    // Apply search query
    if (searchQuery) {
      result = result.filter(ticket => 
        ticket.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id?.toString().includes(searchQuery)
      );
    }
    
    // Apply filters
    if (filters.status) {
      result = result.filter(ticket => ticket.status === filters.status);
    }
    
    if (filters.priority) {
      result = result.filter(ticket => ticket.priority === filters.priority);
    }
    
    if (filters.type) {
      result = result.filter(ticket => ticket.type === filters.type);
    }
    
    setFilteredTickets(result);
  }, [searchQuery, filters, tickets]);

  const handleFilterChange = (
    filterType: 'status' | 'priority' | 'type',
    value: string
  ) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? '' : value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      type: '',
    });
    setSearchQuery('');
  };

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const fetchedTickets = await ticketService.getTickets();
      setTickets(fetchedTickets);
      setFilteredTickets(fetchedTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <motion.div 
          className="flex items-center space-x-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn btn-ghost flex items-center space-x-2"
          >
            <LayoutDashboard size={20} className="text-text-primary" />
            <span>{t('navigation.dashboard')}</span>
          </button>
          <h1 className="text-2xl font-bold">
            {t('navigation.tickets')}
          </h1>
        </motion.div>
        
        <motion.div 
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 md:mt-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/tickets/new')}
          >
            <PlusCircle size={16} className="mr-2" />
            {t('tickets.create')}
          </button>
          
          <button className="btn btn-ghost text-sm">
            <DownloadCloud size={16} className="mr-2" />
            {t('reports.export')}
          </button>
        </motion.div>
      </div>
      
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-text-secondary" />
            </div>
            <input
              type="text"
              placeholder={t('common.search')}
              className="input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button 
            className={`btn ${showFilters ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} className="mr-2" />
            {t('common.filter')}
          </button>
          
          <button className="btn btn-ghost">
            <ArrowUpDown size={16} className="mr-2" />
            {t('common.sort')}
          </button>
        </div>
        
        {showFilters && (
          <motion.div 
            className="bg-gray-800 bg-opacity-50 rounded-lg p-4 mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {t('tickets.status')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(TicketStatus).map((status: TicketStatus) => (
                    <button
                      key={status}
                      className={`px-3 py-1 text-xs rounded-full border ${
                        filters.status === status
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'border-gray-600 text-text-secondary hover:bg-gray-700'
                      }`}
                      onClick={() => handleFilterChange('status', status)}
                    >
                      {t(`tickets.statuses.${status}`)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {t('tickets.priority')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(TicketPriority).map((priority: TicketPriority) => (
                    <button
                      key={priority}
                      className={`px-3 py-1 text-xs rounded-full border ${
                        filters.priority === priority
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'border-gray-600 text-text-secondary hover:bg-gray-700'
                      }`}
                      onClick={() => handleFilterChange('priority', priority)}
                    >
                      {t(`tickets.priorities.${priority}`)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {t('tickets.type')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(TicketType).map(type => (
                    <button
                      key={type}
                      className={`px-3 py-1 text-xs rounded-full border ${
                        filters.type === type
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'border-gray-600 text-text-secondary hover:bg-gray-700'
                      }`}
                      onClick={() => handleFilterChange('type', type)}
                    >
                      {t(`tickets.types.${type}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button 
                className="btn btn-ghost text-sm"
                onClick={handleResetFilters}
              >
                {t('common.cancel')}
              </button>
            </div>
          </motion.div>
        )}
        
        <TicketsList tickets={filteredTickets} isLoading={isLoading} />
      </motion.div>
    </div>
  );
};

export default TicketsPage;