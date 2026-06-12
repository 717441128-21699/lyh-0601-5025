import { SOHTrendItem, BatteryBatch, BatteryGrade } from '@/types';
import dayjs from 'dayjs';

const generateSOHTrend = (baseSOH: number, days: number = 30): SOHTrendItem[] => {
  const result: SOHTrendItem[] = [];
  let currentSOH = baseSOH;
  
  for (let i = days - 1; i >= 0; i--) {
    const change = (Math.random() - 0.5) * 3;
    currentSOH = Math.max(60, Math.min(95, currentSOH + change));
    
    const gradeA = Math.floor(Math.random() * 1500) + 2000;
    const gradeB = Math.floor(Math.random() * 1200) + 1500;
    const gradeC = Math.floor(Math.random() * 800) + 800;
    const gradeD = Math.floor(Math.random() * 400) + 300;
    
    result.push({
      date: dayjs().subtract(i, 'day').format('YYYY-MM-DD'),
      avgSOH: Math.round(currentSOH * 10) / 10,
      gradeA,
      gradeB,
      gradeC,
      gradeD,
    });
  }
  
  return result;
};

export const nationalSOHTrend: SOHTrendItem[] = generateSOHTrend(78.5, 30);

export const provinceSOHTrends: Record<string, SOHTrendItem[]> = {
  guangdong: generateSOHTrend(82.3, 30),
  jiangsu: generateSOHTrend(80.5, 30),
  zhejiang: generateSOHTrend(79.6, 30),
  shandong: generateSOHTrend(77.8, 30),
  henan: generateSOHTrend(76.2, 30),
  sichuan: generateSOHTrend(78.9, 30),
  hubei: generateSOHTrend(77.3, 30),
  hunan: generateSOHTrend(75.6, 30),
};

export const getProvinceSOHTrend = (provinceId: string): SOHTrendItem[] => {
  return provinceSOHTrends[provinceId] || generateSOHTrend(75, 30);
};

const batteryModels = ['NCM811', 'NCM622', 'NCM523', 'LFP', 'BYD Blade', 'CATL LFP'];

export const batteryBatches: BatteryBatch[] = [
  {
    id: 'batch-gd-001',
    batchNo: 'B20240601-GD',
    batteryModel: 'BYD Blade LFP',
    factoryId: 'factory-gd-01',
    factoryName: '深圳鹏辉回收工厂',
    provinceId: 'guangdong',
    recycleDate: '2024-06-01',
    totalCount: 5000,
    avgSOH: 68.5,
    avgCapacity: 128.5,
    grade: 'C',
    applicationScene: '低速电动车',
  },
  {
    id: 'batch-gd-002',
    batchNo: 'B20240605-GD',
    batteryModel: 'CATL NCM811',
    factoryId: 'factory-gd-01',
    factoryName: '深圳鹏辉回收工厂',
    provinceId: 'guangdong',
    recycleDate: '2024-06-05',
    totalCount: 3200,
    avgSOH: 85.2,
    avgCapacity: 82.5,
    grade: 'A',
    applicationScene: '储能电站',
  },
  {
    id: 'batch-gd-003',
    batchNo: 'B20240610-GD',
    batteryModel: 'BYD Tang NCM',
    factoryId: 'factory-gd-02',
    factoryName: '广州格林美工厂',
    provinceId: 'guangdong',
    recycleDate: '2024-06-10',
    totalCount: 2800,
    avgSOH: 76.8,
    avgCapacity: 75.2,
    grade: 'B',
    applicationScene: '通信基站',
  },
  {
    id: 'batch-js-001',
    batchNo: 'B20240603-JS',
    batteryModel: 'CATL NCM811',
    factoryId: 'factory-js-01',
    factoryName: '常州天奈回收工厂',
    provinceId: 'jiangsu',
    recycleDate: '2024-06-03',
    totalCount: 4500,
    avgSOH: 79.5,
    avgCapacity: 78.2,
    grade: 'B',
    applicationScene: '储能电站',
  },
  {
    id: 'batch-sc-001',
    batchNo: 'B20240520-SC',
    batteryModel: 'TQC NCM',
    factoryId: 'factory-sc-01',
    factoryName: '成都天齐锂业工厂',
    provinceId: 'sichuan',
    recycleDate: '2024-05-20',
    totalCount: 3200,
    avgSOH: 65.2,
    avgCapacity: 62.8,
    grade: 'C',
    applicationScene: '低速电动车',
  },
  {
    id: 'batch-zj-001',
    batchNo: 'B20240608-ZJ',
    batteryModel: 'GEELY NCM622',
    factoryId: 'factory-zj-01',
    factoryName: '杭州南都动力工厂',
    provinceId: 'zhejiang',
    recycleDate: '2024-06-08',
    totalCount: 1800,
    avgSOH: 82.5,
    avgCapacity: 68.5,
    grade: 'A',
    applicationScene: '储能电站',
  },
];

export const getBatchesByProvince = (provinceId: string): BatteryBatch[] => {
  return batteryBatches.filter((b) => b.provinceId === provinceId);
};

export const getBatchesByFactory = (factoryId: string): BatteryBatch[] => {
  return batteryBatches.filter((b) => b.factoryId === factoryId);
};

export const getBatteryModels = (): string[] => {
  return batteryModels;
};

export const getGradeColor = (grade: BatteryGrade): string => {
  const colors: Record<BatteryGrade, string> = {
    A: '#3E885B',
    B: '#1E5FE8',
    C: '#F45D01',
    D: '#D62828',
  };
  return colors[grade];
};

export const getGradeLabel = (grade: BatteryGrade): string => {
  const labels: Record<BatteryGrade, string> = {
    A: 'A级 - 优质',
    B: 'B级 - 良好',
    C: 'C级 - 合格',
    D: 'D级 - 待处理',
  };
  return labels[grade];
};
