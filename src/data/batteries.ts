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
  hebei: generateSOHTrend(74.8, 30),
  fujian: generateSOHTrend(78.2, 30),
  anhui: generateSOHTrend(75.9, 30),
  shaanxi: generateSOHTrend(74.2, 30),
  liaoning: generateSOHTrend(73.5, 30),
  jiangxi: generateSOHTrend(75.1, 30),
  chongqing: generateSOHTrend(77.5, 30),
  guangxi: generateSOHTrend(74.5, 30),
  yunnan: generateSOHTrend(76.8, 30),
  guizhou: generateSOHTrend(75.5, 30),
  shanxi: generateSOHTrend(73.2, 30),
  heilongjiang: generateSOHTrend(72.5, 30),
  jilin: generateSOHTrend(72.8, 30),
  gansu: generateSOHTrend(74.1, 30),
  neimenggu: generateSOHTrend(71.5, 30),
  xinjiang: generateSOHTrend(75.8, 30),
  hainan: generateSOHTrend(80.2, 30),
  ningxia: generateSOHTrend(73.8, 30),
  qinghai: generateSOHTrend(72.2, 30),
  xizang: generateSOHTrend(69.8, 30),
  tianjin: generateSOHTrend(79.5, 30),
  beijing: generateSOHTrend(81.2, 30),
  shanghai: generateSOHTrend(80.8, 30),
};

export const getProvinceSOHTrend = (provinceId: string): SOHTrendItem[] => {
  return provinceSOHTrends[provinceId] || generateSOHTrend(75, 30);
};

const batteryModels = ['NCM811', 'NCM622', 'NCM523', 'LFP', 'BYD Blade', 'CATL LFP'];

