import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Ticket as TicketIcon, 
  CheckCircle, 
  BarChart4, 
  Timer, 
  Clock, 
  Filter,
  BarChart3,
  AlertCircle,
  ArrowUpRight,
  LayoutDashboard
} from 'lucide-react';
import DashboardStats from '../components/dashboard/DashboardStats';
import LineChart from '../components/charts/LineChart';
import TicketsList from '../components/tickets/TicketsList';
import { DashboardStats as StatsType, Ticket, TicketStatus, TicketPriority } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Mock data for demonstration
const mockStats: StatsType = {
  totalTickets: 235,
  slaCompliance: 92,
  escalatedTickets: 8,
  avgResponseTime: 1.8,
  ticketsByStatus: {
    open: 45,
    in_progress: 67,
    resolved: 34,
    closed: 89,
    reopened: 0,
    escalated: 0
  },
  ticketsByPriority: {
    [TicketPriority.HIGH]: 32,
    [TicketPriority.MEDIUM]: 89,
    [TicketPriority.LOW]: 114,
    [TicketPriority.CRITICAL]: 0
  },
  ticketsByType: {
    petition: 78,
    complaint: 102,
    claim: 55
  },
  ticketsOverTime: [
    { date: '2023-01-01', count: 15 },
    { date: '2023-01-02', count: 20 },
    { date: '2023-01-03', count: 25 },
    { date: '2023-01-04', count: 22 },
    { date: '2023-01-05', count: 30 },
    { date: '2023-01-06', count: 28 },
    { date: '2023-01-07', count: 35 },
    { date: '2023-01-08', count: 32 },
    { date: '2023-01-09', count: 40 },
    { date: '2023-01-10', count: 45 },
    { date: '2023-01-11', count: 42 },
    { date: '2023-01-12', count: 50 },
    { date: '2023-01-13', count: 55 },
    { date: '2023-01-14', count: 60 },
  ],
  agentWorkload: [
    { agentId: '1', agentName: 'John Doe', assignedTickets: 12 },
    { agentId: '2', agentName: 'Jane Smith', assignedTickets: 8 },
    { agentId: '3', agentName: 'Alex Johnson', assignedTickets: 15 },
  ],
  topCategories: [
    { categoryId: '1', categoryName: 'Billing Issues', count: 45 },
    { categoryId: '2', categoryName: 'Product Defects', count: 32 },
    { categoryId: '3', categoryName: 'Service Quality', count: 28 },
  ]
};

