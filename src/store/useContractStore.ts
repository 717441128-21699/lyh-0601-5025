import { create } from 'zustand';
import {
  Contract,
  BreachOrder,
  BreachProcessRecord,
  BreachResolution,
  InspectionReportRecord,
  QuantityChangeLog,
  ImportSource,
  ContractStatus,
  BreachOrderStatus,
} from '@/types';
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

export interface ContractImportPreview {
  contracts: Contract[];
  breachCount: number;
  fileName?: string;
}

export interface ReportImportPreview {
  contractId: string;
  contractNo: string;
  oldActualQuantity: number;
  newActualQuantity: number;
  agreedQuantity: number;
  wasBreached: boolean;
  willBeBreached: boolean;
  breachChange: 'none' | 'generated' | 'resolved';
  fileName?: string;
}

interface ContractState {
  contracts: Contract[];
  breachOrders: BreachOrder[];
  parseContractFile: (file: File) => Promise<{ success: boolean; message: string; preview?: ContractImportPreview }>;
  confirmImportContracts: (params: { preview: ContractImportPreview; selectedIds?: string[] }) => { success: boolean; message: string };
  parseReportFile: (file: File, selectedContractId?: string) => Promise<{ success: boolean; message: string; preview?: ReportImportPreview }>;
  confirmImportReport: (preview: ReportImportPreview) => { success: boolean; message: string };
  addContract: (contract: Omit<Contract, 'id' | 'createTime' | 'status'>) => void;
  updateContractActualQuantity: (contractId: string, quantity: number) => void;
  checkBreach: (contractId: string) => void;
  assignBreachOrder: (orderId: string, handler: string) => void;
  startProcessBreachOrder: (orderId: string, handler: string, opinion: string) => { success: boolean; message: string };
  resolveBreachOrder: (orderId: string, handler: string, opinion: string, resolution?: BreachResolution) => { success: boolean; message: string };
  getContractsByProvince: (provinceId?: string) => Contract[];
  getBreachOrdersByProvince: (provinceId?: string) => BreachOrder[];
  getContractById: (id: string) => Contract | undefined;
  getBreachOrdersByContractId: (contractId: string) => BreachOrder[];
}

let contractIdCounter = 100;
let breachIdCounter = 100;

const parseExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);
        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsArrayBuffer(file);
  });
};

const findKey = (row: any, keywords: string[]): string | undefined => {
  return Object.keys(row).find((key) =>
    keywords.some((kw) => key.toLowerCase().includes(kw.toLowerCase()))
  );
};

