import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  icon: LucideIcon;
  color?: 'primary' | 'accent' | 'warning' | 'danger' | 'info';
  delay?: number;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  trend,
  trendLabel = '较上期',
  icon: Icon,
  color = 'primary',
  delay = 0,
  subtitle,
}) => {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-500/10',
      icon: 'text-primary-400',
      border: 'border-primary-500/20',
      glow: 'hover:shadow-glow-primary',
    },
    accent: {
      bg: 'bg-accent-500/10',
      icon: 'text-accent-400',
      border: 'border-accent-500/20',
      glow: 'hover:shadow-glow-accent',
    },
    warning: {
      bg: 'bg-warning-500/10',
      icon: 'text-warning-400',
      border: 'border-warning-500/20',
      glow: 'hover:shadow-glow-warning',
    },
    danger: {
      bg: 'bg-danger-500/10',
      icon: 'text-danger-400',
      border: 'border-danger-500/20',
      glow: 'hover:shadow-glow-danger',
    },
    info: {
      bg: 'bg-info-500/10',
      icon: 'text-info-400',
      border: 'border-info-500/20',
      glow: 'hover:shadow-[0_0_20px_rgba(0,180,216,0.3)]',
    },
  };

  const colors = colorClasses[color];
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`stat-card ${colors.glow} group relative overflow-hidden`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-80 transition-opacity`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-text-secondary text-sm font-medium mb-1">{title}</p>
            {subtitle && <p className="text-text-muted text-xs">{subtitle}</p>}
          </div>
          <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center ${colors.border} border`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
        </div>

        <div className="flex items-end gap-2 mb-3">
          <span className="text-3xl font-display font-bold text-white font-mono">{value}</span>
          {unit && <span className="text-text-secondary text-sm mb-1">{unit}</span>}
        </div>

        {trend !== undefined && (
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                isPositive
                  ? 'bg-accent-500/15 text-accent-400'
                  : 'bg-danger-500/15 text-danger-400'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
            <span className="text-text-muted text-xs">{trendLabel}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