// Mock tickets data
const mockTickets: Partial<Ticket>[] = [
  {
    id: '1238',
    title: 'Website is not loading properly',
    status: 'open',
    priority: 'high',
    createdAt: '2024-04-24T10:30:00Z',
  },
  {
    id: '1237',
    title: 'Billing discrepancy on invoice #45678',
    status: 'in_progress',
    priority: 'low',
    createdAt: '2024-04-23T14:15:00Z',
  },
  {
    id: '1236',
    title: 'Product delivered with missing parts',
    status: 'resolved',
    priority: 'medium',
    createdAt: '2024-04-23T09:45:00Z',
  },
  {
    id: '1235',
    title: 'Request for refund on order #789456',
    status: 'closed',
    priority: 'medium',
    createdAt: '2024-04-23T08:20:00Z',
  }
];

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsType | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await ticketService.getTickets();
        // Filtrar tickets para el usuario actual
        const userTickets = data.filter(ticket => ticket.user?.email === user?.email);
        setTickets(userTickets);
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  const chartData = {
    labels: (stats?.ticketsOverTime || []).map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: t('dashboard.totalTickets'),
        data: (stats?.ticketsOverTime || []).map(item => item.count),
        borderColor: '#00b9cd',
        backgroundColor: 'rgba(0, 185, 205, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  // Estadísticas generales
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === TicketStatus.OPEN).length;
  const escalatedTickets = tickets.filter(t => t.status === TicketStatus.ESCALATED).length;
  const slaCompliance = tickets.filter(t => t.slaStatus === 'compliant').length;

  // Tiempo medio de respuesta (en horas)
  const averageResponseTime = tickets.length > 0
    ? tickets.reduce((acc, ticket) => {
        const responseTime = ticket.firstResponseAt 
          ? new Date(ticket.firstResponseAt).getTime() - new Date(ticket.createdAt).getTime()
          : 0;
        return acc + responseTime;
      }, 0) / tickets.length / (1000 * 60 * 60)
    : 0;

  // Tickets por prioridad
  const ticketsByPriority = {
    [TicketPriority.HIGH]: tickets.filter(t => t.priority === TicketPriority.HIGH).length,
    [TicketPriority.MEDIUM]: tickets.filter(t => t.priority === TicketPriority.MEDIUM).length,
    [TicketPriority.LOW]: tickets.filter(t => t.priority === TicketPriority.LOW).length,
    [TicketPriority.CRITICAL]: tickets.filter(t => t.priority === TicketPriority.CRITICAL).length,
  };

  // Tickets por estado
  const ticketsByStatus = {
    [TicketStatus.OPEN]: tickets.filter(t => t.status === TicketStatus.OPEN).length,
    [TicketStatus.IN_PROGRESS]: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
    [TicketStatus.RESOLVED]: tickets.filter(t => t.status === TicketStatus.RESOLVED).length,
    [TicketStatus.CLOSED]: tickets.filter(t => t.status === TicketStatus.CLOSED).length,
    [TicketStatus.REOPENED]: tickets.filter(t => t.status === TicketStatus.REOPENED).length,
    [TicketStatus.ESCALATED]: tickets.filter(t => t.status === TicketStatus.ESCALATED).length,
  };

  // Tickets recientes (últimos 5)
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-700 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <motion.div 
          className="flex flex-col"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold">
            Bienvenido, {user?.name || 'Usuario'}
          </h1>
          <p className="text-text-secondary mt-1">
            {t('dashboard.welcomeMessage')}
          </p>
        </motion.div>
        
        <motion.div 
          className="flex items-center space-x-4 mt-4 md:mt-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center space-x-2 text-text-secondary text-sm">
            <Clock size={16} />
            <span>Última actualización: {new Date().toLocaleTimeString('es-ES')}</span>
          </div>
          
          <button className="btn btn-ghost text-sm">
            <Filter size={16} className="mr-2" />
            {t('common.filter')}
          </button>
        </motion.div>
      </div>
      
      <DashboardStats stats={stats || mockStats} isLoading={isLoading} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2 card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-lg font-medium mb-4">{t('dashboard.ticketsOverTime')}</h2>
          <LineChart 
            data={chartData} 
            height={300} 
          />
        </motion.div>
        
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-lg font-medium mb-4">{t('dashboard.recentTickets')}</h2>
          <div className="space-y-4">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-800 bg-opacity-40 p-3 rounded-lg">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              tickets.slice(0, 4).map(ticket => (
                <div key={ticket.id} className="bg-gray-800 bg-opacity-40 p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                  <p className="font-medium text-text-primary truncate">{ticket.title}</p>
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <span className="text-text-secondary">
                      #{ticket.id?.toString().slice(-4)}
                    </span>
                    <span className="text-text-secondary">
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </div>
              ))
            )}
            
            <button className="btn btn-ghost w-full text-sm">
              {t('common.view')} {t('navigation.tickets')}
            </button>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">{t('navigation.tickets')}</h2>
          <button 
            onClick={() => navigate('/tickets')}
            className="btn btn-primary text-sm"
          >
            {t('common.view')} {t('navigation.tickets')}
          </button>
        </div>
        <TicketsList tickets={tickets} isLoading={isLoading} />
      </motion.div>
    </div>
  );
};

export default DashboardPage;