export const useContractStore = create<ContractState>((set, get) => ({
  contracts: [...initialContracts],
  breachOrders: [...initialBreachOrders],

  parseContractFile: async (file) => {
    try {
      const jsonData = await parseExcelFile(file);

      if (jsonData.length === 0) {
        return { success: false, message: 'Excel 文件为空' };
      }

      const firstRow = jsonData[0];
      const contractNoKey = findKey(firstRow, ['合同号', '合同编号', 'contractNo', 'contract_no']);
      const partyAKey = findKey(firstRow, ['甲方', 'partyA', 'party_a', '甲方名称']);
      const partyBKey = findKey(firstRow, ['乙方', 'partyB', 'party_b', '乙方名称', '回收企业']);
      const startDateKey = findKey(firstRow, ['开始日期', 'startDate', 'start_date', '合同开始']);
      const endDateKey = findKey(firstRow, ['结束日期', 'endDate', 'end_date', '合同结束']);
      const quantityKey = findKey(firstRow, ['约定数量', '约定回收量', 'agreedQuantity', 'quantity', '回收量']);
      const actualQuantityKey = findKey(firstRow, ['实际数量', '实际回收量', 'actualQuantity', '实际量', '已回收']);
      const priceKey = findKey(firstRow, ['单价', 'unitPrice', 'price', '合同单价']);
      const provinceKey = findKey(firstRow, ['省份', 'province', '地区', '所属省份']);
      const modelsKey = findKey(firstRow, ['电池型号', '型号', 'batteryModel', 'models']);

      const tempCounterStart = contractIdCounter + 1;
      const previewContracts: Contract[] = jsonData.map((row, index) => {
        const previewId = tempCounterStart + index;
        const provinceNameRaw = row[provinceKey || ''] as string;
        const provinceId = getProvinceIdByName(provinceNameRaw);
        const provinceName = provinces.find((p) => p.id === provinceId)?.name || provinceNameRaw || '广东省';
        const agreedQty = Number(row[quantityKey || '']) || 500;
        const actualQty = row[actualQuantityKey] !== undefined
          ? Number(row[actualQuantityKey]) || 0
          : 0;

        return {
          id: `contract-preview-${previewId}`,
          contractNo: row[contractNoKey || ''] as string || `HT-IMPORT-${previewId}`,
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
          importSource: 'excel' as ImportSource,
          importFileName: file.name,
          inspectionReports: [],
          quantityChanges: [],
        };
      });

      const breachCount = previewContracts.filter((c) => c.status === 'breached').length;

      return {
        success: true,
        message: `解析完成，共 ${previewContracts.length} 份合同，其中 ${breachCount} 份存在违约风险`,
        preview: {
          contracts: previewContracts,
          breachCount,
          fileName: file.name,
        },
      };
    } catch (err) {
      return { success: false, message: '解析失败，请检查文件格式' };
    }
  },

  confirmImportContracts: ({ preview, selectedIds }) => {
    let contractsToImport = preview.contracts;

    if (selectedIds && selectedIds.length > 0) {
      contractsToImport = preview.contracts.filter((c) => selectedIds.includes(c.id));
    }

    if (contractsToImport.length === 0) {
      return { success: false, message: '未选择需要导入的合同' };
    }

    const finalContracts = contractsToImport.map((c) => {
      contractIdCounter++;
      return {
        ...c,
        id: `contract-import-${contractIdCounter}`,
        importSource: 'excel' as ImportSource,
        importFileName: preview.fileName,
        inspectionReports: c.inspectionReports || [],
        quantityChanges: c.quantityChanges || [],
      };
    });

    set((state) => {
      const allContracts = [...finalContracts, ...state.contracts];

      const newBreachOrders: BreachOrder[] = [];
      finalContracts.forEach((contract) => {
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
            processRecords: [],
          });
        }
      });

      return {
        contracts: allContracts,
        breachOrders: [...newBreachOrders, ...state.breachOrders],
      };
    });

    const breachCount = finalContracts.filter((c) => c.status === 'breached').length;
    return {
      success: true,
      message: `成功导入 ${finalContracts.length} 份合同${breachCount > 0 ? `，已自动生成 ${breachCount} 份违约工单并派发给法务` : ''}`,
    };
  },

  parseReportFile: async (file, selectedContractId) => {
    try {
      const jsonData = await parseExcelFile(file);

      if (jsonData.length === 0) {
        return { success: false, message: '检测报告为空' };
      }

      const firstRow = jsonData[0];
      const quantityKeywords = ['回收量', '数量', 'quantity', 'total', '重量', '总重量', '实际回收量', '回收吨数', '吨数'];
      const quantityKey = findKey(firstRow, quantityKeywords);
      const contractNoKey = findKey(firstRow, ['合同号', '合同编号', 'contractNo', 'contract_no']);

      if (!quantityKey) {
        return { success: false, message: '报告缺少回收量数据，请确保文件包含"回收量"、"数量"或类似列' };
      }

      let totalRecycled = 0;
      jsonData.forEach((row) => {
        const val = row[quantityKey];
        const num = Number(val);
        if (!isNaN(num) && num !== undefined) {
          totalRecycled += num;
        }
      });

      const contracts = get().contracts;
      let targetContract: Contract | undefined;

      if (selectedContractId) {
        targetContract = contracts.find((c) => c.id === selectedContractId);
      }

      if (!targetContract && contractNoKey) {
        const reportContractNo = firstRow[contractNoKey];
        if (reportContractNo) {
          targetContract = contracts.find((c) => c.contractNo === String(reportContractNo));
        }
      }

      if (!targetContract) {
        return {
          success: false,
          message: '无法匹配到对应合同，请先选择合同或确保报告中包含合同号',
        };
      }

      const wasBreached = targetContract.actualQuantity < targetContract.agreedQuantity * 0.9;
      const willBeBreached = totalRecycled < targetContract.agreedQuantity * 0.9;
      let breachChange: 'none' | 'generated' | 'resolved' = 'none';
      if (!wasBreached && willBeBreached) {
        breachChange = 'generated';
      } else if (wasBreached && !willBeBreached) {
        breachChange = 'resolved';
      }

      return {
        success: true,
        message: `解析完成，将覆盖合同 [${targetContract.contractNo}] 的实际回收量`,
        preview: {
          contractId: targetContract.id,
          contractNo: targetContract.contractNo,
          oldActualQuantity: targetContract.actualQuantity,
          newActualQuantity: totalRecycled,
          agreedQuantity: targetContract.agreedQuantity,
          wasBreached,
          willBeBreached,
          breachChange,
          fileName: file.name,
        },
      };
    } catch (err) {
      return { success: false, message: '解析失败，请检查文件格式' };
    }
  },

  confirmImportReport: (preview) => {
    const { contractId, newActualQuantity, oldActualQuantity, fileName } = preview;

    const reportId = `inspection-report-${Date.now()}`;
    const reportNo = `RPT-${Date.now().toString().slice(-6)}`;
    const qtyChangeId = `qty-change-${Date.now()}`;
    const nowStr = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const newReport: InspectionReportRecord = {
      id: reportId,
      contractId,
      reportNo,
      fileName,
      recycledQuantity: newActualQuantity,
      previousQuantity: oldActualQuantity,
      newQuantity: newActualQuantity,
      operator: '系统',
      importTime: nowStr,
    };

    const newQtyChange: QuantityChangeLog = {
      id: qtyChangeId,
      contractId,
      previousQuantity: oldActualQuantity,
      newQuantity: newActualQuantity,
      changeReason: '检测报告导入更新',
      operator: '系统',
      changeTime: nowStr,
    };

    set((state) => ({
      contracts: state.contracts.map((c) =>
        c.id === contractId
          ? {
              ...c,
              actualQuantity: newActualQuantity,
              status: newActualQuantity >= c.agreedQuantity
                ? 'fulfilled' as ContractStatus
                : newActualQuantity < c.agreedQuantity * 0.9
                ? 'breached' as ContractStatus
                : 'active' as ContractStatus,
              inspectionReports: [...(c.inspectionReports || []), newReport],
              quantityChanges: [...(c.quantityChanges || []), newQtyChange],
            }
          : c
      ),
    }));

    get().checkBreach(contractId);

    let statusMsg = '';
    if (preview.breachChange === 'generated') {
      statusMsg = '，已触发违约并生成法务工单';
    } else if (preview.breachChange === 'resolved') {
      statusMsg = '，违约状态已解除';
    }

    return {
      success: true,
      message: `成功更新合同 [${preview.contractNo}] 实际回收量为 ${newActualQuantity} 吨${statusMsg}`,
    };
  },

  addContract: (contractData) => {
    contractIdCounter++;
    const status = contractData.actualQuantity < contractData.agreedQuantity * 0.9 ? 'breached' as ContractStatus : 'active' as ContractStatus;
    const newContract: Contract = {
      ...contractData,
      id: `contract-${contractIdCounter}`,
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      status,
      inspectionReports: [],
      quantityChanges: [],
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
        processRecords: [],
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
          b.id === existingBreach.id ? { ...b, status: 'resolved' as BreachOrderStatus } : b
        ),
      }));
    }
  },

  assignBreachOrder: (orderId, handler) => {
    set((state) => ({
      breachOrders: state.breachOrders.map((o) =>
        o.id === orderId
          ? { ...o, status: 'processing' as BreachOrderStatus, handler }
          : o
      ),
    }));
  },

  startProcessBreachOrder: (orderId, handler, opinion) => {
    const nowStr = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const processRecord: BreachProcessRecord = {
      id: `breach-process-${Date.now()}`,
      orderId,
      status: 'processing',
      handler,
      opinion,
      processTime: nowStr,
    };

    set((state) => ({
      breachOrders: state.breachOrders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'processing' as BreachOrderStatus,
              handler,
              processRecords: [...(o.processRecords || []), processRecord],
            }
          : o
      ),
    }));

    return {
      success: true,
      message: `违约工单已进入处理流程，处理人：${handler}`,
    };
  },

  resolveBreachOrder: (orderId, handler, opinion, resolution) => {
    const nowStr = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const processRecord: BreachProcessRecord = {
      id: `breach-process-${Date.now()}`,
      orderId,
      status: 'resolved',
      handler,
      opinion,
      resolution,
      processTime: nowStr,
    };

    set((state) => ({
      breachOrders: state.breachOrders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'resolved' as BreachOrderStatus,
              handler,
              finalOpinion: opinion,
              finalResolution: resolution,
              resolveTime: nowStr,
              processRecords: [...(o.processRecords || []), processRecord],
            }
          : o
      ),
    }));

    const resolutionText = resolution ? `，处理方式：${resolution}` : '';
    return {
      success: true,
      message: `违约工单已完成处理${resolutionText}`,
    };
  },

  getContractsByProvince: (provinceId) => {
    if (!provinceId) return get().contracts;
    return get().contracts.filter((c) => c.provinceId === provinceId);
  },

  getBreachOrdersByProvince: (provinceId) => {
    if (!provinceId) return get().breachOrders;
    return get().breachOrders.filter((b) => b.provinceId === provinceId);
  },

  getContractById: (id) => {
    return get().contracts.find((c) => c.id === id);
  },

  getBreachOrdersByContractId: (contractId) => {
    return get().breachOrders.filter((b) => b.contractId === contractId);
  },
}));
