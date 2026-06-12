import { Factory } from '@/types';

export const factories: Factory[] = [
  { id: 'factory-gd-01', name: '深圳鹏辉回收工厂', provinceId: 'guangdong', address: '广东省深圳市龙岗区宝龙街道', capacity: 2000, monthlyRecycled: 185, cascadeUtilRate: 82.5, avgSOH: 85.2, recoveryRate: 96.5 },
  { id: 'factory-gd-02', name: '广州格林美工厂', provinceId: 'guangdong', address: '广东省广州市番禺区', capacity: 1800, monthlyRecycled: 162, cascadeUtilRate: 79.8, avgSOH: 82.3, recoveryRate: 95.8 },
  { id: 'factory-gd-03', name: '东莞邦普循环工厂', provinceId: 'guangdong', address: '广东省东莞市松山湖产业园区', capacity: 1500, monthlyRecycled: 135, cascadeUtilRate: 77.2, avgSOH: 80.5, recoveryRate: 94.8 },
  { id: 'factory-gd-04', name: '佛山锂源回收工厂', provinceId: 'guangdong', address: '广东省佛山市三水区', capacity: 1200, monthlyRecycled: 108, cascadeUtilRate: 75.5, avgSOH: 78.6, recoveryRate: 93.5 },
  { id: 'factory-js-01', name: '常州天奈回收工厂', provinceId: 'jiangsu', address: '江苏省常州市新北区', capacity: 1800, monthlyRecycled: 158, cascadeUtilRate: 78.5, avgSOH: 83.5, recoveryRate: 95.2 },
  { id: 'factory-js-02', name: '苏州华友循环工厂', provinceId: 'jiangsu', address: '江苏省苏州市工业园区', capacity: 1500, monthlyRecycled: 132, cascadeUtilRate: 76.2, avgSOH: 81.2, recoveryRate: 94.5 },
  { id: 'factory-js-03', name: '无锡格林美工厂', provinceId: 'jiangsu', address: '江苏省无锡市新吴区', capacity: 1200, monthlyRecycled: 105, cascadeUtilRate: 73.8, avgSOH: 79.5, recoveryRate: 93.2 },
  { id: 'factory-zj-01', name: '杭州南都动力工厂', provinceId: 'zhejiang', address: '浙江省杭州市余杭区', capacity: 1500, monthlyRecycled: 138, cascadeUtilRate: 76.5, avgSOH: 82.8, recoveryRate: 94.8 },
  { id: 'factory-zj-02', name: '宁波容百回收工厂', provinceId: 'zhejiang', address: '浙江省宁波市北仑区', capacity: 1200, monthlyRecycled: 108, cascadeUtilRate: 74.2, avgSOH: 79.8, recoveryRate: 93.8 },
  { id: 'factory-sd-01', name: '济南瑞浦回收工厂', provinceId: 'shandong', address: '山东省济南市高新区', capacity: 1500, monthlyRecycled: 128, cascadeUtilRate: 73.5, avgSOH: 79.5, recoveryRate: 93.5 },
  { id: 'factory-sd-02', name: '青岛国轩工厂', provinceId: 'shandong', address: '山东省青岛市黄岛区', capacity: 1200, monthlyRecycled: 102, cascadeUtilRate: 71.2, avgSOH: 77.8, recoveryRate: 92.2 },
  { id: 'factory-hen-01', name: '郑州比克回收工厂', provinceId: 'henan', address: '河南省郑州市航空港区', capacity: 1200, monthlyRecycled: 98, cascadeUtilRate: 70.5, avgSOH: 77.2, recoveryRate: 92.5 },
  { id: 'factory-sc-01', name: '成都天齐锂业工厂', provinceId: 'sichuan', address: '四川省成都市龙泉驿区', capacity: 1200, monthlyRecycled: 115, cascadeUtilRate: 75.8, avgSOH: 81.5, recoveryRate: 94.5 },
  { id: 'factory-hb-01', name: '武汉宁德时代工厂', provinceId: 'hubei', address: '湖北省武汉市东湖高新区', capacity: 1200, monthlyRecycled: 108, cascadeUtilRate: 73.2, avgSOH: 79.5, recoveryRate: 93.8 },
  { id: 'factory-hn-01', name: '长沙力天回收工厂', provinceId: 'hunan', address: '湖南省长沙市望城区', capacity: 1000, monthlyRecycled: 85, cascadeUtilRate: 69.8, avgSOH: 76.8, recoveryRate: 92.2 },
  { id: 'factory-heb-01', name: '石家庄银隆工厂', provinceId: 'hebei', address: '河北省石家庄市栾城区', capacity: 1000, monthlyRecycled: 82, cascadeUtilRate: 68.5, avgSOH: 76.2, recoveryRate: 91.5 },
  { id: 'factory-fj-01', name: '厦门厦钨新能源工厂', provinceId: 'fujian', address: '福建省厦门市海沧区', capacity: 1000, monthlyRecycled: 92, cascadeUtilRate: 74.8, avgSOH: 80.5, recoveryRate: 94.2 },
  { id: 'factory-sh-01', name: '上海格派回收工厂', provinceId: 'shanghai', address: '上海市浦东新区张江高科技园区', capacity: 1200, monthlyRecycled: 112, cascadeUtilRate: 78.5, avgSOH: 82.5, recoveryRate: 96.2 },
  { id: 'factory-bj-01', name: '北京当升材料工厂', provinceId: 'beijing', address: '北京市大兴区生物医药基地', capacity: 800, monthlyRecycled: 68, cascadeUtilRate: 76.8, avgSOH: 82.8, recoveryRate: 95.8 },
  { id: 'factory-sx-01', name: '西安迈科回收工厂', provinceId: 'shaanxi', address: '陕西省西安市高新区', capacity: 1000, monthlyRecycled: 78, cascadeUtilRate: 68.2, avgSOH: 75.5, recoveryRate: 91.2 },
  { id: 'factory-ln-01', name: '沈阳东北蓄电池工厂', provinceId: 'liaoning', address: '辽宁省沈阳市铁西区', capacity: 1000, monthlyRecycled: 72, cascadeUtilRate: 66.5, avgSOH: 74.8, recoveryRate: 90.5 },
  { id: 'factory-cq-01', name: '重庆紫建回收工厂', provinceId: 'chongqing', address: '重庆市渝北区龙兴镇', capacity: 800, monthlyRecycled: 68, cascadeUtilRate: 72.5, avgSOH: 79.2, recoveryRate: 93.5 },
  { id: 'factory-gx-01', name: '南宁南南铝工厂', provinceId: 'guangxi', address: '广西南宁市江南区', capacity: 800, monthlyRecycled: 62, cascadeUtilRate: 67.2, avgSOH: 75.8, recoveryRate: 91.2 },
  { id: 'factory-yn-01', name: '昆明贵研铂业工厂', provinceId: 'yunnan', address: '云南省昆明市高新区', capacity: 800, monthlyRecycled: 65, cascadeUtilRate: 71.5, avgSOH: 78.5, recoveryRate: 93.2 },
];

export const getFactoriesByProvince = (provinceId: string): Factory[] => {
  return factories.filter((f) => f.provinceId === provinceId);
};

export const getFactoryById = (id: string): Factory | undefined => {
  return factories.find((f) => f.id === id);
};
