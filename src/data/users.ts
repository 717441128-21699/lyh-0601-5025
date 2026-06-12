import { User, UserRole } from '@/types';

export const currentUser: User = {
  id: 'user-001',
  name: '张经理',
  role: 'group_admin',
  roleName: '集团管理员',
  email: 'zhang@battery-recycle.com',
  phone: '13800138000',
  provinceIds: [],
  factoryIds: [],
};

export const users: User[] = [
  {
    id: 'user-001',
    name: '张经理',
    role: 'group_admin',
    roleName: '集团管理员',
    email: 'zhang@battery-recycle.com',
    phone: '13800138000',
  },
  {
    id: 'user-002',
    name: '李区域',
    role: 'region_manager',
    roleName: '区域负责人',
    email: 'li@battery-recycle.com',
    phone: '13900139000',
    provinceIds: ['guangdong', 'guangxi', 'hainan'],
  },
  {
    id: 'user-003',
    name: '王厂长',
    role: 'factory_manager',
    roleName: '工厂管理员',
    email: 'wang@battery-recycle.com',
    phone: '13700137000',
    factoryIds: ['factory-gd-01'],
  },
  {
    id: 'user-004',
    name: '陈品控',
    role: 'quality_control',
    roleName: '品控人员',
    email: 'chen@battery-recycle.com',
    phone: '13600136000',
    provinceIds: ['guangdong'],
  },
  {
    id: 'user-005',
    name: '刘技术',
    role: 'technical_director',
    roleName: '技术总监',
    email: 'liu@battery-recycle.com',
    phone: '13500135000',
  },
  {
    id: 'user-006',
    name: '赵法务',
    role: 'legal',
    roleName: '法务人员',
    email: 'zhao@battery-recycle.com',
    phone: '13400134000',
  },
];

export const rolePermissions: Record<UserRole, string[]> = {
  group_admin: [
    'dashboard:view',
    'dashboard:national',
    'province:view',
    'province:all',
    'warning:view',
    'warning:all',
    'warning:approve_level3',
    'contract:view',
    'contract:manage',
    'report:view',
    'report:all',
    'system:manage',
    'user:manage',
  ],
  region_manager: [
    'dashboard:view',
    'dashboard:province',
    'province:view',
    'province:assigned',
    'warning:view',
    'warning:province',
    'warning:approve_level2',
    'contract:view',
    'report:view',
    'report:province',
  ],
  factory_manager: [
    'dashboard:view',
    'dashboard:factory',
    'warning:view',
    'warning:factory',
    'report:view',
    'report:factory',
  ],
  quality_control: [
    'dashboard:view',
    'warning:view',
    'warning:province',
    'warning:approve_level1',
  ],
  technical_director: [
    'dashboard:view',
    'warning:view',
    'warning:all',
    'warning:approve_level2',
    'report:view',
    'report:all',
  ],
  legal: [
    'dashboard:view',
    'contract:view',
    'contract:manage',
    'warning:view',
    'warning:contract_breach',
  ],
};

export const hasPermission = (user: User, permission: string): boolean => {
  const permissions = rolePermissions[user.role] || [];
  return permissions.includes(permission);
};

export const getRoleName = (role: UserRole): string => {
  const names: Record<UserRole, string> = {
    group_admin: '集团管理员',
    region_manager: '区域负责人',
    factory_manager: '工厂管理员',
    quality_control: '品控人员',
    technical_director: '技术总监',
    legal: '法务人员',
  };
  return names[role];
};
