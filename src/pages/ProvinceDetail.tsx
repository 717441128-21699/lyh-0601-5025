import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Factory,
  Battery,
  TrendingUp,
  Recycle,
  Leaf,
  BarChart3,
} from 'lucide-react';
import { getProvinceById } from '@/data/provinces';
import { getFactoriesByProvince } from '@/data/factories';
import { getProvinceSOHTrend, getBatchesByProvince } from '@/data/batteries';
import { StatCard } from '@/components/cards/StatCard';
import { SOHMultiTrendChart } from '@/components/charts/SOHMultiTrendChart';
import { TrendChart } from '@/components/charts/TrendChart';
import { formatNumber } from '@/utils/formatters';

const ProvinceDetail = () => {
  const { provinceId } = useParams<{ provinceId: string }>();
  const navigate = useNavigate();

  const province = getProvinceById(provinceId || '');
  const factories = getFactoriesByProvince(provinceId || '');
  const sohTrend = getProvinceSOHTrend(provinceId || '');
  const batches = getBatchesByProvince(provinceId || '');

  if (!province) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted">未找到该省份数据</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4">
          返回看板
        </button>
      </div>
    );
  }

  const cascadeTrendData = sohTrend.map((item, index) => ({
    date: item.date,
    value: province.cascadeUtilRate - 5 + Math.sin(index / 4) * 6 + Math.random() * 2,
  }));

  const recoveryTrendData = sohTrend.map((item, index) => ({
    date: item.date,
    value: province.recoveryRate - 2 + Math.sin(index / 5) * 3,
  }));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-primary-400" />
            <h1 className="page-title">{province.name}</h1>
            <span className="px-2.5 py-1 text-xs bg-primary-500/20 text-primary-400 rounded-full">
              {province.factoryCount} 家工厂
            </span>
          </div>
          <p className="text-sm text-text-muted mt-1">
            动力电池回收与梯次利用详细数据
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="总回收量"
          value={formatNumber(province.totalRecycled)}
          unit="吨"
          trend={8.5}
          icon={Recycle}
          color="primary"
          delay={0.1}
        />
        <StatCard
          title="平均SOH"
          value={province.avgSOH.toFixed(1)}
          unit="%"
          trend={-1.2}
          icon={Battery}
          color="accent"
          delay={0.15}
        />
        <StatCard
          title="梯次利用率"
          value={province.cascadeUtilRate.toFixed(1)}
          unit="%"
          trend={3.8}
          icon={TrendingUp}
          color="info"
          delay={0.2}
        />
        <StatCard
          title="回收率"
          value={province.recoveryRate.toFixed(1)}
          unit="%"
          trend={1.5}
          icon={BarChart3}
          color="warning"
          delay={0.25}
        />
        <StatCard
          title="碳减排量"
          value={formatNumber(province.carbonReduction)}
          unit="吨CO₂"
          trend={12.3}
          icon={Leaf}
          color="accent"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SOHMultiTrendChart data={sohTrend} title="近30天 SOH 与等级分布趋势" height={280} />
        <div className="grid grid-cols-1 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="glass-card p-6"
          >
            <h3 className="section-title mb-4">梯次利用率趋势</h3>
            <TrendChart
              data={cascadeTrendData}
              color="#00B4D8"
              height={120}
              unit="%"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card p-6"
          >
            <h3 className="section-title mb-4">回收率趋势</h3>
            <TrendChart
              data={recoveryTrendData}
              color="#F45D01"
              height={120}
              unit="%"
            />
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Factory className="w-5 h-5 text-primary-400" />
            <h3 className="section-title">回收工厂列表</h3>
          </div>
          <span className="text-sm text-text-muted">共 {factories.length} 家</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-text-muted uppercase tracking-wider">
                <th className="pb-3 font-medium">工厂名称</th>
                <th className="pb-3 font-medium">地址</th>
                <th className="pb-3 font-medium">年处理能力</th>
                <th className="pb-3 font-medium">本月回收</th>
                <th className="pb-3 font-medium">平均SOH</th>
                <th className="pb-3 font-medium">梯次利用率</th>
                <th className="pb-3 font-medium">回收率</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {factories.map((factory, index) => (
                <motion.tr
                  key={factory.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                  className="border-t border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3.5">
                    <span className="font-medium text-white">{factory.name}</span>
                  </td>
                  <td className="py-3.5 text-text-secondary">
                    {factory.address}
                  </td>
                  <td className="py-3.5 font-mono text-white">
                    {factory.capacity} 吨
                  </td>
                  <td className="py-3.5 font-mono text-accent-400">
                    {factory.monthlyRecycled} 吨
                  </td>
                  <td className="py-3.5">
                    <span className={`font-mono ${factory.avgSOH >= 80 ? 'text-accent-400' : factory.avgSOH >= 70 ? 'text-warning-400' : 'text-danger-400'}`}>
                      {factory.avgSOH}%
                    </span>
                  </td>
                  <td className="py-3.5 font-mono text-info-400">
                    {factory.cascadeUtilRate}%
                  </td>
                  <td className="py-3.5 font-mono text-primary-400">
                    {factory.recoveryRate}%
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Battery className="w-5 h-5 text-accent-400" />
            <h3 className="section-title">电池批次记录</h3>
          </div>
          <span className="text-sm text-text-muted">最近批次</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch, index) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.65 + index * 0.05 }}
              className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-white">{batch.batchNo}</p>
                  <p className="text-xs text-text-muted">{batch.batteryModel}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                  batch.grade === 'A' ? 'bg-accent-500/20 text-accent-400' :
                  batch.grade === 'B' ? 'bg-primary-500/20 text-primary-400' :
                  batch.grade === 'C' ? 'bg-warning-500/20 text-warning-400' :
                  'bg-danger-500/20 text-danger-400'
                }`}>
                  {batch.grade}级
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-text-muted mb-1">电芯数</p>
                  <p className="font-mono text-white">{batch.totalCount}</p>
                </div>
                <div>
                  <p className="text-text-muted mb-1">平均SOH</p>
                  <p className="font-mono text-accent-400">{batch.avgSOH}%</p>
                </div>
                <div>
                  <p className="text-text-muted mb-1">容量</p>
                  <p className="font-mono text-white">{batch.avgCapacity}Ah</p>
                </div>
              </div>
              {batch.applicationScene && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-xs text-text-muted">
                    梯次应用: <span className="text-info-400">{batch.applicationScene}</span>
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ProvinceDetail;
