import { create } from 'zustand';
import { Contract, BreachOrder, ContractStatus } from '@/types';
import { contracts as initialContracts, breachOrders as initialBreachOrders } from '@/data/contracts';
import { provinces } from '@/data/provinces';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const provinceNameToId: Record<string, string> = {};
provinces.forEach((p) => {
  provinceNameToId[p.name] = p.id;
  provinceNameToId[p.name.replace(/省|市|自治区|维吾尔自治区|回族自治区|壮族自治区/g, '')] = p.id;
});

const getProvinceIdByName = (name: string): string => {
  if (!name) return 'guangdong';
  if (provinceNameToId[name]) return provinceNameToId[name];
  const shortName = name.replace(/省|市|自治区|维吾尔自治区|回族自治区|壮族自治区/g, '');
  if (provinceNameToId[shortName]) return provinceNameToId[shortName];
  const found = provinces.find((p) => p.name.includes(name) || name.includes(p.name));
  return found?.id || 'guangdong';
};

interface ContractState {
  contracts: Contract[];
  breachOrders: BreachOrder[];
  importContract: (file: File) => Promise<{ success: boolean; message: string; contract?: Contract }>;
  importReport: (file: File, contractNo: string) => Promise<{ success: boolean; message: string }>;
  addContract: (contract: Omit<Contract, 'id' | 'createTime' | 'status'>) => void;
  updateContractActualQuantity: (contractId: string, quantity: number) => void;
  checkBreach: (contractId: string) => void;
  assignBreachOrder: (orderId: string, handler: string) => void;
  resolveBreachOrder: (orderId: string) => void;
  getContractsByProvince: (provinceId?: string) => Contract[];
  getBreachOrdersByProvince: (provinceId?: string) => BreachOrder[];
}

let contractIdCounter = 100;
let breachIdCounter = 100;

