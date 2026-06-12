import { motion } from 'framer-motion';
import { Province } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp } from 'lucide-react';

interface RankingsProps {
  provinces: Province[];
  title?: string;
  metric?: 'totalRecycled' | 'cascadeUtilRate' | 'avgSOH';
  unit?: string;
  limit?: number;
}

const metricLabels = {
  totalRecycled: '回收量',
  cascadeUtilRate: '梯次利用率',
  avgSOH: '平均SOH',
};

export const Rankings: React.FC<RankingsProps> = ({
  provinces,
  title = '梯次利用率排名',
  metric = 'cascadeUtilRate',
  unit = '%',
  limit = 10,
}) => {
  const navigate = useNavigate();
  
  const sortedProvinces = [...provinces]
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, limit);

  const maxValue = sortedProvinces[0]?.[metric] || 1;

  const getRankColor = (rank: number) => {
    if (rank === 0) return 'from-yellow-500 to-yellow-400';
    if (rank === 1) return 'from-gray-300 to-gray-200';
    if (rank === 2) return 'from-amber-600 to-amber-500';
    return 'from-dark-600 to-dark-700';
  };

  const getRankIcon = (rank: number) => {
    if (rank < 3) {
      return (
        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getRankColor(rank)} flex items-center justify-center text-xs font-bold text-white shadow-md`}>
          {rank + 1}
        </div>
      );
    }
    return (
      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-mono text-text-muted">
        {rank + 1}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-6 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-warning-400" />
          <h3 className="section-title">{title}</h3>
        </div>
        <span className="text-xs text-text-muted">{metricLabels[metric]}</span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {sortedProvinces.map((province, index) => {
          const progress = (province[metric] / maxValue) * 100;
          const value = province[metric];
          
          return (
            <motion.div
              key={province.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
              onClick={() => navigate(`/province/${province.id}`)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
            >
              {getRankIcon(index)}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-white truncate">{province.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-mono font-semibold text-white">
                      {typeof value === 'number' && metric === 'totalRecycled' 
                        ? (value / 1000).toFixed(1) + 'k' 
                        : value.toFixed(1)}
                      <span className="text-xs text-text-muted ml-0.5">{unit}</span>
                    </span>
                    <TrendingUp className="w-3 h-3 text-accent-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, delay: 0.7 + index * 0.05, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      index < 3 
                        ? 'bg-gradient-to-r from-accent-600 to-accent-400' 
                        : 'bg-gradient-to-r from-primary-700 to-primary-500'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
