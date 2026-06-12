import { Warning, ApprovalRecord } from '@/types';
import dayjs from 'dayjs';

const createApprovalRecords = (warningId: string, currentLevel: number): ApprovalRecord[] => {
  const records: ApprovalRecord[] = [
    {
      id: `${warningId}-approval-1`,
      warningId,
      level: 1,
      approver: '张明',
      role: '品控主管',
      ...(currentLevel > 0 ? { approveTime: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm'), opinion: '经核实，该批次电芯容量衰减严重，确认预警属实，建议降级处理。', result: 'pass' as const } : {}),
    },
    {
      id: `${warningId}-approval-2`,
      warningId,
      level: 2,
      approver: '李伟',
      role: '技术总监',
      ...(currentLevel > 1 ? { approveTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm'), opinion: '同意降级，建议将该批电池转用于低速电动车储能场景。', result: 'adjust' as const } : {}),
    },
    {
      id: `${warningId}-approval-3`,
      warningId,
      level: 3,
      approver: '王强',
      role: '集团总裁',
      ...(currentLevel > 2 ? { approveTime: dayjs().format('YYYY-MM-DD HH:mm'), opinion: '批准，尽快落实降级方案并持续追踪效果。', result: 'pass' as const } : {}),
    },
  ];
  return records;
};

export const warnings: Warning[] = [
  {
    id: 'warn-001',
    type: 'soh_low',
    level: 1,
    status: 'approving',
    title: '深圳鹏辉工厂B202406批次SOH连续低于70%',
    description: '该批次共5000颗电芯，连续3天平均SOH为68.5%，低于预警阈值70%，建议降级处理或报废。',
    batchId: 'batch-gd-001',
    factoryId: 'factory-gd-01',
    factoryName: '深圳鹏辉回收工厂',
    provinceId: 'guangdong',
    provinceName: '广东省',
    createTime: dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss'),
    currentApprovalLevel: 1,
    approvalRecords: createApprovalRecords('warn-001', 1),
    metricValue: 68.5,
    threshold: 70,
    consecutiveDays: 3,
  },
  {
    id: 'warn-002',
    type: 'utilization_low',
    level: 1,
    status: 'pending',
    title: '常州天奈工厂梯次利用设备利用率连续7天低于50%',
    description: '储能应用场景梯次利用组装线连续7天平均利用率为42.3%，远低于正常水平，请核查原因。',
    factoryId: 'factory-js-01',
    factoryName: '常州天奈回收工厂',
    provinceId: 'jiangsu',
    provinceName: '江苏省',
    createTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    currentApprovalLevel: 0,
    approvalRecords: createApprovalRecords('warn-002', 0),
    metricValue: 42.3,
    threshold: 50,
    consecutiveDays: 7,
  },
  {
    id: 'warn-003',
    type: 'soh_low',
    level: 2,
    status: 'approving',
    title: '成都天齐锂业B202405批次SOH持续偏低',
    description: '该批次共3200颗电芯，平均SOH为65.2%，已持续5天低于70%，存在安全隐患。',
    batchId: 'batch-sc-002',
    factoryId: 'factory-sc-01',
    factoryName: '成都天齐锂业工厂',
    provinceId: 'sichuan',
    provinceName: '四川省',
    createTime: dayjs().subtract(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
    currentApprovalLevel: 2,
    approvalRecords: createApprovalRecords('warn-003', 2),
    metricValue: 65.2,
    threshold: 70,
    consecutiveDays: 5,
  },
  {
    id: 'warn-004',
    type: 'contract_breach',
    level: 2,
    status: 'resolved',
    title: '杭州南都动力合同回收量未达标',
    description: 'HT202403号合同约定回收量500吨，实际回收量428吨，缺口72吨，已生成违约工单。',
    factoryId: 'factory-zj-01',
    factoryName: '杭州南都动力工厂',
    provinceId: 'zhejiang',
    provinceName: '浙江省',
    createTime: dayjs().subtract(10, 'day').format('YYYY-MM-DD HH:mm:ss'),
    currentApprovalLevel: 3,
    approvalRecords: createApprovalRecords('warn-004', 3),
    metricValue: 428,
    threshold: 500,
  },
  {
    id: 'warn-005',
    type: 'soh_low',
    level: 3,
    status: 'resolved',
    title: '武汉宁德时代B202404批次报废处理',
    description: '该批次共1800颗电芯，平均SOH为58.6%，经三级审批后已启动报废处理流程。',
    batchId: 'batch-hb-003',
    factoryId: 'factory-hb-01',
    factoryName: '武汉宁德时代工厂',
    provinceId: 'hubei',
    provinceName: '湖北省',
    createTime: dayjs().subtract(20, 'day').format('YYYY-MM-DD HH:mm:ss'),
    currentApprovalLevel: 3,
    approvalRecords: createApprovalRecords('warn-005', 3),
    metricValue: 58.6,
    threshold: 70,
    consecutiveDays: 10,
  },
  {
    id: 'warn-006',
    type: 'utilization_low',
    level: 1,
    status: 'pending',
    title: '郑州比克回收工厂设备利用率偏低',
    description: '低速电动车梯次利用线连续8天平均利用率为45.8%，低于50%阈值。',
    factoryId: 'factory-hen-01',
    factoryName: '郑州比克回收工厂',
    provinceId: 'henan',
    provinceName: '河南省',
    createTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    currentApprovalLevel: 0,
    approvalRecords: createApprovalRecords('warn-006', 0),
    metricValue: 45.8,
    threshold: 50,
    consecutiveDays: 8,
  },
];

export const getWarnings = (status?: Warning['status'], type?: Warning['type']): Warning[] => {
  let result = [...warnings];
  if (status) result = result.filter((w) => w.status === status);
  if (type) result = result.filter((w) => w.type === type);
  return result.sort((a, b) => dayjs(b.createTime).valueOf() - dayjs(a.createTime).valueOf());
};

export const getWarningById = (id: string): Warning | undefined => {
  return warnings.find((w) => w.id === id);
};

export const getActiveWarningCount = (): number => {
  return warnings.filter((w) => w.status === 'pending' || w.status === 'approving').length;
};

export const getPendingApprovalCount = (): number => {
  return warnings.filter((w) => w.status === 'approving' || w.status === 'pending').length;
};
