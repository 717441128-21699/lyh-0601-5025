import { motion } from 'framer-motion';
import { Battery, Search, Filter, ChevronDown } from 'lucide-react';
import { batteryBatches, getBatteryModels, getGradeColor, getGradeLabel } from '@/data/batteries';
import { BatteryGrade } from '@/types';

const BatteryArchive = () => {
  const models = getBatteryModels();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="page-title">电池档案</h1>
          <p className="text-sm text-text-muted mt-1">
            电池型号管理、批次追踪、电芯等级分布
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="搜索批次号、型号..."
              className="pl-10 pr-4 py-2 w-64 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary-500/50"
            />
          </div>
          <button className="btn-secondary text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" />
            筛选
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: '电池型号', value: '12', unit: '种', color: 'primary' },
          { label: '回收批次', value: '256', unit: '批', color: 'accent' },
          { label: '电芯总数', value: '31.8万', unit: '颗', color: 'info' },
          { label: '平均SOH', value: '78.5', unit: '%', color: 'warning' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
            className="glass-card p-5"
          >
            <p className="text-sm text-text-muted mb-2">{stat.label}</p>
            <p className="text-2xl font-bold font-mono text-white">
              {stat.value}
              <span className="text-sm text-text-muted font-normal ml-1">{stat.unit}</span>
            </p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="section-title">电池批次列表</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select className="appearance-none pr-8 pl-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none">
                <option value="all">全部型号</option>
                {models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batteryBatches.map((batch, index) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.35 + index * 0.05 }}
              className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors">
                    {batch.batchNo}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{batch.batteryModel}</p>
                </div>
                <span
                  className="px-2.5 py-1 text-xs font-bold rounded-md"
                  style={{
                    backgroundColor: `${getGradeColor(batch.grade)}20`,
                    color: getGradeColor(batch.grade),
                  }}
                >
                  {getGradeLabel(batch.grade)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <p className="text-xs text-text-muted mb-1">电芯数</p>
                  <p className="text-sm font-mono text-white">{batch.totalCount}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">平均SOH</p>
                  <p className="text-sm font-mono text-accent-400">{batch.avgSOH}%</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">平均容量</p>
                  <p className="text-sm font-mono text-white">{batch.avgCapacity}Ah</p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="text-xs text-text-muted">
                  {batch.factoryName}
                </div>
                <div className="text-xs text-text-muted">
                  {batch.recycleDate}
                </div>
              </div>

              {batch.applicationScene && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-text-muted">梯次应用:</span>
                  <span className="px-2 py-0.5 text-xs bg-info-500/20 text-info-400 rounded">
                    {batch.applicationScene}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default BatteryArchive;