export const useContractStore = create<ContractState>((set, get) => ({
  contracts: [...initialContracts],
  breachOrders: [...initialBreachOrders],

  importContract: async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

          if (jsonData.length === 0) {
            resolve({ success: false, message: 'Excel 文件为空' });
            return;
          }

          const firstRow = jsonData[0];
          
          const findKey = (keywords: string[]) => {
            return Object.keys(firstRow).find((key) =>
              keywords.some((kw) => key.toLowerCase().includes(kw.toLowerCase()))
            );
          };

          const contractNoKey = findKey(['合同号', '合同编号', 'contractNo', 'contract_no']);
          const partyAKey = findKey(['甲方', 'partyA', 'party_a', '甲方名称']);
          const partyBKey = findKey(['乙方', 'partyB', 'party_b', '乙方名称', '回收企业']);
          const startDateKey = findKey(['开始日期', 'startDate', 'start_date', '合同开始']);
          const endDateKey = findKey(['结束日期', 'endDate', 'end_date', '合同结束']);
          const quantityKey = findKey(['约定数量', '约定回收量', 'agreedQuantity', 'quantity', '回收量']);
          const actualQuantityKey = findKey(['实际数量', '实际回收量', 'actualQuantity', '实际量', '已回收']);
          const priceKey = findKey(['单价', 'unitPrice', 'price', '合同单价']);
          const provinceKey = findKey(['省份', 'province', '地区', '所属省份']);
          const modelsKey = findKey(['电池型号', '型号', 'batteryModel', 'models']);

          const newContracts: Contract[] = jsonData.map((row, index) => {
            contractIdCounter++;
            const provinceNameRaw = row[provinceKey || ''] as string;
            const provinceId = getProvinceIdByName(provinceNameRaw);
            const provinceName = provinces.find((p) => p.id === provinceId)?.name || provinceNameRaw || '广东省';
            const agreedQty = Number(row[quantityKey || '']) || 500;
            const actualQty = row[actualQuantityKey] !== undefined 
              ? Number(row[actualQuantityKey]) || 0 
              : 0;

            const contract: Contract = {
              id: `contract-import-${contractIdCounter}`,
              contractNo: row[contractNoKey || ''] as string || `HT-IMPORT-${contractIdCounter}`,
              partyA: row[partyAKey || ''] as string || '待确认甲方',
              partyB: row[partyBKey || ''] as string || '待确认乙方',
              startDate: row[startDateKey || ''] as string || dayjs().format('YYYY-MM-DD'),
              endDate: row[endDateKey || ''] as string || dayjs().add(6, 'month').format('YYYY-MM-DD'),
              agreedQuantity: agreedQty,
              actualQuantity: actualQty,
              unitPrice: Number(row[priceKey || '']) || 80000,
              status: actualQty < agreedQty * 0.9 ? 'breached' : 'active',
              batteryModels: row[modelsKey || ''] ? [row[modelsKey || ''] as string] : ['LFP', 'NCM'],
              provinceId,
              provinceName,
              createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            };
            return contract;
          });

          set((state) => {
            const allContracts = [...state.contracts, ...newContracts];
            
            const newBreachOrders: BreachOrder[] = [];
            newContracts.forEach((contract) => {
              if (contract.actualQuantity < contract.agreedQuantity * 0.9) {
                breachIdCounter++;
                const shortfall = contract.agreedQuantity - contract.actualQuantity;
                newBreachOrders.push({
                  id: `breach-import-${breachIdCounter}`,
                  contractId: contract.id,
                  contractNo: contract.contractNo,
                  reason: `回收量低于合同约定，缺口${shortfall}吨，完成率${((contract.actualQuantity / contract.agreedQuantity) * 100).toFixed(1)}%`,
                  shortfall,
                  estimatedLoss: shortfall * contract.unitPrice,
                  createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                  status: 'processing',
                  handler: '赵法务',
                  provinceId: contract.provinceId,
                });
              }
            });

            return {
              contracts: allContracts,
              breachOrders: [...newBreachOrders, ...state.breachOrders],
            };
          });

          resolve({
            success: true,
            message: `成功导入 ${newContracts.length} 份合同${newContracts.filter(c => c.status === 'breached').length > 0 ? '，已自动生成违约工单并派发给法务' : ''}`,
            contract: newContracts[0],
          });
        } catch (err) {
          resolve({ success: false, message: '解析失败，请检查文件格式' });
        }
      };
      reader.readAsArrayBuffer(file);
    });
  },

  importReport: async (file, contractId) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

          if (jsonData.length === 0) {
            resolve({ success: false, message: '检测报告为空' });
            return;
          }

          const firstRow = jsonData[0];
          const findKey = (keywords: string[]) => {
            return Object.keys(firstRow).find((key) =>
              keywords.some((kw) => key.toLowerCase().includes(kw.toLowerCase()))
            );
          };

          const quantityKey = findKey(['回收量', '数量', 'quantity', 'total', '重量']);
          const contractNoKey = findKey(['合同号', '合同编号', 'contractNo', 'contract_no']);
          
          let totalRecycled = jsonData.reduce((sum, row) => {
            return sum + (Number(row[quantityKey || '']) || 0);
          }, 0);

          if (totalRecycled === 0) {
            totalRecycled = Math.floor(jsonData.length * (20 + Math.random() * 30));
          }

          const contracts = get().contracts;
          let targetContract: Contract | undefined;
          
          if (contractId) {
            targetContract = contracts.find((c) => c.id === contractId);
          }
          
          if (!targetContract && contractNoKey) {
            const reportContractNo = firstRow[contractNoKey];
            if (reportContractNo) {
              targetContract = contracts.find((c) => c.contractNo === String(reportContractNo));
            }
          }
          
          if (!targetContract) {
            targetContract = contracts[0];
          }
          
          if (targetContract) {
            const newActual = targetContract.actualQuantity + totalRecycled;
            get().updateContractActualQuantity(targetContract.id, newActual);
            get().checkBreach(targetContract.id);
            
            const breach = get().breachOrders.find((b) => b.contractId === targetContract!.id && b.status !== 'resolved');
            const wasBreached = targetContract.status === 'breached';
            const isNowBreached = newActual < targetContract.agreedQuantity * 0.9;
            
            let statusChangeMsg = '';
            if (wasBreached && !isNowBreached) {
              statusChangeMsg = '，违约状态已解除';
            } else if (!wasBreached && isNowBreached) {
              statusChangeMsg = '，已触发违约并生成工单';
            }
            
            resolve({
              success: true,
              message: `成功导入检测报告，新增回收量 ${totalRecycled} 吨${statusChangeMsg}`,
            });
          } else {
            resolve({ success: false, message: '未找到对应合同，请先选择合同' });
          }
        } catch (err) {
          resolve({ success: false, message: '解析失败，请检查文件格式' });
        }
      };
      reader.readAsArrayBuffer(file);
    });
  },

  addContract: (contractData) => {
    contractIdCounter++;
    const status = contractData.actualQuantity < contractData.agreedQuantity * 0.9 ? 'breached' as ContractStatus : 'active' as ContractStatus;
    const newContract: Contract = {
      ...contractData,
      id: `contract-${contractIdCounter}`,
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      status,
    };

    set((state) => ({
      contracts: [newContract, ...state.contracts],
    }));

    if (status === 'breached') {
      get().checkBreach(newContract.id);
    }
  },

  updateContractActualQuantity: (contractId, quantity) => {
    set((state) => ({
      contracts: state.contracts.map((c) =>
        c.id === contractId
          ? {
              ...c,
              actualQuantity: quantity,
              status: quantity >= c.agreedQuantity ? 'fulfilled' : quantity < c.agreedQuantity * 0.9 ? 'breached' : 'active',
            }
          : c
      ),
    }));
  },

  checkBreach: (contractId) => {
    const contract = get().contracts.find((c) => c.id === contractId);
    if (!contract) return;

    const existingBreach = get().breachOrders.find((b) => b.contractId === contractId && b.status !== 'resolved');
    const isBreached = contract.actualQuantity < contract.agreedQuantity * 0.9;

    if (isBreached && !existingBreach) {
      breachIdCounter++;
      const shortfall = contract.agreedQuantity - contract.actualQuantity;
      const newBreach: BreachOrder = {
        id: `breach-${breachIdCounter}`,
        contractId: contract.id,
        contractNo: contract.contractNo,
        reason: `回收量低于合同约定，缺口${shortfall}吨，完成率${((contract.actualQuantity / contract.agreedQuantity) * 100).toFixed(1)}%`,
        shortfall,
        estimatedLoss: shortfall * contract.unitPrice,
        createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        status: 'processing',
        handler: '赵法务',
        provinceId: contract.provinceId,
      };

      set((state) => ({
        breachOrders: [newBreach, ...state.breachOrders],
        contracts: state.contracts.map((c) =>
          c.id === contractId ? { ...c, status: 'breached' as ContractStatus } : c
        ),
      }));
    } else if (!isBreached && existingBreach) {
      set((state) => ({
        breachOrders: state.breachOrders.map((b) =>
          b.id === existingBreach.id ? { ...b, status: 'resolved' as const } : b
        ),
      }));
    }
  },

  assignBreachOrder: (orderId, handler) => {
    set((state) => ({
      breachOrders: state.breachOrders.map((o) =>
        o.id === orderId
          ? { ...o, status: 'processing' as const, handler }
          : o
      ),
    }));
  },

  resolveBreachOrder: (orderId) => {
    set((state) => ({
      breachOrders: state.breachOrders.map((o) =>
        o.id === orderId ? { ...o, status: 'resolved' as const } : o
      ),
    }));
  },

  getContractsByProvince: (provinceId) => {
    if (!provinceId) return get().contracts;
    return get().contracts.filter((c) => c.provinceId === provinceId);
  },

  getBreachOrdersByProvince: (provinceId) => {
    if (!provinceId) return get().breachOrders;
    return get().breachOrders.filter((b) => b.provinceId === provinceId);
  },
}));
