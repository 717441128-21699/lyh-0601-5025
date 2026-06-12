import { motion } from 'framer-motion';
import { Province } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface HeatMapProps {
  provinces: Province[];
  title?: string;
}

export const HeatMap: React.FC<HeatMapProps> = ({ provinces, title = '全国电池回收热力图' }) => {
  const navigate = useNavigate();
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  const maxRecycled = Math.max(...provinces.map((p) => p.totalRecycled));

  const getIntensity = (value: number) => {
    const ratio = value / maxRecycled;
    return Math.min(1, Math.max(0.2, ratio));
  };

  const getBgColor = (value: number) => {
    const intensity = getIntensity(value);
    const r = Math.round(30 + intensity * 100);
    const g = Math.round(95 + intensity * 80);
    const b = Math.round(232 + intensity * 23);
    return `rgba(${r}, ${g}, ${b}, ${0.1 + intensity * 0.4})`;
  };

  const getBorderColor = (value: number) => {
    const intensity = getIntensity(value);
    return `rgba(62, 136, 91, ${0.2 + intensity * 0.4})`;
  };

  const sortedProvinces = [...provinces].sort((a, b) => b.totalRecycled - a.totalRecycled);
  const topProvinces = sortedProvinces.slice(0, 16);
  const otherProvinces = sortedProvinces.slice(16);

  const handleProvinceClick = (provinceId: string) => {
    navigate(`/province/${provinceId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6 h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="section-title">{title}</h3>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>低</span>
          <div className="w-24 h-2 rounded-full bg-gradient-to-r from-primary-900/50 via-primary-600/50 to-accent-500/50" />
          <span>高</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {topProvinces.map((province, index) => (
          <motion.div
            key={province.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
            onClick={() => handleProvinceClick(province.id)}
            onMouseEnter={() => setHoveredProvince(province.id)}
            onMouseLeave={() => setHoveredProvince(null)}
            className="relative p-4 rounded-xl cursor-pointer transition-all duration-300 group"
            style={{
              backgroundColor: getBgColor(province.totalRecycled),
              borderColor: getBorderColor(province.totalRecycled),
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-white">{province.name}</span>
                <span
                  className="text-xs font-mono px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `rgba(62, 136, 91, ${0.2 + getIntensity(province.totalRecycled) * 0.3})`,
                    color: '#9FD4B4',
                  }}
                >
                  {province.factoryCount}厂
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-display font-bold text-white font-mono">
                  {(province.totalRecycled / 1000).toFixed(1)}
                </span>
                <span className="text-xs text-text-muted">千吨</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getIntensity(province.totalRecycled) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.6 + index * 0.05, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-accent-600 to-accent-400 rounded-full"
                  />
                </div>
                <span className="text-xs text-text-muted">{province.cascadeUtilRate}%</span>
              </div>
            </div>

            {hoveredProvince === province.id && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-16 left-1/2 -translate-x-1/2 px-3 py-2 bg-dark-800 rounded-lg border border-white/10 shadow-xl z-20 whitespace-nowrap"
              >
                <p className="text-xs text-text-muted mb-1">{province.name}</p>
                <p className="text-sm font-mono text-white">回收量: {province.totalRecycled.toLocaleString()} 吨</p>
                <p className="text-xs text-text-muted">梯次利用率: {province.cascadeUtilRate}%</p>
                <p className="text-xs text-text-muted">回收率: {province.recoveryRate}%</p>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-dark-800 border-r border-b border-white/10 rotate-45" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {otherProvinces.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-text-muted mb-2">其他省份</p>
          <div className="flex flex-wrap gap-2">
            {otherProvinces.slice(0, 12).map((province) => (
              <button
                key={province.id}
                onClick={() => handleProvinceClick(province.id)}
                className="px-2.5 py-1 text-xs bg-white/5 hover:bg-white/10 rounded-md text-text-secondary hover:text-white transition-colors"
              >
                {province.name.replace(/省|市|自治区|维吾尔自治区|回族自治区|壮族自治区/g, '')}
                <span className="ml-1 text-accent-400 font-mono">
                  {(province.totalRecycled / 1000).toFixed(1)}k
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
