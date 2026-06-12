import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileBarChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Leaf,
  Recycle,
  Battery,
  Zap,
  Info,
} from 'lucide-react';
import { healthReports } from '@/data/reports';
import { HealthReport } from '@/types';
import { formatNumber } from '@/utils/formatters';
import { useAuthStore } from '@/store/useAuthStore';

const HealthReportPage = () => {
  const [selectedReport, setSelectedReport] = useState<HealthReport | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  const { user, isNationalRole } = useAuthStore();

  const filteredReports = useMemo(() => {
    if (isNationalRole()) {
      return healthReports;
    }
    const provinceIds = user?.provinceIds || [];
    return healthReports.filter((report) => {
      if (report.scopeType === 'national') {
        return true;
      }
      if (report.scopeType === 'province') {
        return provinceIds.includes(report.scopeId);
      }
      return false;
    });
  }, [user, isNationalRole]);

  const handleViewReport = (report: HealthReport) => {
    setSelectedReport(report);
    setViewMode('detail');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedReport(null);
  };

  const getTrendColor = (value: number) => {
    return value >= 0 ? 'text-accent-400' : 'text-danger-400';
  };

  const getTrendIcon = (value: number) => {
    return value >= 0 ? TrendingUp : TrendingDown;
  };

  const ReportList = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="page-title">健康诊断</h1>
          <p className="text-sm text-text-muted mt-1">
            自动生成回收健康诊断报告，提供优化建议
          </p>
          {!isNationalRole() && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-info-400">
              <Info className="w-3.5 h-3.5" />
              <span>仅显示所辖区域数据</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            选择周期
          </button>
          <button className="btn-primary text-sm flex items-center gap-2">
            <FileBarChart className="w-4 h-4" />
            生成报告
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
            onClick={() => handleViewReport(report)}
            className="glass-card-hover p-5 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-primary">
                <FileBarChart className="w-6 h-6 text-white" />
              </div>
              <span className={`px-2.5 py-0.5 text-xs rounded-full ${
                report.scopeType === 'national'
                  ? 'bg-primary-500/20 text-primary-400'
                  : report.scopeType === 'province'
                  ? 'bg-info-500/20 text-info-400'
                  : 'bg-warning-500/20 text-warning-400'
              }`}>
                {report.scopeType === 'national' ? '全国' : report.scopeType === 'province' ? '省级' : '工厂'}
              </span>
            </div>

            <h3 className="text-base font-medium text-white mb-1 group-hover:text-primary-400 transition-colors">
              {report.title}
            </h3>
            <p className="text-sm text-text-muted mb-4">{report.period}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-text-muted mb-1">总回收量</p>
                <p className="text-lg font-bold font-mono text-white">
                  {formatNumber(report.summary.totalRecycled)}
                  <span className="text-xs text-text-muted font-normal ml-1">吨</span>
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-text-muted mb-1">碳减排</p>
                <p className="text-lg font-bold font-mono text-accent-400">
                  {formatNumber(report.summary.carbonReduction)}
                  <span className="text-xs text-text-muted font-normal ml-1">吨</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="text-xs text-text-muted">
                {report.createTime.slice(0, 10)}
              </span>
              <button className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 group-hover:gap-2 transition-all">
                查看详情
                <TrendingUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const ReportDetail = () => {
    if (!selectedReport) return null;

    const report = selectedReport;
    const { summary } = report;

    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="page-title">{report.title}</h1>
              <span className="px-2.5 py-1 text-sm bg-primary-500/20 text-primary-400 rounded-full">
                {report.period}
              </span>
            </div>
            <p className="text-sm text-text-muted mt-1">
              {report.scopeName} · {report.startDate} ~ {report.endDate}
            </p>
          </div>
          <button className="btn-primary text-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出报告
          </button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: '总回收量', value: formatNumber(summary.totalRecycled), unit: '吨', trend: summary.totalRecycledMoM, yoy: summary.totalRecycledYoY, icon: Recycle, color: 'primary' },
            { label: '梯次合格率', value: summary.cascadeQualifyRate.toFixed(1), unit: '%', trend: 2.3, yoy: summary.cascadeQualifyRateYoY, icon: TrendingUp, color: 'accent' },
            { label: '回收率', value: summary.recoveryRate.toFixed(1), unit: '%', trend: 0.8, yoy: summary.recoveryRateYoY, icon: Zap, color: 'warning' },
            { label: '平均SOH', value: summary.avgSOH.toFixed(1), unit: '%', trend: -0.5, yoy: summary.avgSOHYoY, icon: Battery, color: 'info' },
            { label: '碳减排量', value: formatNumber(summary.carbonReduction), unit: '吨CO₂', trend: 5.2, yoy: summary.carbonReductionYoY, icon: Leaf, color: 'accent' },
            { label: '活跃预警', value: '3', unit: '个', trend: -2, yoy: -3, icon: AlertTriangle, color: 'danger' },
          ].map((item, index) => {
            const TrendIcon = getTrendIcon(item.trend);
            const YoYIcon = getTrendIcon(item.yoy);
            const colorClasses: Record<string, string> = {
              primary: 'text-primary-400 bg-primary-500/10 border-primary-500/20',
              accent: 'text-accent-400 bg-accent-500/10 border-accent-500/20',
              warning: 'text-warning-400 bg-warning-500/10 border-warning-500/20',
              info: 'text-info-400 bg-info-500/10 border-info-500/20',
              danger: 'text-danger-400 bg-danger-500/10 border-danger-500/20',
            };

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                className="glass-card p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-text-muted">{item.label}</span>
                  <div className={`w-8 h-8 rounded-lg border ${colorClasses[item.color]} flex items-center justify-center`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold font-mono text-white mb-2">
                  {item.value}
                  <span className="text-sm text-text-muted font-normal ml-1">{item.unit}</span>
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <div className={`flex items-center gap-1 ${getTrendColor(item.trend)}`}>
                    <TrendIcon className="w-3 h-3" />
                    <span>环比 {Math.abs(item.trend).toFixed(1)}%</span>
                  </div>
                  <div className={`flex items-center gap-1 ${getTrendColor(item.yoy)}`}>
                    <YoYIcon className="w-3 h-3" />
                    <span>同比 {Math.abs(item.yoy).toFixed(1)}%</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-5 h-5 text-primary-400" />
              <h3 className="section-title">核心指标同比环比</h3>
            </div>

            <div className="space-y-4">
              {[
                { name: '总回收量', current: summary.totalRecycled, mom: summary.totalRecycledMoM, yoy: summary.totalRecycledYoY, unit: '吨' },
                { name: '梯次合格率', current: summary.cascadeQualifyRate, mom: 2.3, yoy: summary.cascadeQualifyRateYoY, unit: '%' },
                { name: '回收率', current: summary.recoveryRate, mom: 0.8, yoy: summary.recoveryRateYoY, unit: '%' },
                { name: '碳减排量', current: summary.carbonReduction, mom: 5.2, yoy: summary.carbonReductionYoY, unit: '吨' },
                { name: '平均SOH', current: summary.avgSOH, mom: -0.5, yoy: summary.avgSOHYoY, unit: '%' },
              ].map((item, index) => {
                const MomIcon = getTrendIcon(item.mom);
                const YoyIcon = getTrendIcon(item.yoy);

                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white">{item.name}</span>
                      <span className="text-lg font-bold font-mono text-white">
                        {typeof item.current === 'number' && item.current > 1000
                          ? formatNumber(item.current)
                          : item.current.toFixed(1)}
                        <span className="text-xs text-text-muted font-normal ml-1">{item.unit}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-text-muted">环比</span>
                        <div className={`flex items-center gap-1 ${getTrendColor(item.mom)}`}>
                          <MomIcon className="w-3 h-3" />
                          {Math.abs(item.mom).toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-text-muted">同比</span>
                        <div className={`flex items-center gap-1 ${getTrendColor(item.yoy)}`}>
                          <YoyIcon className="w-3 h-3" />
                          {Math.abs(item.yoy).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Lightbulb className="w-5 h-5 text-warning-400" />
              <h3 className="section-title">优化建议</h3>
            </div>

            <div className="space-y-3">
              {report.suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.55 + index * 0.08 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-warning-500/10 to-transparent border border-warning-500/20"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-warning-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-warning-400">{index + 1}</span>
                    </div>
                    <p className="text-sm text-white leading-relaxed">{suggestion}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle className="w-5 h-5 text-accent-400" />
            <h3 className="section-title">碳减排贡献对比</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: '梯次利用减排', value: 28560, unit: '吨CO₂', percent: 62.6, color: 'bg-accent-500' },
              { name: '材料回收减排', value: 14280, unit: '吨CO₂', percent: 31.3, color: 'bg-primary-500' },
              { name: '能量回收减排', value: 2140, unit: '吨CO₂', percent: 4.7, color: 'bg-info-500' },
              { name: '其他减排', value: 640, unit: '吨CO₂', percent: 1.4, color: 'bg-warning-500' },
            ].map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <p className="text-sm text-text-muted mb-2">{item.name}</p>
                <p className="text-xl font-bold font-mono text-white mb-2">
                  {formatNumber(item.value)}
                  <span className="text-xs text-text-muted font-normal ml-1">{item.unit}</span>
                </p>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ duration: 0.8, delay: 0.8 + index * 0.05, ease: 'easeOut' }}
                    className={`h-full ${item.color} rounded-full`}
                  />
                </div>
                <p className="text-xs text-text-muted mt-1.5">占比 {item.percent}%</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {viewMode === 'list' ? (
        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <ReportList />
        </motion.div>
      ) : (
        <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <ReportDetail />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HealthReportPage;
