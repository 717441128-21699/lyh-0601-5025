import { HealthReport } from '@/types';
import dayjs from 'dayjs';

export const healthReports: HealthReport[] = [
  {
    id: 'report-001',
    title: '全国动力电池回收健康诊断周报',
    period: '2024年第24周',
    startDate: dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    scopeType: 'national',
    scopeId: 'national',
    scopeName: '全国',
    summary: {
      totalRecycled: 12580,
      totalRecycledYoY: 15.2,
      totalRecycledMoM: 8.5,
      cascadeQualifyRate: 72.5,
      cascadeQualifyRateYoY: 5.8,
      carbonReduction: 45620,
      carbonReductionYoY: 18.3,
      recoveryRate: 93.2,
      recoveryRateYoY: 2.1,
      avgSOH: 78.5,
      avgSOHYoY: -2.3,
    },
    suggestions: [
      '建议加大华南地区回收网络建设，提升广东省回收量占比',
      '华东地区梯次利用率较高，建议推广其运营模式至其他区域',
      '西南地区电池平均SOH偏低，建议加强入厂检测标准',
      '建议与头部车企深化合作，稳定回收来源渠道',
      '梯次利用储能场景需求旺盛，建议扩大相关产能投入',
    ],
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    id: 'report-002',
    title: '广东省动力电池回收健康诊断周报',
    period: '2024年第24周',
    startDate: dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    scopeType: 'province',
    scopeId: 'guangdong',
    scopeName: '广东省',
    summary: {
      totalRecycled: 12580,
      totalRecycledYoY: 22.5,
      totalRecycledMoM: 12.3,
      cascadeQualifyRate: 78.5,
      cascadeQualifyRateYoY: 8.2,
      carbonReduction: 45620,
      carbonReductionYoY: 25.6,
      recoveryRate: 95.2,
      recoveryRateYoY: 3.1,
      avgSOH: 82.3,
      avgSOHYoY: 1.5,
    },
    suggestions: [
      '深圳鹏辉工厂表现优异，建议总结经验并推广至其他工厂',
      '珠三角地区回收需求旺盛，可考虑增设回收网点',
      '建议加强与比亚迪、宁德时代等本地车企的深度合作',
      '梯次利用储能场景增长迅速，建议提前布局产能',
    ],
    createTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    id: 'report-003',
    title: '全国动力电池回收健康诊断周报',
    period: '2024年第23周',
    startDate: dayjs().subtract(13, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    scopeType: 'national',
    scopeId: 'national',
    scopeName: '全国',
    summary: {
      totalRecycled: 11580,
      totalRecycledYoY: 12.8,
      totalRecycledMoM: 6.2,
      cascadeQualifyRate: 70.2,
      cascadeQualifyRateYoY: 4.5,
      carbonReduction: 42180,
      carbonReductionYoY: 15.8,
      recoveryRate: 92.5,
      recoveryRateYoY: 1.8,
      avgSOH: 79.2,
      avgSOHYoY: -1.8,
    },
    suggestions: [
      '上周回收量环比增长6.2%，整体趋势向好',
      '华北地区梯次利用率偏低，建议优化分选工艺',
      '建议加强电池溯源系统建设，提升回收透明度',
    ],
    createTime: dayjs().subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    id: 'report-004',
    title: '全国动力电池回收健康诊断月报',
    period: '2024年5月',
    startDate: '2024-05-01',
    endDate: '2024-05-31',
    scopeType: 'national',
    scopeId: 'national',
    scopeName: '全国',
    summary: {
      totalRecycled: 48520,
      totalRecycledYoY: 18.6,
      totalRecycledMoM: 10.2,
      cascadeQualifyRate: 71.2,
      cascadeQualifyRateYoY: 6.5,
      carbonReduction: 175680,
      carbonReductionYoY: 22.3,
      recoveryRate: 92.8,
      recoveryRateYoY: 2.5,
      avgSOH: 78.8,
      avgSOHYoY: -2.1,
    },
    suggestions: [
      '5月份回收量同比增长18.6%，市场扩张态势明显',
      '梯次利用合格率稳步提升，工艺优化效果显著',
      '碳减排贡献突出，建议申请相关政策补贴',
      '建议关注电池老化趋势，适时调整分级标准',
    ],
    createTime: '2024-06-01 09:00:00',
  },
];

export const getReports = (scopeType?: HealthReport['scopeType']): HealthReport[] => {
  let result = [...healthReports];
  if (scopeType) result = result.filter((r) => r.scopeType === scopeType);
  return result.sort((a, b) => dayjs(b.createTime).valueOf() - dayjs(a.createTime).valueOf());
};

export const getReportById = (id: string): HealthReport | undefined => {
  return healthReports.find((r) => r.id === id);
};
