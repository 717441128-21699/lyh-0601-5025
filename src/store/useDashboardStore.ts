import { create } from 'zustand';
import { Province, DashboardStats, Factory } from '@/types';
import { provinces, getProvincesRankedByRecycled, getProvincesRankedByCascadeRate } from '@/data/provinces';
import { getActiveWarningCount, getPendingApprovalCount } from '@/data/warnings';

interface DashboardState {
  selectedProvinceId: string | null;
  stats: DashboardStats;
  provinces: Province[];
  rankedByRecycled: Province[];
  rankedByCascadeRate: Province[];
  setSelectedProvince: (provinceId: string | null) => void;
  refreshStats: () => void;
}

const calculateNationalStats = (): DashboardStats => {
  const totalRecycled = provinces.reduce((sum, p) => sum + p.totalRecycled, 0);
  const avgSOH = provinces.reduce((sum, p) => sum + p.avgSOH, 0) / provinces.length;
  const avgCascadeRate = provinces.reduce((sum, p) => sum + p.cascadeUtilRate, 0) / provinces.length;
  const avgRecoveryRate = provinces.reduce((sum, p) => sum + p.recoveryRate, 0) / provinces.length;
  const totalCarbon = provinces.reduce((sum, p) => sum + p.carbonReduction, 0);

  return {
    totalRecycled,
    totalRecycledTrend: 8.5,
    avgSOH,
    avgSOHTrend: -1.2,
    cascadeUtilRate: avgCascadeRate,
    cascadeUtilRateTrend: 3.8,
    recoveryRate: avgRecoveryRate,
    recoveryRateTrend: 0.8,
    carbonReduction: totalCarbon,
    carbonReductionTrend: 12.3,
    activeWarnings: getActiveWarningCount(),
    pendingApprovals: getPendingApprovalCount(),
  };
};

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedProvinceId: null,
  stats: calculateNationalStats(),
  provinces,
  rankedByRecycled: getProvincesRankedByRecycled(),
  rankedByCascadeRate: getProvincesRankedByCascadeRate(),
  setSelectedProvince: (provinceId) => set({ selectedProvinceId: provinceId }),
  refreshStats: () => set({ stats: calculateNationalStats() }),
}));
