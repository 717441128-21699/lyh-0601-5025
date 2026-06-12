export interface Province {
  id: string;
  name: string;
  totalRecycled: number;
  cascadeUtilRate: number;
  recoveryRate: number;
  avgSOH: number;
  carbonReduction: number;
  factoryCount: number;
  position: {
    x: number;
    y: number;
  };
}

export interface Factory {
  id: string;
  name: string;
  provinceId: string;
  address: string;
  capacity: number;
  monthlyRecycled: number;
  cascadeUtilRate: number;
  avgSOH: number;
  recoveryRate: number;
}

export type BatteryGrade = 'A' | 'B' | 'C' | 'D';

export interface BatteryBatch {
  id: string;
  batchNo: string;
  batteryModel: string;
  factoryId: string;
  factoryName: string;
  provinceId: string;
  recycleDate: string;
  totalCount: number;
  avgSOH: number;
  avgCapacity: number;
  grade: BatteryGrade;
  applicationScene?: string;
}

export interface SOHTrendItem {
  date: string;
  avgSOH: number;
  gradeA: number;
  gradeB: number;
  gradeC: number;
  gradeD: number;
}

export type WarningType = 'soh_low' | 'utilization_low' | 'contract_breach';
export type WarningLevel = 1 | 2 | 3;
export type WarningStatus = 'pending' | 'approving' | 'resolved' | 'rejected';

export interface Warning {
  id: string;
  type: WarningType;
  level: WarningLevel;
  status: WarningStatus;
  title: string;
  description: string;
  batchId?: string;
  factoryId: string;
  factoryName: string;
  provinceId: string;
  provinceName: string;
  createTime: string;
  currentApprovalLevel: number;
  approvalRecords: ApprovalRecord[];
  metricValue?: number;
  threshold?: number;
  consecutiveDays?: number;
}

export type ApprovalResult = 'pass' | 'reject' | 'adjust';

export interface ApprovalRecord {
  id: string;
  warningId: string;
  level: number;
  approver: string;
  role: string;
  approveTime?: string;
  opinion?: string;
  result?: ApprovalResult;
}

export type ContractStatus = 'active' | 'fulfilled' | 'breached' | 'expired';

export interface Contract {
  id: string;
  contractNo: string;
  partyA: string;
  partyB: string;
  startDate: string;
  endDate: string;
  agreedQuantity: number;
  actualQuantity: number;
  unitPrice: number;
  status: ContractStatus;
  batteryModels: string[];
  provinceId: string;
  provinceName: string;
  createTime: string;
}

export type BreachOrderStatus = 'pending' | 'processing' | 'resolved';

export interface BreachOrder {
  id: string;
  contractId: string;
  contractNo: string;
  reason: string;
  shortfall: number;
  estimatedLoss: number;
  createTime: string;
  status: BreachOrderStatus;
  handler?: string;
  provinceId: string;
}

export interface HealthReport {
  id: string;
  title: string;
  period: string;
  startDate: string;
  endDate: string;
  scopeType: 'national' | 'province' | 'factory';
  scopeId: string;
  scopeName: string;
  summary: {
    totalRecycled: number;
    totalRecycledYoY: number;
    totalRecycledMoM: number;
    cascadeQualifyRate: number;
    cascadeQualifyRateYoY: number;
    carbonReduction: number;
    carbonReductionYoY: number;
    recoveryRate: number;
    recoveryRateYoY: number;
    avgSOH: number;
    avgSOHYoY: number;
  };
  suggestions: string[];
  createTime: string;
}

export type UserRole = 
  | 'group_admin'
  | 'region_manager'
  | 'factory_manager'
  | 'quality_control'
  | 'technical_director'
  | 'legal';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  roleName: string;
  avatar?: string;
  email: string;
  phone: string;
  provinceIds?: string[];
  factoryIds?: string[];
}

export interface DashboardStats {
  totalRecycled: number;
  totalRecycledTrend: number;
  avgSOH: number;
  avgSOHTrend: number;
  cascadeUtilRate: number;
  cascadeUtilRateTrend: number;
  recoveryRate: number;
  recoveryRateTrend: number;
  carbonReduction: number;
  carbonReductionTrend: number;
  activeWarnings: number;
  pendingApprovals: number;
}
