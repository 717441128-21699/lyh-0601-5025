import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Search,
  Filter,
  Clock,
  MapPin,
  Factory,
  Battery,
  Activity,
  FileText,
  X,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';
import { useWarningStore } from '@/store/useWarningStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Warning, WarningStatus, WarningType } from '@/types';
import { ApprovalFlow } from '@/components/features/ApprovalFlow';
import dayjs from 'dayjs';

const WarningCenter = () => {
  const { warnings, statusFilter, typeFilter, searchKeyword, setStatusFilter, setTypeFilter, setSearchKeyword, getWarningsByProvince, getWarningById } = useWarningStore();
  const { user, isNationalRole } = useAuthStore();
  const isNational = isNationalRole();
  const [selectedWarningId, setSelectedWarningId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const selectedWarning = selectedWarningId ? getWarningById(selectedWarningId) : null;

  const filteredWarnings = useMemo(() => {
    let result = getWarningsByProvince(user?.provinceIds);

    if (statusFilter !== 'all') {
      result = result.filter((w) => w.status === statusFilter);
    }
    if (typeFilter !== 'all') {
      result = result.filter((w) => w.type === typeFilter);
    }
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(keyword) ||
          w.factoryName.toLowerCase().includes(keyword) ||
          w.provinceName.toLowerCase().includes(keyword)
      );
    }

    return result;
  }, [warnings, statusFilter, typeFilter, searchKeyword, user?.provinceIds, getWarningsByProvince]);

  const getWarningTypeLabel = (type: WarningType): string => {
    const labels = {
      soh_low: 'SOH偏低',
      utilization_low: '利用率偏低',
      contract_breach: '合同违约',
    };
    return labels[type];
  };

  const getWarningTypeColor = (type: WarningType): string => {
    const colors = {
      soh_low: 'bg-warning-500/20 text-warning-400 border-warning-500/30',
      utilization_low: 'bg-info-500/20 text-info-400 border-info-500/30',
      contract_breach: 'bg-danger-500/20 text-danger-400 border-danger-500/30',
    };
    return colors[type];
  };

  const getStatusLabel = (status: WarningStatus): string => {
    const labels = {
      pending: '待处理',
      approving: '审批中',
      resolved: '已解决',
      rejected: '已驳回',
    };
    return labels[status];
  };

  const getStatusColor = (status: WarningStatus): string => {
    const colors = {
      pending: 'bg-warning-500/20 text-warning-400',
      approving: 'bg-primary-500/20 text-primary-400',
      resolved: 'bg-accent-500/20 text-accent-400',
      rejected: 'bg-danger-500/20 text-danger-400',
    };
    return colors[status];
  };

  const getLevelColor = (level: number): string => {
    const colors = [
      'bg-danger-500',
      'bg-warning-500',
      'bg-primary-500',
    ];
    return colors[level - 1] || colors[0];
  };

  const handleViewDetail = (warning: Warning) => {
    setSelectedWarningId(warning.id);
    setShowDetail(true);
  };

  const statuses: { value: WarningStatus | 'all'; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'pending', label: '待处理' },
    { value: 'approving', label: '审批中' },
    { value: 'resolved', label: '已解决' },
    { value: 'rejected', label: '已驳回' },
  ];

  const types: { value: WarningType | 'all'; label: string }[] = [
    { value: 'all', label: '全部类型' },
    { value: 'soh_low', label: 'SOH偏低' },
    { value: 'utilization_low', label: '利用率偏低' },
    { value: 'contract_breach', label: '合同违约' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="page-title">预警中心</h1>
          <p className="text-sm text-text-muted mt-1">
            实时监测电池健康与设备状态，及时处理预警信息
          </p>
          {!isNational && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-warning-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>仅显示所辖区域数据</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索预警..."
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
        className="flex items-center gap-6 p-4 glass-card"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">状态</span>
          <div className="flex gap-1">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  statusFilter === status.value
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-text-secondary hover:bg-white/5 hover:text-white'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-6 w-px bg-white/10" />

        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">类型</span>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as WarningType | 'all')}
              className="appearance-none pr-8 pl-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500/50"
            >
              {types.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>
        </div>

        <div className="ml-auto text-sm text-text-muted">
          共 <span className="text-white font-medium">{filteredWarnings.length}</span> 条预警
        </div>
      </motion.div>

      <div className="space-y-3">
        <AnimatePresence>
          {filteredWarnings.map((warning, index) => (
            <motion.div
              key={warning.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => handleViewDetail(warning)}
              className="glass-card-hover p-5 cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getWarningTypeColor(warning.type)} border`}>
                  {warning.type === 'soh_low' && <Battery className="w-6 h-6" />}
                  {warning.type === 'utilization_low' && <Activity className="w-6 h-6" />}
                  {warning.type === 'contract_breach' && <FileText className="w-6 h-6" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <h3 className="text-base font-medium text-white group-hover:text-primary-400 transition-colors flex-1">
                      {warning.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 text-xs rounded-md border ${getWarningTypeColor(warning.type)}`}>
                        {getWarningTypeLabel(warning.type)}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-md ${getStatusColor(warning.status)}`}>
                        {getStatusLabel(warning.status)}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${getLevelColor(warning.level)}`} title={`${warning.level}级预警`} />
                    </div>
                  </div>

                  <p className="text-sm text-text-secondary mb-3 line-clamp-1">
                    {warning.description}
                  </p>

                  <div className="flex items-center gap-6 text-xs text-text-muted">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {warning.provinceName}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Factory className="w-3.5 h-3.5" />
                      {warning.factoryName}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {dayjs(warning.createTime).format('MM-DD HH:mm')}
                    </div>
                    {warning.consecutiveDays && (
                      <div className="text-warning-400">
                        连续 {warning.consecutiveDays} 天
                      </div>
                    )}
                    {warning.metricValue !== undefined && warning.threshold !== undefined && (
                      <div className="font-mono">
                        <span className="text-danger-400">{warning.metricValue}</span>
                        <span className="text-text-muted"> / {warning.threshold} (阈值)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-xs text-text-muted mb-1">审批进度</div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`w-6 h-1.5 rounded-full ${
                          warning.currentApprovalLevel >= level
                            ? 'bg-accent-500'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-text-muted mt-1">
                    {warning.currentApprovalLevel >= 3 ? '已完成' : `第${warning.currentApprovalLevel + 1}级审批中`}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredWarnings.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 glass-card"
          >
            <AlertTriangle className="w-12 h-12 mx-auto text-text-muted mb-3" />
            <p className="text-text-muted">暂无预警数据</p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showDetail && selectedWarning && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetail(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[520px] bg-dark-900 border-l border-white/10 z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-dark-900/95 backdrop-blur-xl border-b border-white/5 p-5 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">预警详情</h2>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-text-secondary" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs rounded-md border ${getWarningTypeColor(selectedWarning.type)}`}>
                      {getWarningTypeLabel(selectedWarning.type)}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-md ${getStatusColor(selectedWarning.status)}`}>
                      {getStatusLabel(selectedWarning.status)}
                    </span>
                    <span className="text-xs text-text-muted">
                      {selectedWarning.level}级预警
                    </span>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">{selectedWarning.title}</h3>
                  <p className="text-sm text-text-secondary">{selectedWarning.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-text-muted mb-1">所属省份</p>
                    <p className="text-sm text-white">{selectedWarning.provinceName}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-text-muted mb-1">涉及工厂</p>
                    <p className="text-sm text-white">{selectedWarning.factoryName}</p>
                  </div>
                  {selectedWarning.metricValue !== undefined && (
                    <div className="p-3 rounded-lg bg-white/5">
                      <p className="text-xs text-text-muted mb-1">当前指标</p>
                      <p className="text-sm text-danger-400 font-mono">{selectedWarning.metricValue}</p>
                    </div>
                  )}
                  {selectedWarning.threshold !== undefined && (
                    <div className="p-3 rounded-lg bg-white/5">
                      <p className="text-xs text-text-muted mb-1">预警阈值</p>
                      <p className="text-sm text-white font-mono">{selectedWarning.threshold}</p>
                    </div>
                  )}
                  <div className="p-3 rounded-lg bg-white/5 col-span-2">
                    <p className="text-xs text-text-muted mb-1">创建时间</p>
                    <p className="text-sm text-white">{selectedWarning.createTime}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white mb-4">审批流程</h4>
                  <ApprovalFlow warning={selectedWarning} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WarningCenter;
