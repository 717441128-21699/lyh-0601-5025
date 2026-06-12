import { motion } from 'framer-motion';
import { Check, X, Clock, User, FileText, ChevronRight } from 'lucide-react';
import { Warning, ApprovalRecord } from '@/types';
import { useState } from 'react';
import { useWarningStore } from '@/store/useWarningStore';
import { useAuthStore } from '@/store/useAuthStore';

interface ApprovalFlowProps {
  warning: Warning;
  onClose?: () => void;
}

const approvalSteps = [
  { level: 1, title: '品控确认', role: '品控人员', description: '核实预警数据真实性' },
  { level: 2, title: '技术总监复核', role: '技术总监', description: '评估技术方案可行性' },
  { level: 3, title: '集团总裁批准', role: '集团总裁', description: '最终决策审批' },
];

export const ApprovalFlow: React.FC<ApprovalFlowProps> = ({ warning, onClose }) => {
  const [opinion, setOpinion] = useState('');
  const [selectedResult, setSelectedResult] = useState<'pass' | 'reject' | 'adjust' | null>(null);
  const { approveWarning } = useWarningStore();
  const { user } = useAuthStore();

  const currentLevel = warning.currentApprovalLevel;
  const isCompleted = currentLevel >= 3 || warning.status === 'resolved' || warning.status === 'rejected';

  const canApprove = (level: number): boolean => {
    if (isCompleted) return false;
    if (warning.status === 'rejected') return false;
    return level === currentLevel + 1;
  };

  const getApprovalRecord = (level: number): ApprovalRecord | undefined => {
    return warning.approvalRecords.find((r) => r.level === level);
  };

  const getStatusIcon = (level: number) => {
    const record = getApprovalRecord(level);
    if (record?.result === 'pass' || record?.result === 'adjust') {
      return <Check className="w-4 h-4 text-white" />;
    }
    if (record?.result === 'reject') {
      return <X className="w-4 h-4 text-white" />;
    }
    if (canApprove(level)) {
      return <Clock className="w-4 h-4 text-white animate-pulse" />;
    }
    return <span className="text-xs font-mono">{level}</span>;
  };

  const getStatusColor = (level: number) => {
    const record = getApprovalRecord(level);
    if (record?.result === 'pass' || record?.result === 'adjust') {
      return 'bg-accent-500 border-accent-400';
    }
    if (record?.result === 'reject') {
      return 'bg-danger-500 border-danger-400';
    }
    if (canApprove(level)) {
      return 'bg-primary-500 border-primary-400 shadow-glow-primary';
    }
    return 'bg-dark-700 border-dark-600';
  };

  const handleSubmit = () => {
    if (!selectedResult || !opinion.trim()) return;
    const level = currentLevel + 1;
    approveWarning(warning.id, level, opinion, selectedResult);
    setSelectedResult(null);
    setOpinion('');
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-white/10" />
        <div className="flex justify-between relative">
          {approvalSteps.map((step, index) => {
            const record = getApprovalRecord(step.level);
            const isActive = canApprove(step.level);
            const isDone = record?.result === 'pass' || record?.result === 'adjust';

            return (
              <div key={step.level} className="flex flex-col items-center relative z-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getStatusColor(step.level)} transition-all duration-300`}
                >
                  {getStatusIcon(step.level)}
                </motion.div>
                <div className="mt-3 text-center">
                  <p className={`text-sm font-medium ${isActive || isDone ? 'text-white' : 'text-text-muted'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{step.role}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {approvalSteps.map((step, index) => {
          const record = getApprovalRecord(step.level);
          const isCurrent = canApprove(step.level);
          const hasRecord = !!record?.approveTime;

          return (
            <motion.div
              key={step.level}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`p-4 rounded-xl border ${
                isCurrent
                  ? 'bg-primary-500/10 border-primary-500/30'
                  : hasRecord
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white/[0.02] border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  hasRecord ? 'bg-accent-500/20' : isCurrent ? 'bg-primary-500/20' : 'bg-white/5'
                }`}>
                  <User className={`w-4 h-4 ${
                    hasRecord ? 'text-accent-400' : isCurrent ? 'text-primary-400' : 'text-text-muted'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{step.role}</span>
                    {record?.approveTime && (
                      <span className="text-xs text-text-muted">{record.approveTime}</span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{step.description}</p>

                  {record?.result && (
                    <div className="mt-3 p-3 rounded-lg bg-dark-900/50 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        {record.result === 'pass' && (
                          <span className="badge bg-accent-500/20 text-accent-400">通过</span>
                        )}
                        {record.result === 'reject' && (
                          <span className="badge bg-danger-500/20 text-danger-400">驳回</span>
                        )}
                        {record.result === 'adjust' && (
                          <span className="badge bg-warning-500/20 text-warning-400">调整方案</span>
                        )}
                        <span className="text-xs text-text-muted">— {record.approver}</span>
                      </div>
                      <p className="text-sm text-text-secondary">{record.opinion}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {!isCompleted && currentLevel < 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-5 rounded-xl bg-warning-500/10 border border-warning-500/30"
        >
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-warning-400" />
            <h4 className="font-medium text-white">
              {currentLevel === 0 ? '一级审批 - 品控确认' :
               currentLevel === 1 ? '二级审批 - 技术总监复核' :
               '三级审批 - 集团总裁批准'}
            </h4>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-text-muted block mb-1.5">审批意见</label>
              <textarea
                value={opinion}
                onChange={(e) => setOpinion(e.target.value)}
                placeholder="请输入审批意见..."
                className="w-full px-3 py-2.5 bg-dark-900/50 border border-white/10 rounded-lg text-sm text-white placeholder-text-muted focus:outline-none focus:border-warning-500/50 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedResult('pass')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  selectedResult === 'pass'
                    ? 'bg-accent-500 text-white'
                    : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-white/10'
                }`}
              >
                <Check className="w-4 h-4" />
                通过
              </button>
              <button
                onClick={() => setSelectedResult('adjust')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  selectedResult === 'adjust'
                    ? 'bg-warning-500 text-white'
                    : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-white/10'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
                调整方案
              </button>
              <button
                onClick={() => setSelectedResult('reject')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  selectedResult === 'reject'
                    ? 'bg-danger-500 text-white'
                    : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-white/10'
                }`}
              >
                <X className="w-4 h-4" />
                驳回
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedResult || !opinion.trim()}
              className="w-full py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              提交审批
            </button>
          </div>
        </motion.div>
      )}

      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="p-5 rounded-xl bg-accent-500/10 border border-accent-500/30 text-center"
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent-500/20 flex items-center justify-center">
            <Check className="w-6 h-6 text-accent-400" />
          </div>
          <p className="text-white font-medium">审批流程已完成</p>
          <p className="text-sm text-text-muted mt-1">
            {warning.status === 'resolved' ? '预警已解决' : '预警已驳回'}
          </p>
        </motion.div>
      )}
    </div>
  );
};