const factoryInfo: Record<string, { name: string; provinceId: string; provinceCode: string }> = {
  'factory-gd-01': { name: '深圳鹏辉回收工厂', provinceId: 'guangdong', provinceCode: 'GD' },
  'factory-gd-02': { name: '广州格林美工厂', provinceId: 'guangdong', provinceCode: 'GD' },
  'factory-gd-03': { name: '东莞邦普循环工厂', provinceId: 'guangdong', provinceCode: 'GD' },
  'factory-gd-04': { name: '佛山锂源回收工厂', provinceId: 'guangdong', provinceCode: 'GD' },
  'factory-gd-05': { name: '惠州亿纬锂能工厂', provinceId: 'guangdong', provinceCode: 'GD' },
  'factory-gd-06': { name: '珠海冠宇回收工厂', provinceId: 'guangdong', provinceCode: 'GD' },
  'factory-gd-07': { name: '江门芳源环保工厂', provinceId: 'guangdong', provinceCode: 'GD' },
  'factory-gd-08': { name: '中山天骄回收工厂', provinceId: 'guangdong', provinceCode: 'GD' },
  'factory-gd-09': { name: '肇庆风华新能源工厂', provinceId: 'guangdong', provinceCode: 'GD' },
  'factory-gd-10': { name: '揭阳巨正源回收工厂', provinceId: 'guangdong', provinceCode: 'GD' },
  'factory-gd-11': { name: '汕头万顺新材工厂', provinceId: 'guangdong', provinceCode: 'GD' },
  'factory-gd-12': { name: '梅州博敏电子回收工厂', provinceId: 'guangdong', provinceCode: 'GD' },
  'factory-js-01': { name: '常州天奈回收工厂', provinceId: 'jiangsu', provinceCode: 'JS' },
  'factory-js-02': { name: '苏州华友循环工厂', provinceId: 'jiangsu', provinceCode: 'JS' },
  'factory-js-03': { name: '无锡格林美工厂', provinceId: 'jiangsu', provinceCode: 'JS' },
  'factory-js-04': { name: '南京国轩高科工厂', provinceId: 'jiangsu', provinceCode: 'JS' },
  'factory-js-05': { name: '南通瑞浦能源工厂', provinceId: 'jiangsu', provinceCode: 'JS' },
  'factory-js-06': { name: '盐城维信电子回收工厂', provinceId: 'jiangsu', provinceCode: 'JS' },
  'factory-js-07': { name: '扬州泰富特种材料工厂', provinceId: 'jiangsu', provinceCode: 'JS' },
  'factory-js-08': { name: '镇江天工股份回收工厂', provinceId: 'jiangsu', provinceCode: 'JS' },
  'factory-js-09': { name: '泰州智航新能源工厂', provinceId: 'jiangsu', provinceCode: 'JS' },
  'factory-zj-01': { name: '杭州南都动力工厂', provinceId: 'zhejiang', provinceCode: 'ZJ' },
  'factory-zj-02': { name: '宁波容百回收工厂', provinceId: 'zhejiang', provinceCode: 'ZJ' },
  'factory-zj-03': { name: '温州瑞浦能源工厂', provinceId: 'zhejiang', provinceCode: 'ZJ' },
  'factory-zj-04': { name: '绍兴长信科技回收工厂', provinceId: 'zhejiang', provinceCode: 'ZJ' },
  'factory-zj-05': { name: '嘉兴科力远工厂', provinceId: 'zhejiang', provinceCode: 'ZJ' },
  'factory-zj-06': { name: '湖州天能电池回收工厂', provinceId: 'zhejiang', provinceCode: 'ZJ' },
  'factory-zj-07': { name: '金华万里扬工厂', provinceId: 'zhejiang', provinceCode: 'ZJ' },
  'factory-sd-01': { name: '济南瑞浦回收工厂', provinceId: 'shandong', provinceCode: 'SD' },
  'factory-sd-02': { name: '青岛国轩工厂', provinceId: 'shandong', provinceCode: 'SD' },
  'factory-sd-03': { name: '烟台南山集团回收工厂', provinceId: 'shandong', provinceCode: 'SD' },
  'factory-sd-04': { name: '潍坊盛瑞传动工厂', provinceId: 'shandong', provinceCode: 'SD' },
  'factory-sd-05': { name: '临沂江泉工业园回收工厂', provinceId: 'shandong', provinceCode: 'SD' },
  'factory-sd-06': { name: '淄博齐峰新材工厂', provinceId: 'shandong', provinceCode: 'SD' },
  'factory-sd-07': { name: '济宁如意集团回收工厂', provinceId: 'shandong', provinceCode: 'SD' },
  'factory-sd-08': { name: '威海广泰空港工厂', provinceId: 'shandong', provinceCode: 'SD' },
  'factory-hen-01': { name: '郑州比克回收工厂', provinceId: 'henan', provinceCode: 'HEN' },
  'factory-hen-02': { name: '洛阳中航锂电工厂', provinceId: 'henan', provinceCode: 'HEN' },
  'factory-hen-03': { name: '新乡金龙铜管回收工厂', provinceId: 'henan', provinceCode: 'HEN' },
  'factory-hen-04': { name: '许昌远东传动工厂', provinceId: 'henan', provinceCode: 'HEN' },
  'factory-hen-05': { name: '南阳淅川铝业回收工厂', provinceId: 'henan', provinceCode: 'HEN' },
  'factory-hen-06': { name: '安阳岷山环能工厂', provinceId: 'henan', provinceCode: 'HEN' },
  'factory-sc-01': { name: '成都天齐锂业工厂', provinceId: 'sichuan', provinceCode: 'SC' },
  'factory-sc-02': { name: '宜宾天原集团回收工厂', provinceId: 'sichuan', provinceCode: 'SC' },
  'factory-sc-03': { name: '绵阳长虹电子工厂', provinceId: 'sichuan', provinceCode: 'SC' },
  'factory-sc-04': { name: '德阳东方电气回收工厂', provinceId: 'sichuan', provinceCode: 'SC' },
  'factory-sc-05': { name: '乐山永祥股份工厂', provinceId: 'sichuan', provinceCode: 'SC' },
  'factory-hb-01': { name: '武汉宁德时代工厂', provinceId: 'hubei', provinceCode: 'HB' },
  'factory-hb-02': { name: '宜昌兴发集团回收工厂', provinceId: 'hubei', provinceCode: 'HB' },
  'factory-hb-03': { name: '襄阳骆驼股份工厂', provinceId: 'hubei', provinceCode: 'HB' },
  'factory-hb-04': { name: '荆门格林美回收工厂', provinceId: 'hubei', provinceCode: 'HB' },
  'factory-hb-05': { name: '荆州亿钧玻璃工厂', provinceId: 'hubei', provinceCode: 'HB' },
  'factory-hn-01': { name: '长沙力天回收工厂', provinceId: 'hunan', provinceCode: 'HN' },
  'factory-hn-02': { name: '株洲旗滨集团工厂', provinceId: 'hunan', provinceCode: 'HN' },
  'factory-hn-03': { name: '湘潭电化回收工厂', provinceId: 'hunan', provinceCode: 'HN' },
  'factory-hn-04': { name: '衡阳水口山工厂', provinceId: 'hunan', provinceCode: 'HN' },
  'factory-heb-01': { name: '石家庄银隆工厂', provinceId: 'hebei', provinceCode: 'HEB' },
  'factory-heb-02': { name: '唐山三友集团回收工厂', provinceId: 'hebei', provinceCode: 'HEB' },
  'factory-heb-03': { name: '保定风帆股份工厂', provinceId: 'hebei', provinceCode: 'HEB' },
  'factory-heb-04': { name: '廊坊梅花生物回收工厂', provinceId: 'hebei', provinceCode: 'HEB' },
  'factory-heb-05': { name: '邯郸钢铁集团工厂', provinceId: 'hebei', provinceCode: 'HEB' },
  'factory-fj-01': { name: '厦门厦钨新能源工厂', provinceId: 'fujian', provinceCode: 'FJ' },
  'factory-fj-02': { name: '福州时代星云工厂', provinceId: 'fujian', provinceCode: 'FJ' },
  'factory-fj-03': { name: '宁德邦普循环回收工厂', provinceId: 'fujian', provinceCode: 'FJ' },
  'factory-fj-04': { name: '泉州火炬电子工厂', provinceId: 'fujian', provinceCode: 'FJ' },
  'factory-ah-01': { name: '合肥国轩高科工厂', provinceId: 'anhui', provinceCode: 'AH' },
  'factory-ah-02': { name: '芜湖天弋能源回收工厂', provinceId: 'anhui', provinceCode: 'AH' },
  'factory-ah-03': { name: '马鞍山钢铁集团工厂', provinceId: 'anhui', provinceCode: 'AH' },
  'factory-ah-04': { name: '蚌埠华光玻璃回收工厂', provinceId: 'anhui', provinceCode: 'AH' },
  'factory-sx-01': { name: '西安迈科回收工厂', provinceId: 'shaanxi', provinceCode: 'SX' },
  'factory-sx-02': { name: '宝鸡钛业集团工厂', provinceId: 'shaanxi', provinceCode: 'SX' },
  'factory-sx-03': { name: '咸阳彩虹集团回收工厂', provinceId: 'shaanxi', provinceCode: 'SX' },
  'factory-ln-01': { name: '沈阳东北蓄电池工厂', provinceId: 'liaoning', provinceCode: 'LN' },
  'factory-ln-02': { name: '大连融科储能工厂', provinceId: 'liaoning', provinceCode: 'LN' },
  'factory-ln-03': { name: '鞍山钢铁集团回收工厂', provinceId: 'liaoning', provinceCode: 'LN' },
  'factory-jx-01': { name: '南昌江特电机工厂', provinceId: 'jiangxi', provinceCode: 'JX' },
  'factory-jx-02': { name: '赣州章源钨业回收工厂', provinceId: 'jiangxi', provinceCode: 'JX' },
  'factory-jx-03': { name: '宜春赣锋锂业工厂', provinceId: 'jiangxi', provinceCode: 'JX' },
  'factory-cq-01': { name: '重庆紫建回收工厂', provinceId: 'chongqing', provinceCode: 'CQ' },
  'factory-cq-02': { name: '重庆小康工业工厂', provinceId: 'chongqing', provinceCode: 'CQ' },
  'factory-gx-01': { name: '南宁南南铝工厂', provinceId: 'guangxi', provinceCode: 'GX' },
  'factory-gx-02': { name: '柳州五菱汽车回收工厂', provinceId: 'guangxi', provinceCode: 'GX' },
  'factory-yn-01': { name: '昆明贵研铂业工厂', provinceId: 'yunnan', provinceCode: 'YN' },
  'factory-yn-02': { name: '曲靖驰宏锌锗回收工厂', provinceId: 'yunnan', provinceCode: 'YN' },
  'factory-gz-01': { name: '贵阳振华新材料工厂', provinceId: 'guizhou', provinceCode: 'GZ' },
  'factory-gz-02': { name: '遵义钛业集团回收工厂', provinceId: 'guizhou', provinceCode: 'GZ' },
  'factory-shan-01': { name: '太原太钢集团回收工厂', provinceId: 'shanxi', provinceCode: 'SHAN' },
  'factory-shan-02': { name: '大同煤电集团工厂', provinceId: 'shanxi', provinceCode: 'SHAN' },
  'factory-hlj-01': { name: '哈尔滨光宇电源工厂', provinceId: 'heilongjiang', provinceCode: 'HLJ' },
  'factory-hlj-02': { name: '齐齐哈尔北满特钢回收工厂', provinceId: 'heilongjiang', provinceCode: 'HLJ' },
  'factory-jl-01': { name: '长春一汽新能源工厂', provinceId: 'jilin', provinceCode: 'JL' },
  'factory-jl-02': { name: '吉林华微电子回收工厂', provinceId: 'jilin', provinceCode: 'JL' },
  'factory-gs-01': { name: '兰州金川集团回收工厂', provinceId: 'gansu', provinceCode: 'GS' },
  'factory-gs-02': { name: '天水华天科技工厂', provinceId: 'gansu', provinceCode: 'GS' },
  'factory-nmg-01': { name: '呼和浩特中环光伏工厂', provinceId: 'neimenggu', provinceCode: 'NMG' },
  'factory-nmg-02': { name: '包头钢铁集团回收工厂', provinceId: 'neimenggu', provinceCode: 'NMG' },
  'factory-xj-01': { name: '乌鲁木齐特变电工工厂', provinceId: 'xinjiang', provinceCode: 'XJ' },
  'factory-hi-01': { name: '海口椰树集团回收工厂', provinceId: 'hainan', provinceCode: 'HI' },
  'factory-nx-01': { name: '银川东方钽业工厂', provinceId: 'ningxia', provinceCode: 'NX' },
  'factory-qh-01': { name: '西宁西部矿业回收工厂', provinceId: 'qinghai', provinceCode: 'QH' },
  'factory-xz-01': { name: '拉萨高争建材回收工厂', provinceId: 'xizang', provinceCode: 'XZ' },
  'factory-tj-01': { name: '天津力神电池工厂', provinceId: 'tianjin', provinceCode: 'TJ' },
  'factory-tj-02': { name: '天津巴莫科技回收工厂', provinceId: 'tianjin', provinceCode: 'TJ' },
  'factory-bj-01': { name: '北京当升材料工厂', provinceId: 'beijing', provinceCode: 'BJ' },
  'factory-bj-02': { name: '北京汽车新能源回收工厂', provinceId: 'beijing', provinceCode: 'BJ' },
  'factory-sh-01': { name: '上海格派回收工厂', provinceId: 'shanghai', provinceCode: 'SH' },
  'factory-sh-02': { name: '上海杉杉科技工厂', provinceId: 'shanghai', provinceCode: 'SH' },
  'factory-sh-03': { name: '上海璞泰来回收工厂', provinceId: 'shanghai', provinceCode: 'SH' },
};

