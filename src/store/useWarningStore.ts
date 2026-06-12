import { create } from 'zustand';
import { Warning, WarningStatus, WarningType, ApprovalRecord } from '@/types';
import { warnings, getWarnings } from '@/data/warnings';
import dayjs from 'dayjs';

interface WarningState {
  warnings: Warning[];
  filteredWarnings: Warning[];
  statusFilter: WarningStatus | 'all';
  typeFilter: WarningType | 'all';
  searchKeyword: string;
  setStatusFilter: (status: WarningStatus | 'all') => void;
  setTypeFilter: (type: WarningType | 'all') => void;
  setSearchKeyword: (keyword: string) => void;
  approveWarning: (warningId: string, level: number, opinion: string, result: 'pass' | 'reject' | 'adjust') => void;
  getWarningById: (id: string) => Warning | undefined;
  filterWarnings: () => void;
}

export const useWarningStore = create<WarningState>((set, get) => ({
  warnings,
  filteredWarnings: warnings,
  statusFilter: 'all',
  typeFilter: 'all',
  searchKeyword: '',
  setStatusFilter: (status) => {
    set({ statusFilter: status });
    get().filterWarnings();
  },
  setTypeFilter: (type) => {
    set({ typeFilter: type });
    get().filterWarnings();
  },
  setSearchKeyword: (keyword) => {
    set({ searchKeyword: keyword });
    get().filterWarnings();
  },
  filterWarnings: () => {
    const { warnings, statusFilter, typeFilter, searchKeyword } = get();
    let filtered = [...warnings];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter((w) => w.status === statusFilter);
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter((w) => w.type === typeFilter);
    }
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.title.toLowerCase().includes(keyword) ||
          w.factoryName.toLowerCase().includes(keyword) ||
          w.provinceName.toLowerCase().includes(keyword)
      );
    }
    
    set({ filteredWarnings: filtered });
  },
  approveWarning: (warningId, level, opinion, result) => {
    set((state) => {
      const updatedWarnings = state.warnings.map((w) => {
        if (w.id === warningId) {
          const newApprovalLevel = result === 'reject' ? w.currentApprovalLevel : w.currentApprovalLevel + 1;
          const newStatus = result === 'reject' 
            ? 'rejected' 
            : newApprovalLevel >= 3 
              ? 'resolved' 
              : 'approving';
          
          const updatedRecords = w.approvalRecords.map((r) => {
            if (r.level === level) {
              return {
                ...r,
                approveTime: dayjs().format('YYYY-MM-DD HH:mm'),
                opinion,
                result,
              };
            }
            return r;
          });
          
          return {
            ...w,
            status: newStatus as Warning['status'],
            currentApprovalLevel: newApprovalLevel,
            approvalRecords: updatedRecords,
          };
        }
        return w;
      });
      
      return { warnings: updatedWarnings };
    });
    get().filterWarnings();
  },
  getWarningById: (id) => get().warnings.find((w) => w.id === id),
}));
