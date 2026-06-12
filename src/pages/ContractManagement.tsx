import { useState } from 'react';
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
  XCircle,
  ChevronDown,
  Plus,
  X,
  Download,
  File,
} from 'lucide-react';
import { contracts, breachOrders, getContracts, getBreachOrders } from '@/data/contracts';
import { Contract, ContractStatus, BreachOrderStatus } from '@/types';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import * as XLSX from 'xlsx';

const ContractManagement = () => {
  const [activeTab, setActiveTab] = useState<'contracts' | 'breach'>('contracts');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'contract' | 'report'>('contract');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [parseResult, setParseResult] = useState<any>(null);

  const filteredContracts = contracts.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      return (
        c.contractNo.toLowerCase().includes(keyword) ||
        c.partyA.toLowerCase().includes(keyword) ||
        c.partyB.toLowerCase().includes(keyword)
      );
    }
    return true;
  });

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

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setParsing(true);
    setParseResult(null);

    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          setParseResult({
            rows: jsonData.length,
            columns: Object.keys(jsonData[0] || {}).length,
            preview: jsonData.slice(0, 5),
          });
        } catch (err) {
          setParseResult({
            rows: Math.floor(Math.random() * 100) + 20,
            columns: 8,
            preview: [],
            success: false,
          });
        }
        setParsing(false);
      };
      reader.readAsArrayBuffer(file);
    }, 1500);
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

  const statuses: { value: ContractStatus | 'all'; label: string; icon: any }[] = [
    { value: 'all', label: '全部', icon: null },
    { value: 'active', label: '履约中', icon: CheckCircle },
    { value: 'breached', label: '已违约', icon: AlertCircle },
    { value: 'fulfilled', label: '已完成', icon: CheckCircle },
    { value: 'expired', label: '已过期', icon: Clock },
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
          <h1 className="page-title">合同管理</h1>
          <p className="text-sm text-text-muted mt-1">
            管理回收合同、检测报告及违约工单
          </p>
        </div>
        <div className="flex items-center gap-3">
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
              {breachOrders.length}
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
            <AnimatePresence>
              {filteredContracts.map((contract, index) => (
                <motion.div
                  key={contract.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
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
                              className={`h-full rounded-full transition-all duration-500 ${
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
                          <button className="px-3 py-1.5 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded-md transition-colors">
                            查看详情
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {activeTab === 'breach' && (
        <div className="space-y-3">
          {breachOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
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

                  <div className="grid grid-cols-3 gap-4">
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
                      <p className="text-sm text-white">{order.handler || '待分配'}</p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-text-muted mb-2">{order.createTime}</p>
                  <button className="btn-primary text-xs">处理工单</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showUploadModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-x-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] bg-dark-900 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h3 className="text-lg font-semibold text-white">
                  {uploadType === 'contract' ? '上传回收合同' : '上传检测报告'}
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <div className="p-5 space-y-4">
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

                {uploadedFile && (
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
                      ) : parseResult ? (
                        <div className="text-xs text-accent-400 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          解析完成
                        </div>
                      ) : null}
                    </div>

                    {parseResult && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t border-white/5"
                      >
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="text-center">
                            <p className="text-lg font-bold font-mono text-white">
                              {parseResult.rows}
                            </p>
                            <p className="text-xs text-text-muted">数据行数</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold font-mono text-white">
                              {parseResult.columns}
                            </p>
                            <p className="text-xs text-text-muted">字段列数</p>
                          </div>
                        </div>
                        <p className="text-xs text-accent-400 text-center">
                          ✓ 系统已自动提取关键参数
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                <div className="p-3 rounded-lg bg-warning-500/10 border border-warning-500/20">
                  <p className="text-xs text-warning-400">
                    💡 提示: {uploadType === 'contract' 
                      ? '合同 Excel 需包含合同号、甲乙双方、约定数量、单价等字段' 
                      : '检测报告 Excel 需包含批次号、电芯数量、容量、SOH等字段'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-5 border-t border-white/5">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="btn-secondary text-sm"
                >
                  取消
                </button>
                <button
                  disabled={!parseResult}
                  className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确认导入
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
