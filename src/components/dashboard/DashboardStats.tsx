import React from 'react';
import { useTranslation } from 'react-i18next';
import { Ticket, BarChart4, CheckCircle, Timer } from 'lucide-react';
import StatCard from '../ui/StatCard';
import { DashboardStats as StatsType } from '../../types';

interface DashboardStatsProps {
  stats: StatsType;
  isLoading?: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isLoading }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="flex items-start justify-between">
              <div>
                <div className="h-4 bg-gray-700 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-700 rounded w-16"></div>
              </div>
              <div className="h-10 w-10 bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title={t('dashboard.totalTickets')}
        value={stats.totalTickets}
        icon={<Ticket size={24} className="text-primary-500" />}
        color="primary"
      />
      <StatCard
        title={t('dashboard.slaCompliance')}
        value={`${stats.slaCompliance}%`}
        icon={<CheckCircle size={24} className="text-success-500" />}
        color="success"
      />
      <StatCard
        title={t('dashboard.escalated')}
        value={stats.escalatedTickets}
        icon={<BarChart4 size={24} className="text-secondary-500" />}
        color="secondary"
        trend={stats.escalatedTickets > 10 ? 'up' : 'down'}
        trendValue={stats.escalatedTickets > 10 ? '+12%' : '-8%'}
      />
      <StatCard
        title={t('dashboard.avgResponseTime')}
        value={`${stats.avgResponseTime}h`}
        icon={<Timer size={24} className="text-accent-500" />}
        color="accent"
        trend={stats.avgResponseTime < 2 ? 'down' : 'up'}
        trendValue={stats.avgResponseTime < 2 ? '-15%' : '+7%'}
      />
    </div>
  );
};

export default DashboardStats;