import { motion } from 'framer-motion';
import {
  Recycle,
  Battery,
  TrendingUp,
  Leaf,
  AlertTriangle,
  FileCheck,
  Zap,
  Activity,
} from 'lucide-react';
import { StatCard } from '@/components/cards/StatCard';
import { HeatMap } from '@/components/charts/HeatMap';
import { Rankings } from '@/components/charts/Rankings';
import { TrendChart } from '@/components/charts/TrendChart';
import { useDashboardStore } from '@/store/useDashboardStore';
import { provinces } from '@/data/provinces';
import { nationalSOHTrend } from '@/data/batteries';
import { formatNumber } from '@/utils/formatters';

const Dashboard = () => {
  const { stats } = useDashboardStore();

  const sohTrendData = nationalSOHTrend.map((item) => ({
    date: item.date,
    value: item.avgSOH,
  }));

  const cascadeTrendData = nationalSOHTrend.map((item, index) => ({
    date: item.date,
    value: 65 + Math.sin(index / 3) * 8 + Math.random() * 3,
  }));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="page-title">
            全国动力电池回收监测
            <span className="ml-2 text-sm font-normal text-text-muted">
              实时数据看板
            </span>
          </h1>
          <p className="text-sm text-text-muted mt-1">
            数据更新时间: {new Date().toLocaleString('zh-CN')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            实时刷新
          </button>
          <button className="btn-primary text-sm flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            导出报告
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="总回收量"
          value={formatNumber(stats.totalRecycled)}
          unit="吨"
          trend={stats.totalRecycledTrend}
          trendLabel="环比"
          icon={Recycle}
          color="primary"
          delay={0.1}
          subtitle="本年度累计"
        />
        <StatCard
          title="平均SOH"
          value={stats.avgSOH.toFixed(1)}
          unit="%"
          trend={stats.avgSOHTrend}
          trendLabel="较上月"
          icon={Battery}
          color="accent"
          delay={0.15}
          subtitle="健康状态"
        />
        <StatCard
          title="梯次利用率"
          value={stats.cascadeUtilRate.toFixed(1)}
          unit="%"
          trend={stats.cascadeUtilRateTrend}
          trendLabel="环比"
          icon={TrendingUp}
          color="info"
          delay={0.2}
          subtitle="二次利用效率"
        />
        <StatCard
          title="回收率"
          value={stats.recoveryRate.toFixed(1)}
          unit="%"
          trend={stats.recoveryRateTrend}
          trendLabel="环比"
          icon={Zap}
          color="warning"
          delay={0.25}
          subtitle="材料再生率"
        />
        <StatCard
          title="碳减排量"
          value={formatNumber(stats.carbonReduction)}
          unit="吨CO₂"
          trend={stats.carbonReductionTrend}
          trendLabel="同比"
          icon={Leaf}
          color="accent"
          delay={0.3}
          subtitle="累计抵消"
        />
        <StatCard
          title="活跃预警"
          value={stats.activeWarnings.toString()}
          unit="个"
          trend={stats.pendingApprovals}
          trendLabel="待审批"
          icon={AlertTriangle}
          color="danger"
          delay={0.35}
          subtitle="需及时处理"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HeatMap provinces={provinces} title="全国回收量热力分布" />
        </div>
        <div>
          <Rankings
            provinces={provinces}
            title="梯次利用率排名"
            metric="cascadeUtilRate"
            unit="%"
            limit={8}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">SOH 趋势分析</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-xs bg-primary-500/20 text-primary-400 rounded-md">
                近30天
              </button>
              <button className="px-3 py-1 text-xs text-text-muted hover:text-white hover:bg-white/5 rounded-md transition-colors">
                近90天
              </button>
              <button className="px-3 py-1 text-xs text-text-muted hover:text-white hover:bg-white/5 rounded-md transition-colors">
                全年
              </button>
            </div>
          </div>
          <TrendChart
            data={sohTrendData}
            color="#3E885B"
            height={200}
            unit="%"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">梯次利用率趋势</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-xs bg-primary-500/20 text-primary-400 rounded-md">
                近30天
              </button>
              <button className="px-3 py-1 text-xs text-text-muted hover:text-white hover:bg-white/5 rounded-md transition-colors">
                近90天
              </button>
            </div>
          </div>
          <TrendChart
            data={cascadeTrendData}
            color="#1E5FE8"
            height={200}
            unit="%"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Rankings
            provinces={provinces}
            title="回收量排行榜"
            metric="totalRecycled"
            unit="吨"
            limit={6}
          />
        </div>
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="glass-card p-6 h-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">电芯等级分布</h3>
              <span className="text-xs text-text-muted">全国统计</span>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { grade: 'A', label: 'A级', count: 125800, color: 'bg-accent-500', desc: '优质' },
                { grade: 'B', label: 'B级', count: 98500, color: 'bg-primary-500', desc: '良好' },
                { grade: 'C', label: 'C级', count: 65200, color: 'bg-warning-500', desc: '合格' },
                { grade: 'D', label: 'D级', count: 28600, color: 'bg-danger-500', desc: '待处理' },
              ].map((item, index) => (
                <motion.div
                  key={item.grade}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                  className="text-center p-4 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-lg ${item.color} flex items-center justify-center text-white font-bold`}>
                    {item.grade}
                  </div>
                  <p className="text-lg font-bold font-mono text-white">
                    {(item.count / 10000).toFixed(1)}万
                  </p>
                  <p className="text-xs text-text-muted">{item.desc}</p>
                </motion.div>
              ))}
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
              {[
                { width: '42%', color: 'bg-accent-500' },
                { width: '32%', color: 'bg-primary-500' },
                { width: '18%', color: 'bg-warning-500' },
                { width: '8%', color: 'bg-danger-500' },
              ].map((bar, index) => (
                <motion.div
                  key={index}
                  initial={{ width: 0 }}
                  animate={{ width: bar.width }}
                  transition={{ duration: 0.8, delay: 0.9 + index * 0.1 }}
                  className={`h-full ${bar.color}`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-text-muted">
              <span>总计: 31.8万颗电芯</span>
              <span>合格率: 92.3%</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