const applicationScenes = ['储能电站', '通信基站', '低速电动车', '电动工具', '备用电源', '光伏储能'];
const batteryModelList = ['BYD Blade LFP', 'CATL NCM811', 'BYD Tang NCM', 'GEELY NCM622', 'TQC NCM', 'LFP Battery', 'NCM523 Battery'];

const generateBatches = (): BatteryBatch[] => {
  const batches: BatteryBatch[] = [];
  let batchNum = 1;

  Object.entries(factoryInfo).forEach(([factoryId, info]) => {
    const numBatches = 2 + (batchNum % 2);
    const factoryIndex = parseInt(factoryId.split('-').pop() || '1');
    
    for (let i = 1; i <= numBatches; i++) {
      const dayOffset = (factoryIndex * 7 + i * 12) % 120;
      const baseCount = 1000 + factoryIndex * 300 + i * 500;
      const sohBase = 65 + (factoryIndex % 5) * 5 + (i % 3) * 3;
      const capacityBase = 60 + (factoryIndex % 4) * 10 + i * 5;
      
      const grade: BatteryGrade = sohBase >= 80 ? 'A' : sohBase >= 72 ? 'B' : sohBase >= 65 ? 'C' : 'D';
      const sceneIndex = (factoryIndex + i) % applicationScenes.length;
      const modelIndex = (factoryIndex * 2 + i) % batteryModelList.length;
      
      const provincePrefix = factoryId.replace('factory-', '').replace(/-\d+$/, '');
      
      batches.push({
        id: `batch-${provincePrefix}-${String(batchNum).padStart(3, '0')}`,
        batchNo: `B2024${String(6 - Math.floor(dayOffset / 30)).padStart(2, '0')}${String((dayOffset % 30) + 1).padStart(2, '0')}-${info.provinceCode}`,
        batteryModel: batteryModelList[modelIndex],
        factoryId: factoryId,
        factoryName: info.name,
        provinceId: info.provinceId,
        recycleDate: dayjs().subtract(dayOffset + i * 5, 'day').format('YYYY-MM-DD'),
        totalCount: baseCount + Math.floor(Math.random() * 1000),
        avgSOH: Math.round((sohBase + Math.random() * 5) * 10) / 10,
        avgCapacity: Math.round((capacityBase + Math.random() * 10) * 10) / 10,
        grade: grade,
        applicationScene: applicationScenes[sceneIndex],
      });
      
      batchNum++;
    }
  });

  return batches;
};

export const batteryBatches: BatteryBatch[] = generateBatches();

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
