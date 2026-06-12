import { motion } from 'framer-motion';
import {
  Recycle,
  Zap,
  TrendingUp,
  Battery,
  Activity,
  Gauge,
  Factory,
  Clock,
} from 'lucide-react';
import { TrendChart } from '@/components/charts/TrendChart';

const CascadeUtilization = () => {
  const scenes = [
    { name: '储能电站', utilization: 85.6, devices: 12, capacity: '50MWh', color: 'from-accent-500 to-accent-600' },
    { name: '低速电动车', utilization: 72.3, devices: 28, capacity: '20MWh', color: 'from-primary-500 to-primary-600' },
    { name: '通信基站', utilization: 68.5, devices: 45, capacity: '15MWh', color: 'from-info-500 to-info-600' },
    { name: '家庭储能', utilization: 62.8, devices: 156, capacity: '8MWh', color: 'from-warning-500 to-warning-600' },
    { name: '备用电源', utilization: 58.2, devices: 89, capacity: '12MWh', color: 'from-purple-500 to-purple-600' },
    { name: '其他场景', utilization: 45.6, devices: 34, capacity: '5MWh', color: 'from-gray-500 to-gray-600' },
  ];

  const trendData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().slice(0, 10),
      value: 65 + Math.sin(i / 4) * 10 + Math.random() * 5,
    };
  });

  const deviceUtilData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().slice(0, 10),
      value: 55 + Math.sin(i / 3) * 15 + Math.random() * 8,
    };
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="page-title">梯次利用</h1>
          <p className="text-sm text-text-muted mt-1">
            应用场景监测、设备利用率、梯次组装数据
          </p>
        </div>
        <button className="btn-primary text-sm flex items-center gap-2">
          <Factory className="w-4 h-4" />
          组装管理
        </button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '梯次利用率', value: '72.5', unit: '%', trend: 3.8, icon: TrendingUp, color: 'accent' },
          { label: '在役设备', value: '364', unit: '台', trend: 12, icon: Gauge, color: 'primary' },
          { label: '总装机容量', value: '110', unit: 'MWh', trend: 8.5, icon: Zap, color: 'warning' },
          { label: '日处理量', value: '12.8', unit: '吨', trend: -2.1, icon: Activity, color: 'info' },
        ].map((stat, index) => {
          const colorClasses: Record<string, string> = {
            primary: 'text-primary-400 bg-primary-500/10 border-primary-500/20',
            accent: 'text-accent-400 bg-accent-500/10 border-accent-500/20',
            warning: 'text-warning-400 bg-warning-500/10 border-warning-500/20',
            info: 'text-info-400 bg-info-500/10 border-info-500/20',
          };

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              className="glass-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-text-muted">{stat.label}</span>
                <div className={`w-8 h-8 rounded-lg border ${colorClasses[stat.color]} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono text-white mb-2">
                {stat.value}
                <span className="text-sm text-text-muted font-normal ml-1">{stat.unit}</span>
              </p>
              <div className={`flex items-center gap-1 text-xs ${stat.trend >= 0 ? 'text-accent-400' : 'text-danger-400'}`}>
                {stat.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                <span>{Math.abs(stat.trend)}% 较上月</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="section-title mb-4">梯次利用率趋势</h3>
          <TrendChart data={trendData} color="#3E885B" height={200} unit="%" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="glass-card p-6"
        >
          <h3 className="section-title mb-4">设备平均利用率</h3>
          <TrendChart data={deviceUtilData} color="#1E5FE8" height={200} unit="%" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="section-title">应用场景分布</h3>
          <span className="text-sm text-text-muted">共 {scenes.length} 类场景</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenes.map((scene, index) => (
            <motion.div
              key={scene.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.45 + index * 0.05 }}
              className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${scene.color} flex items-center justify-center shadow-lg`}>
                  <Battery className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-base font-medium text-white">{scene.name}</h4>
                  <p className="text-xs text-text-muted">{scene.devices} 台设备</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-text-muted">利用率</span>
                    <span className={`font-mono font-medium ${scene.utilization >= 70 ? 'text-accent-400' : scene.utilization >= 50 ? 'text-warning-400' : 'text-danger-400'}`}>
                      {scene.utilization}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${scene.color} transition-all duration-500`}
                      style={{ width: `${scene.utilization}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">装机容量</span>
                  <span className="text-white font-mono">{scene.capacity}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default CascadeUtilization;
