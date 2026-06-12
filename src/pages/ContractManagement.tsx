import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  Search,
  Filter,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  CheckCircle,
  ChevronDown,
  Plus,
  X,
  Download,
  File,
  User,
  ArrowRight,
  Info,
  CheckSquare,
  Square,
  ChevronLeft,
  History,
  FileBarChart,
  AlertTriangle,
  GripVertical,
} from 'lucide-react';
import {
  Contract,
  ContractStatus,
  BreachOrderStatus,
  BreachOrder,
  BreachResolution,
  InspectionReportRecord,
  QuantityChangeLog,
  BreachProcessRecord,
} from '@/types';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { useContractStore, ContractImportPreview, ReportImportPreview } from '@/store/useContractStore';
import { useAuthStore } from '@/store/useAuthStore';

const ContractManagement = () => {
  const { user } = useAuthStore();
  const {
    contracts,
    breachOrders,
    parseContractFile,
    confirmImportContracts,
    parseReportFile,
    confirmImportReport,
    getContractById,
    getBreachOrdersByContractId,
    startProcessBreachOrder,
    resolveBreachOrder,
  } = useContractStore();

  const [activeTab, setActiveTab] = useState<'contracts' | 'breach'>('contracts');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'contract' | 'report'>('contract');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedContractIdForReport, setSelectedContractIdForReport] = useState<string>('');
  const [parsing, setParsing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [parseSuccess, setParseSuccess] = useState(false);
  const [parseFailed, setParseFailed] = useState(false);
  const [importMessage, setImportMessage] = useState<string>('');
  const [contractPreview, setContractPreview] = useState<ContractImportPreview | null>(null);
  const [reportPreview, setReportPreview] = useState<ReportImportPreview | null>(null);

  const [selectedPreviewContractIds, setSelectedPreviewContractIds] = useState<Set<string>>(new Set());

  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  const [startProcessModalOpen, setStartProcessModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [processHandler, setProcessHandler] = useState('赵法务');
  const [processOpinion, setProcessOpinion] = useState('');
  const [processResolution, setProcessResolution] = useState<BreachResolution>('pay_compensation');

  const userProvinceIds = useMemo(() => {
    if (user?.role === 'group_admin' || user?.role === 'technical_director' || user?.role === 'legal') {
      return null;
    }
    return user?.provinceIds || [];
  }, [user]);

  const visibleContracts = useMemo(() => {
    let data: Contract[];
    if (userProvinceIds === null) {
      data = contracts;
    } else {
      data = contracts.filter((c) => userProvinceIds.includes(c.provinceId));
    }

    if (statusFilter !== 'all') {
      data = data.filter((c) => c.status === statusFilter);
    }
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      data = data.filter(
        (c) =>
          c.contractNo.toLowerCase().includes(keyword) ||
          c.partyA.toLowerCase().includes(keyword) ||
          c.partyB.toLowerCase().includes(keyword)
      );
    }
    return data;
  }, [contracts, userProvinceIds, statusFilter, searchKeyword]);

  const visibleBreachOrders = useMemo(() => {
    if (userProvinceIds === null) {
      return breachOrders;
    }
    return breachOrders.filter((b) => userProvinceIds.includes(b.provinceId));
  }, [breachOrders, userProvinceIds]);

  const selectedContractDetail = useMemo(() => {
    if (!selectedContractId) return null;
    return getContractById(selectedContractId);
  }, [selectedContractId, contracts, getContractById]);

  const contractBreachOrders = useMemo(() => {
    if (!selectedContractId) return [];
    return getBreachOrdersByContractId(selectedContractId);
  }, [selectedContractId, breachOrders, getBreachOrdersByContractId]);

  useEffect(() => {
    if (contractPreview) {
      setSelectedPreviewContractIds(new Set(contractPreview.contracts.map((c) => c.id)));
    }
  }, [contractPreview]);

  const getStatusLabel = (status: ContractStatus): string => {
    const labels = {
      active: '履约中',
      fulfilled: '已完成',
      breached: '已违约',
      expired: '已过期',
    };
    return labels[status];
  };

  const getStatusColor = (status: ContractStatus): string => {
    const colors = {
      active: 'bg-accent-500/20 text-accent-400',
      fulfilled: 'bg-primary-500/20 text-primary-400',
      breached: 'bg-danger-500/20 text-danger-400',
      expired: 'bg-dark-600/50 text-text-muted',
    };
    return colors[status];
  };

  const getBreachStatusLabel = (status: BreachOrderStatus): string => {
    const labels = {
      pending: '待处理',
      processing: '处理中',
      resolved: '已解决',
    };
    return labels[status];
  };

  const getBreachStatusColor = (status: BreachOrderStatus): string => {
    const colors = {
      pending: 'bg-warning-500/20 text-warning-400',
      processing: 'bg-primary-500/20 text-primary-400',
      resolved: 'bg-accent-500/20 text-accent-400',
    };
    return colors[status];
  };

  const getBreachResolutionLabel = (resolution?: BreachResolution): string => {
    if (!resolution) return '';
    const labels = {
      pay_compensation: '支付违约金',
      make_up_delivery: '补回交付量',
      terminate_contract: '终止合同',
      other: '其他方式',
    };
    return labels[resolution];
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setParsing(true);
    setParseSuccess(false);
    setParseFailed(false);
    setImportMessage('');
    setContractPreview(null);
    setReportPreview(null);

    try {
      let result;
      if (uploadType === 'contract') {
        result = await parseContractFile(file);
      } else {
        result = await parseReportFile(file, selectedContractIdForReport);
      }

      setImportMessage(result.message);
      if (result.success) {
        setParseSuccess(true);
        if (uploadType === 'contract' && result.preview) {
          setContractPreview(result.preview as ContractImportPreview);
        } else if (uploadType === 'report' && result.preview) {
          setReportPreview(result.preview as ReportImportPreview);
        }
      } else {
        setParseFailed(true);
      }
    } catch (err) {
      setParseFailed(true);
      setImportMessage('解析失败');
    }

    setParsing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      handleFileUpload(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleConfirmImport = () => {
    let result;
    if (uploadType === 'contract' && contractPreview) {
      result = confirmImportContracts({
        preview: contractPreview,
        selectedIds: Array.from(selectedPreviewContractIds),
      });
    } else if (uploadType === 'report' && reportPreview) {
      result = confirmImportReport(reportPreview);
    }
    if (result) {
      alert(result.message);
    }
    closeModal();
  };

  const closeModal = () => {
    setShowUploadModal(false);
    setUploadedFile(null);
    setParseSuccess(false);
    setParseFailed(false);
    setImportMessage('');
    setContractPreview(null);
    setReportPreview(null);
    setSelectedContractIdForReport('');
    setSelectedPreviewContractIds(new Set());
  };

  const togglePreviewContract = (id: string) => {
    setSelectedPreviewContractIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!contractPreview) return;
    if (selectedPreviewContractIds.size === contractPreview.contracts.length) {
      setSelectedPreviewContractIds(new Set());
    } else {
      setSelectedPreviewContractIds(new Set(contractPreview.contracts.map((c) => c.id)));
    }
  };

  const openContractDetail = (contractId: string) => {
    setSelectedContractId(contractId);
    setDetailDrawerOpen(true);
  };

  const closeDetailDrawer = () => {
    setDetailDrawerOpen(false);
    setTimeout(() => setSelectedContractId(null), 300);
  };

  const openStartProcessModal = (orderId: string) => {
    setActiveOrderId(orderId);
    setProcessHandler('赵法务');
    setProcessOpinion('');
    setStartProcessModalOpen(true);
  };

  const openResolveModal = (orderId: string) => {
    setActiveOrderId(orderId);
    setProcessHandler('赵法务');
    setProcessOpinion('');
    setProcessResolution('pay_compensation');
    setResolveModalOpen(true);
  };

  const handleStartProcess = () => {
    if (!activeOrderId || !processOpinion.trim()) return;
    const result = startProcessBreachOrder(activeOrderId, processHandler, processOpinion);
    alert(result.message);
    setStartProcessModalOpen(false);
    setActiveOrderId(null);
  };

  const handleResolve = () => {
    if (!activeOrderId || !processOpinion.trim()) return;
    const result = resolveBreachOrder(activeOrderId, processHandler, processOpinion, processResolution);
    alert(result.message);
    setResolveModalOpen(false);
    setActiveOrderId(null);
  };

  const statuses: { value: ContractStatus | 'all'; label: string; icon: any }[] = [
    { value: 'all', label: '全部', icon: null },
    { value: 'active', label: '履约中', icon: CheckCircle },
    { value: 'breached', label: '已违约', icon: AlertCircle },
    { value: 'fulfilled', label: '已完成', icon: CheckCircle },
    { value: 'expired', label: '已过期', icon: Clock },
  ];

  const canUpload = user?.role === 'group_admin' || user?.role === 'legal' || user?.role === 'region_manager';

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="page-title">合同管理</h1>
          <p className="text-sm text-text-muted mt-1">
            管理回收合同、检测报告及违约工单
            {userProvinceIds && userProvinceIds.length > 0 && (
              <span className="ml-2 text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">
                仅显示所辖区域数据
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canUpload && (
            <>
              <button
                onClick={() => {
                  setUploadType('report');
                  setShowUploadModal(true);
                }}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                上传检测报告
              </button>
              <button
                onClick={() => {
                  setUploadType('contract');
                  setShowUploadModal(true);
                }}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                上传合同
              </button>
            </>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card p-1.5 inline-flex"
      >
        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'contracts'
              ? 'bg-primary-500/20 text-primary-400'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            合同列表
            <span className="text-xs text-text-muted">({visibleContracts.length})</span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab('breach')}
          className={`px-5 py-2 text-sm font-medium rounded-lg transition-all relative ${
            activeTab === 'breach'
              ? 'bg-primary-500/20 text-primary-400'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            违约工单
            <span className="px-1.5 py-0.5 text-xs bg-danger-500/20 text-danger-400 rounded-full">
              {visibleBreachOrders.filter(o => o.status !== 'resolved').length}
            </span>
          </span>
        </button>
      </motion.div>

      {activeTab === 'contracts' && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex items-center gap-4 p-4 glass-card"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-muted">状态</span>
              <div className="flex gap-1">
                {statuses.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setStatusFilter(status.value)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
                      statusFilter === status.value
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'text-text-secondary hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {status.icon && <status.icon className="w-3.5 h-3.5" />}
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="ml-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索合同号、甲乙方..."
                className="pl-10 pr-4 py-2 w-64 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary-500/50"
              />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {visibleContracts.map((contract, index) => (
                <motion.div
                  key={contract.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.03 }}
                  layout
                  className="glass-card-hover p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                      <FileSpreadsheet className="w-6 h-6 text-primary-400" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-medium text-white">
                          {contract.contractNo}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs rounded-md ${getStatusColor(contract.status)}`}>
                          {getStatusLabel(contract.status)}
                        </span>
                        <span className="text-xs text-text-muted">{contract.provinceName}</span>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-text-muted mb-1">甲方</p>
                          <p className="text-sm text-white">{contract.partyA}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted mb-1">乙方</p>
                          <p className="text-sm text-white">{contract.partyB}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted mb-1">合同期限</p>
                          <p className="text-sm text-white">
                            {contract.startDate} ~ {contract.endDate}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted mb-1">单价</p>
                          <p className="text-sm text-accent-400 font-mono">
                            {formatCurrency(contract.unitPrice)}/吨
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-text-muted">履约进度</span>
                            <span className="text-white">
                              {contract.actualQuantity} / {contract.agreedQuantity} 吨
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                contract.actualQuantity / contract.agreedQuantity >= 0.9
                                  ? 'bg-gradient-to-r from-accent-600 to-accent-400'
                                  : contract.actualQuantity / contract.agreedQuantity >= 0.6
                                  ? 'bg-gradient-to-r from-primary-600 to-primary-400'
                                  : 'bg-gradient-to-r from-warning-600 to-warning-400'
                              }`}
                              style={{
                                width: `${Math.min(100, (contract.actualQuantity / contract.agreedQuantity) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-text-muted mb-0.5">完成率</p>
                          <p className={`text-lg font-bold font-mono ${
                            contract.actualQuantity / contract.agreedQuantity >= 0.9 ? 'text-accent-400' :
                            contract.actualQuantity / contract.agreedQuantity >= 0.6 ? 'text-primary-400' :
                            'text-warning-400'
                          }`}>
                            {((contract.actualQuantity / contract.agreedQuantity) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-muted">电池型号:</span>
                          {contract.batteryModels.map((model) => (
                            <span
                              key={model}
                              className="px-2 py-0.5 text-xs bg-white/5 text-text-secondary rounded"
                            >
                              {model}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="px-3 py-1.5 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded-md transition-colors flex items-center gap-1.5">
                            <Download className="w-3.5 h-3.5" />
                            下载合同
                          </button>
                          <button
                            onClick={() => openContractDetail(contract.id)}
                            className="btn-secondary text-xs"
                          >
                            详情
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {visibleContracts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 glass-card"
              >
                <FileText className="w-12 h-12 mx-auto text-text-muted mb-3" />
                <p className="text-text-muted">暂无合同数据</p>
              </motion.div>
            )}
          </div>
        </>
      )}

      {activeTab === 'breach' && (
        <div className="space-y-3">
          {visibleBreachOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 glass-card"
            >
              <CheckCircle className="w-12 h-12 mx-auto text-accent-400 mb-3" />
              <p className="text-text-muted">暂无违约工单</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {visibleBreachOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                  layout
                  className="glass-card-hover p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-danger-500/10 border border-danger-500/20 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-danger-400" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-medium text-white">
                          {order.contractNo} 违约工单
                        </h3>
                        <span className={`px-2 py-0.5 text-xs rounded-md ${getBreachStatusColor(order.status)}`}>
                          {getBreachStatusLabel(order.status)}
                        </span>
                      </div>

                      <p className="text-sm text-text-secondary mb-3">{order.reason}</p>

                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-text-muted mb-1">缺口量</p>
                          <p className="text-lg font-mono text-danger-400 font-bold">
                            {order.shortfall} 吨
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted mb-1">预估损失</p>
                          <p className="text-lg font-mono text-warning-400 font-bold">
                            {formatCurrency(order.estimatedLoss)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted mb-1">处理人</p>
                          <p className="text-sm text-white flex items-center gap-1.5">
                            {order.handler ? (
                              <>
                                <User className="w-3.5 h-3.5 text-primary-400" />
                                {order.handler}
                                <span className="text-xs text-accent-400 ml-1">(已分派)</span>
                              </>
                            ) : (
                              <span className="text-text-muted">待分配</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted mb-1">创建时间</p>
                          <p className="text-sm text-white">{order.createTime}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {order.status !== 'resolved' && (
                        <button
                          onClick={() => openContractDetail(order.contractId)}
                          className="btn-primary text-xs"
                        >
                          处理工单
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      <AnimatePresence>
        {showUploadModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className={`fixed inset-x-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
                parseSuccess && contractPreview ? 'w-[720px] max-h-[85vh] overflow-y-auto' : 'w-[560px]'
              } bg-dark-900 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden`}
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h3 className="text-lg font-semibold text-white">
                  {uploadType === 'contract' ? '上传回收合同' : '上传检测报告'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {uploadType === 'report' && !parseSuccess && (
                  <div>
                    <label className="text-sm text-text-muted block mb-1.5">
                      选择对应合同 <span className="text-danger-400">*</span>
                    </label>
                    <select
                      value={selectedContractIdForReport}
                      onChange={(e) => setSelectedContractIdForReport(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500/50"
                    >
                      <option value="">请选择合同</option>
                      {visibleContracts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.contractNo} - {c.partyA} ({c.provinceName}) | 约定{c.agreedQuantity}吨 / 实际{c.actualQuantity}吨
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-text-muted mt-1">
                      如果报告中包含合同号，系统也会自动识别匹配
                    </p>
                  </div>
                )}

                {!parseSuccess && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                      dragOver
                        ? 'border-primary-500/50 bg-primary-500/5'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileInput}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary-500/10 flex items-center justify-center">
                      <Upload className="w-7 h-7 text-primary-400" />
                    </div>
                    <p className="text-white font-medium mb-1">
                      拖拽文件到此处，或点击选择
                    </p>
                    <p className="text-sm text-text-muted">
                      支持 Excel 格式 (.xlsx, .xls)，系统将自动提取关键参数
                    </p>
                  </div>
                )}

                {uploadedFile && !parseSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center">
                        <File className="w-5 h-5 text-accent-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      {parsing ? (
                        <div className="text-xs text-primary-400 flex items-center gap-1.5">
                          <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                          解析中...
                        </div>
                      ) : parseFailed ? (
                        <div className="text-xs text-danger-400 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          失败
                        </div>
                      ) : null}
                    </div>

                    {importMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t border-white/5"
                      >
                        <p className={`text-sm ${parseFailed ? 'text-danger-400' : 'text-text-muted'}`}>
                          {importMessage}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {parseSuccess && contractPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-xl bg-accent-500/10 border border-accent-500/30 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-5 h-5 text-accent-400" />
                      </div>
                      <div>
                        <p className="text-accent-400 font-medium">解析成功 - 以下是预览信息</p>
                        <p className="text-xs text-text-muted mt-0.5">
                          点击"确认导入"后才会写入合同列表和违约工单
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs text-text-muted mb-1">合同总数</p>
                        <p className="text-2xl font-bold text-white font-mono">{contractPreview.contracts.length}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs text-text-muted mb-1">存在违约风险</p>
                        <p className={`text-2xl font-bold font-mono ${
                          contractPreview.breachCount > 0 ? 'text-danger-400' : 'text-accent-400'
                        }`}>
                          {contractPreview.breachCount}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-text-muted">合同明细：</p>
                      <button
                        onClick={toggleSelectAll}
                        className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        {selectedPreviewContractIds.size === contractPreview.contracts.length
                          ? '取消全选'
                          : '全选'}
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {contractPreview.contracts.map((c, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => togglePreviewContract(c.id)}
                              className="mt-0.5 shrink-0"
                            >
                              {selectedPreviewContractIds.has(c.id) ? (
                                <CheckSquare className="w-5 h-5 text-primary-400" />
                              ) : (
                                <Square className="w-5 h-5 text-text-muted" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-white truncate">{c.contractNo}</span>
                                <span className={`px-2 py-0.5 text-xs rounded-md shrink-0 ml-2 ${
                                  c.status === 'breached'
                                    ? 'bg-danger-500/20 text-danger-400'
                                    : 'bg-accent-500/20 text-accent-400'
                                }`}>
                                  {c.status === 'breached' ? '违约' : '正常'}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-text-muted">甲方：</span>
                                  <span className="text-text-secondary">{c.partyA}</span>
                                </div>
                                <div>
                                  <span className="text-text-muted">乙方：</span>
                                  <span className="text-text-secondary">{c.partyB}</span>
                                </div>
                                <div>
                                  <span className="text-text-muted">省份：</span>
                                  <span className="text-text-secondary">{c.provinceName}</span>
                                </div>
                                <div>
                                  <span className="text-text-muted">单价：</span>
                                  <span className="text-accent-400 font-mono">{formatCurrency(c.unitPrice)}/吨</span>
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-white/5">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-text-muted">履约进度</span>
                                  <span className="text-white font-mono">
                                    {c.actualQuantity} / {c.agreedQuantity} 吨
                                  </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400"
                                    style={{
                                      width: `${Math.min(100, (c.actualQuantity / c.agreedQuantity) * 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-sm text-text-secondary text-center">
                      已选中 <span className="text-primary-400 font-bold">{selectedPreviewContractIds.size}</span> / {contractPreview.contracts.length} 份合同
                    </div>

                    {contractPreview.breachCount > 0 && (
                      <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/30 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-danger-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-danger-400">
                          {contractPreview.breachCount} 份合同实际回收量未达标（低于约定量的90%），
                          确认导入后将自动生成违约工单并分派给"赵法务"处理。
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {parseSuccess && reportPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-xl bg-accent-500/10 border border-accent-500/30 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-5 h-5 text-accent-400" />
                      </div>
                      <div>
                        <p className="text-accent-400 font-medium">解析成功 - 以下是预览信息</p>
                        <p className="text-xs text-text-muted mt-0.5">
                          点击"确认导入"后才会更新合同数据和违约工单状态
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-text-muted mb-3">匹配到的合同：</p>
                      <p className="text-base font-medium text-white mb-2">{reportPreview.contractNo}</p>

                      <div className="flex items-center justify-center gap-4 my-4">
                        <div className="text-center">
                          <p className="text-xs text-text-muted mb-1">原实际量</p>
                          <p className="text-lg font-bold text-text-secondary font-mono">
                            {reportPreview.oldActualQuantity}吨
                          </p>
                        </div>
                        <div className="flex flex-col items-center">
                          <ArrowRight className="w-5 h-5 text-primary-400" />
                          <span className="text-xs text-primary-400 mt-1">覆盖</span>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-text-muted mb-1">新实际量</p>
                          <p className="text-lg font-bold text-accent-400 font-mono">
                            {reportPreview.newActualQuantity}吨
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-text-muted mb-1">约定量</p>
                          <p className="text-lg font-bold text-text-secondary font-mono">
                            {reportPreview.agreedQuantity}吨
                          </p>
                        </div>
                      </div>

                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-primary-600 to-primary-400"
                          style={{
                            width: `${Math.min(100, (reportPreview.newActualQuantity / reportPreview.agreedQuantity) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-text-muted mt-1.5 text-right font-mono">
                        完成率：{((reportPreview.newActualQuantity / reportPreview.agreedQuantity) * 100).toFixed(1)}%
                      </p>
                    </div>

                    <div className={`p-3 rounded-lg border flex items-start gap-2 ${
                      reportPreview.breachChange === 'generated'
                        ? 'bg-danger-500/10 border-danger-500/30'
                        : reportPreview.breachChange === 'resolved'
                        ? 'bg-accent-500/10 border-accent-500/30'
                        : 'bg-white/5 border-white/10'
                    }`}>
                      <Info className={`w-4 h-4 mt-0.5 shrink-0 ${
                        reportPreview.breachChange === 'generated'
                          ? 'text-danger-400'
                          : reportPreview.breachChange === 'resolved'
                          ? 'text-accent-400'
                          : 'text-text-muted'
                      }`} />
                      <p className={`text-xs ${
                        reportPreview.breachChange === 'generated'
                          ? 'text-danger-400'
                          : reportPreview.breachChange === 'resolved'
                          ? 'text-accent-400'
                          : 'text-text-muted'
                      }`}>
                        {reportPreview.breachChange === 'generated' && (
                          <>⚠️ 覆盖后从达标变为未达标，确认导入后将自动生成违约工单并派发给"赵法务"</>
                        )}
                        {reportPreview.breachChange === 'resolved' && (
                          <>✅ 覆盖后从未达标变为达标，确认导入后原违约工单将标记为"已解决"</>
                        )}
                        {reportPreview.breachChange === 'none' && (
                          <>ℹ️ 违约状态无变化，仅更新实际回收量</>
                        )}
                      </p>
                    </div>
                  </motion.div>
                )}

                {!parseSuccess && (
                  <div className="p-3 rounded-lg bg-warning-500/10 border border-warning-500/20">
                    <p className="text-xs text-warning-400">
                      💡 提示: {uploadType === 'contract' 
                        ? '合同 Excel 需包含合同号、甲乙双方、约定回收量、实际回收量、省份、单价等字段' 
                        : '检测报告 Excel 需包含合同号、回收量等字段，请务必选择对应合同'}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 p-5 border-t border-white/5">
                <button
                  onClick={closeModal}
                  className="btn-secondary text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={!parseSuccess || (!contractPreview && !reportPreview) || (contractPreview && selectedPreviewContractIds.size === 0)}
                  className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确认导入
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailDrawerOpen && selectedContractDetail && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDetailDrawer}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: 720 }}
              animate={{ x: 0 }}
              exit={{ x: 720 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 bottom-0 w-[720px] bg-dark-900 border-l border-white/10 shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={closeDetailDrawer}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-text-secondary" />
                  </button>
                  <h3 className="text-lg font-semibold text-white">合同详情</h3>
                </div>
                <button
                  onClick={closeDetailDrawer}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="glass-card p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{selectedContractDetail.contractNo}</h2>
                      <span className={`px-2.5 py-1 text-xs rounded-md ${getStatusColor(selectedContractDetail.status)}`}>
                        {getStatusLabel(selectedContractDetail.status)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-muted mb-1">导入来源</p>
                      <p className="text-sm text-white">
                        {selectedContractDetail.importSource === 'excel'
                          ? `Excel 导入 (${selectedContractDetail.importFileName || '未知文件'})`
                          : '手动创建'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-text-muted mb-1">甲方</p>
                      <p className="text-sm text-white">{selectedContractDetail.partyA}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">乙方</p>
                      <p className="text-sm text-white">{selectedContractDetail.partyB}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">省份</p>
                      <p className="text-sm text-white">{selectedContractDetail.provinceName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">合同期限</p>
                      <p className="text-sm text-white">
                        {selectedContractDetail.startDate} ~ {selectedContractDetail.endDate}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-text-muted mb-1">约定量</p>
                        <p className="text-lg font-bold text-white font-mono">
                          {selectedContractDetail.agreedQuantity} 吨
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">实际量</p>
                        <p className="text-lg font-bold text-primary-400 font-mono">
                          {selectedContractDetail.actualQuantity} 吨
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">单价</p>
                        <p className="text-lg font-bold text-accent-400 font-mono">
                          {formatCurrency(selectedContractDetail.unitPrice)}/吨
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-text-muted">完成率</span>
                        <span className={`font-bold font-mono ${
                          selectedContractDetail.actualQuantity / selectedContractDetail.agreedQuantity >= 0.9
                            ? 'text-accent-400'
                            : selectedContractDetail.actualQuantity / selectedContractDetail.agreedQuantity >= 0.6
                            ? 'text-primary-400'
                            : 'text-warning-400'
                        }`}>
                          {((selectedContractDetail.actualQuantity / selectedContractDetail.agreedQuantity) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            selectedContractDetail.actualQuantity / selectedContractDetail.agreedQuantity >= 0.9
                              ? 'bg-gradient-to-r from-accent-600 to-accent-400'
                              : selectedContractDetail.actualQuantity / selectedContractDetail.agreedQuantity >= 0.6
                              ? 'bg-gradient-to-r from-primary-600 to-primary-400'
                              : 'bg-gradient-to-r from-warning-600 to-warning-400'
                          }`}
                          style={{
                            width: `${Math.min(100, (selectedContractDetail.actualQuantity / selectedContractDetail.agreedQuantity) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {selectedContractDetail.batteryModels?.length > 0 && (
                    <div className="pt-4 mt-4 border-t border-white/5">
                      <p className="text-xs text-text-muted mb-2">电池型号</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedContractDetail.batteryModels.map((model) => (
                          <span
                            key={model}
                            className="px-2.5 py-1 text-xs bg-white/5 text-text-secondary rounded"
                          >
                            {model}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <History className="w-5 h-5 text-primary-400" />
                    <h4 className="text-base font-semibold text-white">回收量变化轨迹</h4>
                  </div>
                  {selectedContractDetail.quantityChanges && selectedContractDetail.quantityChanges.length > 0 ? (
                    <div className="space-y-0">
                      {[...selectedContractDetail.quantityChanges].reverse().map((change: QuantityChangeLog, idx: number) => (
                        <div key={change.id} className="relative pl-8 pb-5 last:pb-0">
                          {idx !== (selectedContractDetail.quantityChanges?.length || 0) - 1 && (
                            <div className="absolute left-[11px] top-6 bottom-0 w-px bg-white/10" />
                          )}
                          <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary-500/20 border border-primary-500/40 flex items-center justify-center">
                            <GripVertical className="w-3 h-3 text-primary-400" />
                          </div>
                          <div className="flex items-start justify-between mb-1">
                            <p className="text-sm text-white font-medium">{change.changeReason}</p>
                            <p className="text-xs text-text-muted">{change.changeTime}</p>
                          </div>
                          <p className="text-xs text-text-muted mb-1">操作人：{change.operator}</p>
                          <p className="text-xs font-mono">
                            <span className="text-text-secondary">{change.previousQuantity} 吨</span>
                            <ArrowRight className="w-3 h-3 inline mx-1.5 text-primary-400" />
                            <span className="text-primary-400 font-bold">{change.newQuantity} 吨</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <History className="w-10 h-10 mx-auto text-text-muted mb-2 opacity-50" />
                      <p className="text-sm text-text-muted">暂无变化记录</p>
                    </div>
                  )}
                </div>

                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <FileBarChart className="w-5 h-5 text-accent-400" />
                    <h4 className="text-base font-semibold text-white">检测报告导入记录</h4>
                  </div>
                  {selectedContractDetail.inspectionReports && selectedContractDetail.inspectionReports.length > 0 ? (
                    <div className="space-y-3">
                      {[...selectedContractDetail.inspectionReports].reverse().map((report: InspectionReportRecord) => (
                        <div key={report.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-white">
                              {report.reportNo}
                              {report.fileName && (
                                <span className="text-xs text-text-muted ml-2">({report.fileName})</span>
                              )}
                            </p>
                            <p className="text-xs text-text-muted">{report.importTime}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div>
                              <p className="text-text-muted mb-1">本次回收量</p>
                              <p className="text-white font-mono font-bold">{report.recycledQuantity} 吨</p>
                            </div>
                            <div>
                              <p className="text-text-muted mb-1">之前量</p>
                              <p className="text-text-secondary font-mono">{report.previousQuantity} 吨</p>
                            </div>
                            <div>
                              <p className="text-text-muted mb-1">之后量</p>
                              <p className="text-accent-400 font-mono font-bold">{report.newQuantity} 吨</p>
                            </div>
                          </div>
                          <p className="text-xs text-text-muted mt-2">操作人：{report.operator}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileBarChart className="w-10 h-10 mx-auto text-text-muted mb-2 opacity-50" />
                      <p className="text-sm text-text-muted">暂无检测报告记录</p>
                    </div>
                  )}
                </div>

                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-danger-400" />
                    <h4 className="text-base font-semibold text-white">违约工单</h4>
                    <span className="text-xs text-text-muted">({contractBreachOrders.length})</span>
                  </div>
                  {contractBreachOrders.length > 0 ? (
                    <div className="space-y-3">
                      {contractBreachOrders.map((order: BreachOrder, orderIdx: number) => (
                        <div key={order.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">
                                工单 #{String(orderIdx + 1).padStart(3, '0')}
                              </span>
                              <span className={`px-2 py-0.5 text-xs rounded-md ${getBreachStatusColor(order.status)}`}>
                                {getBreachStatusLabel(order.status)}
                              </span>
                            </div>
                            <p className="text-xs text-text-muted">{order.createTime}</p>
                          </div>
                          <p className="text-sm text-text-secondary mb-3">{order.reason}</p>
                          <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                            <div>
                              <p className="text-text-muted mb-1">缺口</p>
                              <p className="text-danger-400 font-mono font-bold">{order.shortfall} 吨</p>
                            </div>
                            <div>
                              <p className="text-text-muted mb-1">预估损失</p>
                              <p className="text-warning-400 font-mono font-bold">{formatCurrency(order.estimatedLoss)}</p>
                            </div>
                            <div>
                              <p className="text-text-muted mb-1">处理人</p>
                              <p className="text-white flex items-center gap-1">
                                {order.handler ? (
                                  <>
                                    <User className="w-3 h-3 text-primary-400" />
                                    {order.handler}
                                  </>
                                ) : (
                                  <span className="text-text-muted">待分配</span>
                                )}
                              </p>
                            </div>
                          </div>

                          {order.status === 'resolved' && (
                            <div className="mb-3 p-3 rounded-lg bg-accent-500/10 border border-accent-500/30">
                              <p className="text-xs text-text-muted mb-1">
                                处理结果 · {order.resolveTime}
                              </p>
                              {order.finalResolution && (
                                <p className="text-sm text-accent-400 font-medium mb-1">
                                  处理方式：{getBreachResolutionLabel(order.finalResolution)}
                                </p>
                              )}
                              {order.finalOpinion && (
                                <p className="text-xs text-text-secondary">{order.finalOpinion}</p>
                              )}
                            </div>
                          )}

                          {order.processRecords && order.processRecords.length > 0 && (
                            <div className="mb-3 pt-3 border-t border-white/5">
                              <p className="text-xs text-text-muted mb-2">处理记录</p>
                              <div className="space-y-0">
                                {order.processRecords.map((record: BreachProcessRecord, recordIdx: number) => (
                                  <div key={record.id} className="relative pl-6 pb-3 last:pb-0">
                                    {recordIdx !== (order.processRecords?.length || 0) - 1 && (
                                      <div className="absolute left-[7px] top-4 bottom-0 w-px bg-white/10" />
                                    )}
                                    <div className={`absolute left-0 top-1 w-4 h-4 rounded-full flex items-center justify-center ${
                                      record.status === 'resolved'
                                        ? 'bg-accent-500/20 border border-accent-500/40'
                                        : 'bg-primary-500/20 border border-primary-500/40'
                                    }`}>
                                      <div className={`w-1.5 h-1.5 rounded-full ${
                                        record.status === 'resolved' ? 'bg-accent-400' : 'bg-primary-400'
                                      }`} />
                                    </div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className={`text-xs font-medium ${
                                        record.status === 'resolved' ? 'text-accent-400' : 'text-primary-400'
                                      }`}>
                                        {getBreachStatusLabel(record.status)}
                                      </span>
                                      <span className="text-xs text-text-muted">{record.processTime}</span>
                                    </div>
                                    <p className="text-xs text-white">
                                      <User className="w-3 h-3 inline mr-1 text-text-muted" />
                                      {record.handler}
                                      {record.resolution && (
                                        <span className="ml-2 text-text-secondary">
                                          · {getBreachResolutionLabel(record.resolution)}
                                        </span>
                                      )}
                                    </p>
                                    {record.opinion && (
                                      <p className="text-xs text-text-secondary mt-0.5">{record.opinion}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {order.status === 'pending' && (
                            <div className="pt-3 border-t border-white/5">
                              <button
                                onClick={() => openStartProcessModal(order.id)}
                                className="btn-primary text-xs w-full"
                              >
                                开始处理
                              </button>
                            </div>
                          )}
                          {order.status === 'processing' && (
                            <div className="pt-3 border-t border-white/5">
                              <button
                                onClick={() => openResolveModal(order.id)}
                                className="btn-primary text-xs w-full"
                              >
                                解决工单
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-10 h-10 mx-auto text-accent-400 mb-2 opacity-50" />
                      <p className="text-sm text-text-muted">暂无违约工单</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {startProcessModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStartProcessModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-x-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] bg-dark-900 rounded-2xl border border-white/10 shadow-2xl z-[60] overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h3 className="text-lg font-semibold text-white">开始处理违约工单</h3>
                <button
                  onClick={() => setStartProcessModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm text-text-muted block mb-1.5">处理人</label>
                  <input
                    type="text"
                    value={processHandler}
                    onChange={(e) => setProcessHandler(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500/50"
                    placeholder="请输入处理人姓名"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-muted block mb-1.5">
                    处理意见 <span className="text-danger-400">*</span>
                  </label>
                  <textarea
                    value={processOpinion}
                    onChange={(e) => setProcessOpinion(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary-500/50 resize-none"
                    placeholder="请输入处理意见..."
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-5 border-t border-white/5">
                <button
                  onClick={() => setStartProcessModalOpen(false)}
                  className="btn-secondary text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleStartProcess}
                  disabled={!processOpinion.trim()}
                  className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确定
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {resolveModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setResolveModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-x-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] bg-dark-900 rounded-2xl border border-white/10 shadow-2xl z-[60] overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h3 className="text-lg font-semibold text-white">解决违约工单</h3>
                <button
                  onClick={() => setResolveModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm text-text-muted block mb-1.5">处理人</label>
                  <input
                    type="text"
                    value={processHandler}
                    onChange={(e) => setProcessHandler(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500/50"
                    placeholder="请输入处理人姓名"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-muted block mb-1.5">
                    处理方式 <span className="text-danger-400">*</span>
                  </label>
                  <select
                    value={processResolution}
                    onChange={(e) => setProcessResolution(e.target.value as BreachResolution)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500/50"
                  >
                    <option value="pay_compensation">支付违约金</option>
                    <option value="make_up_delivery">补回交付量</option>
                    <option value="terminate_contract">终止合同</option>
                    <option value="other">其他方式</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-text-muted block mb-1.5">
                    处理意见 <span className="text-danger-400">*</span>
                  </label>
                  <textarea
                    value={processOpinion}
                    onChange={(e) => setProcessOpinion(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary-500/50 resize-none"
                    placeholder="请输入处理意见..."
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-5 border-t border-white/5">
                <button
                  onClick={() => setResolveModalOpen(false)}
                  className="btn-secondary text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleResolve}
                  disabled={!processOpinion.trim()}
                  className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确定
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContractManagement;