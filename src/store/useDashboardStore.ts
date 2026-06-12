import { create } from 'zustand';
import { Province, DashboardStats } from '@/types';
import { provinces } from '@/data/provinces';
import { useAuthStore } from './useAuthStore';

interface DashboardState {
  selectedProvinceId: string | null;
  stats: DashboardStats;
  visibleProvinces: Province[];
  rankedByRecycled: Province[];
  rankedByCascadeRate: Province[];
  setSelectedProvince: (provinceId: string | null) => void;
  refreshStats: () => void;
  recalcForRole: () => void;
}

const calculateStats = (provinceList: Province[], warningCount: number, pendingCount: number): DashboardStats => {
  if (provinceList.length === 0) {
    return {
      totalRecycled: 0,
      totalRecycledTrend: 0,
      avgSOH: 0,
      avgSOHTrend: 0,
      cascadeUtilRate: 0,
      cascadeUtilRateTrend: 0,
      recoveryRate: 0,
      recoveryRateTrend: 0,
      carbonReduction: 0,
      carbonReductionTrend: 0,
      activeWarnings: 0,
      pendingApprovals: 0,
    };
  }

  const totalRecycled = provinceList.reduce((sum, p) => sum + p.totalRecycled, 0);
  const avgSOH = provinceList.reduce((sum, p) => sum + p.avgSOH, 0) / provinceList.length;
  const avgCascadeRate = provinceList.reduce((sum, p) => sum + p.cascadeUtilRate, 0) / provinceList.length;
  const avgRecoveryRate = provinceList.reduce((sum, p) => sum + p.recoveryRate, 0) / provinceList.length;
  const totalCarbon = provinceList.reduce((sum, p) => sum + p.carbonReduction, 0);

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
    activeWarnings: warningCount,
    pendingApprovals: pendingCount,
  };
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  selectedProvinceId: null,
  stats: calculateStats(provinces, 5, 3),
  visibleProvinces: provinces,
  rankedByRecycled: [...provinces].sort((a, b) => b.totalRecycled - a.totalRecycled),
  rankedByCascadeRate: [...provinces].sort((a, b) => b.cascadeUtilRate - a.cascadeUtilRate),
  setSelectedProvince: (provinceId) => set({ selectedProvinceId: provinceId }),
  refreshStats: () => {
    const { visibleProvinces } = get();
    set({ stats: calculateStats(visibleProvinces, 5, 3) });
  },
  recalcForRole: () => {
    const user = useAuthStore.getState().user;
    let visibleProvincesList = provinces;

    if (user?.provinceIds && user.provinceIds.length > 0) {
      visibleProvincesList = provinces.filter((p) => user.provinceIds!.includes(p.id));
    }

    const rankedRecycled = [...visibleProvincesList].sort((a, b) => b.totalRecycled - a.totalRecycled);
    const rankedCascade = [...visibleProvincesList].sort((a, b) => b.cascadeUtilRate - a.cascadeUtilRate);

    const warnings = getActiveWarningsCountForProvinces(visibleProvincesList.map(p => p.id));
    
    set({
      visibleProvinces: visibleProvincesList,
      rankedByRecycled: rankedRecycled,
      rankedByCascadeRate: rankedCascade,
      stats: calculateStats(visibleProvincesList, warnings.total, warnings.pending),
    });
  },
}));

function getActiveWarningsCountForProvinces(provinceIds: string[]): { total: number; pending: number } {
  try {
    const { warnings } = require('@/data/warnings');
    const filtered = provinceIds.length === 31 ? warnings : warnings.filter((w: any) => provinceIds.includes(w.provinceId));
    const active = filtered.filter((w: any) => w.status !== 'resolved' && w.status !== 'rejected');
    const pending = filtered.filter((w: any) => w.status === 'approving' || w.status === 'pending');
    return { total: active.length, pending: pending.length };
  } catch {
    return { total: 3, pending: 2 };
  }
}
