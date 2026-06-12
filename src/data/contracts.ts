import { Contract, BreachOrder } from '@/types';
import dayjs from 'dayjs';

export const contracts: Contract[] = [
  {
    id: 'contract-001',
    contractNo: 'HT-GD-20240601',
    partyA: '比亚迪汽车工业有限公司',
    partyB: '深圳鹏辉回收工厂',
    startDate: '2024-06-01',
    endDate: '2024-12-31',
    agreedQuantity: 3000,
    actualQuantity: 2156,
    unitPrice: 85000,
    status: 'active',
    batteryModels: ['BYD Blade LFP', 'BYD Tang NCM'],
    provinceId: 'guangdong',
    provinceName: '广东省',
    createTime: '2024-05-20 10:30:00',
  },
  {
    id: 'contract-002',
    contractNo: 'HT-JS-20240515',
    partyA: '宁德时代新能源科技股份有限公司',
    partyB: '常州天奈回收工厂',
    startDate: '2024-05-15',
    endDate: '2024-11-15',
    agreedQuantity: 2500,
    actualQuantity: 1820,
    unitPrice: 92000,
    status: 'active',
    batteryModels: ['CATL NCM811', 'CATL LFP'],
    provinceId: 'jiangsu',
    provinceName: '江苏省',
    createTime: '2024-05-10 14:20:00',
  },
  {
    id: 'contract-003',
    contractNo: 'HT-ZJ-20240401',
    partyA: '浙江吉利控股集团有限公司',
    partyB: '杭州南都动力工厂',
    startDate: '2024-04-01',
    endDate: '2024-10-31',
    agreedQuantity: 500,
    actualQuantity: 428,
    unitPrice: 78000,
    status: 'breached',
    batteryModels: ['GEELY NCM622'],
    provinceId: 'zhejiang',
    provinceName: '浙江省',
    createTime: '2024-03-25 09:15:00',
  },
  {
    id: 'contract-004',
    contractNo: 'HT-SD-20240310',
    partyA: '国轩高科股份有限公司',
    partyB: '青岛国轩工厂',
    startDate: '2024-03-10',
    endDate: '2024-09-10',
    agreedQuantity: 800,
    actualQuantity: 825,
    unitPrice: 82000,
    status: 'fulfilled',
    batteryModels: ['GOTION LFP'],
    provinceId: 'shandong',
    provinceName: '山东省',
    createTime: '2024-03-01 16:45:00',
  },
  {
    id: 'contract-005',
    contractNo: 'HT-SC-20240201',
    partyA: '天齐锂业股份有限公司',
    partyB: '成都天齐锂业工厂',
    startDate: '2024-02-01',
    endDate: '2024-08-01',
    agreedQuantity: 1200,
    actualQuantity: 856,
    unitPrice: 95000,
    status: 'active',
    batteryModels: ['TQC NCM', 'TQC LFP'],
    provinceId: 'sichuan',
    provinceName: '四川省',
    createTime: '2024-01-20 11:30:00',
  },
  {
    id: 'contract-006',
    contractNo: 'CT-HB-20240115',
    partyA: '武汉宁德时代新能源科技有限公司',
    partyB: '武汉宁德时代工厂',
    startDate: '2024-01-15',
    endDate: '2024-07-15',
    agreedQuantity: 600,
    actualQuantity: 180,
    unitPrice: 88000,
    status: 'expired',
    batteryModels: ['CATL NCM523'],
    provinceId: 'hubei',
    provinceName: '湖北省',
    createTime: '2024-01-10 08:00:00',
  },
];

export const breachOrders: BreachOrder[] = [
  {
    id: 'breach-001',
    contractId: 'contract-003',
    contractNo: 'HT-ZJ-20240401',
    reason: '回收量低于合同约定，缺口72吨，完成率85.6%',
    shortfall: 72,
    estimatedLoss: 5616000,
    createTime: '2024-06-15 09:30:00',
    status: 'processing',
    handler: '李法务',
    provinceId: 'zhejiang',
  },
  {
    id: 'breach-002',
    contractId: 'contract-005',
    contractNo: 'HT-SC-20240201',
    reason: '回收进度滞后，当前完成率71.3%，时间过半但回收量不足',
    shortfall: 344,
    estimatedLoss: 32680000,
    createTime: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
    status: 'pending',
    provinceId: 'sichuan',
  },
  {
    id: 'breach-003',
    contractId: 'contract-001',
    contractNo: 'HT-GD-20240601',
    reason: '上月回收量低于月度目标，需关注后续履约情况',
    shortfall: 85,
    estimatedLoss: 7225000,
    createTime: dayjs().subtract(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
    status: 'pending',
    provinceId: 'guangdong',
  },
];

export const getContracts = (status?: Contract['status']): Contract[] => {
  let result = [...contracts];
  if (status) result = result.filter((c) => c.status === status);
  return result.sort((a, b) => dayjs(b.createTime).valueOf() - dayjs(a.createTime).valueOf());
};

export const getBreachOrders = (status?: BreachOrder['status']): BreachOrder[] => {
  let result = [...breachOrders];
  if (status) result = result.filter((b) => b.status === status);
  return result.sort((a, b) => dayjs(b.createTime).valueOf() - dayjs(a.createTime).valueOf());
};

export const getContractById = (id: string): Contract | undefined => {
  return contracts.find((c) => c.id === id);
};
