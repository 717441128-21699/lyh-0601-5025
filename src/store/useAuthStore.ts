import { create } from 'zustand';
import { User } from '@/types';
import { users, hasPermission as checkPermission } from '@/data/users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  setUserRole: (role: User['role']) => void;
  isNationalRole: () => boolean;
  getVisibleProvinceIds: () => string[] | null;
}

const roleToProvinceMap: Record<string, string[]> = {
  region_manager: ['guangdong', 'guangxi', 'hainan'],
  quality_control: ['guangdong'],
  factory_manager: ['guangdong'],
};

const roleNameMap: Record<User['role'], string> = {
  group_admin: '集团管理员',
  region_manager: '区域负责人',
  factory_manager: '工厂管理员',
  quality_control: '品控人员',
  technical_director: '技术总监',
  legal: '法务人员',
};

const roleNameUserMap: Record<User['role'], string> = {
  group_admin: '张总裁',
  region_manager: '李区域',
  factory_manager: '王厂长',
  quality_control: '陈品控',
  technical_director: '刘技术',
  legal: '赵法务',
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: users[0],
  isAuthenticated: true,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  hasPermission: (permission) => {
    const { user } = get();
    if (!user) return false;
    return checkPermission(user, permission);
  },
  setUserRole: (role) => {
    const provinceIds = roleToProvinceMap[role] || [];
    set({
      user: {
        id: `user-${role}`,
        name: roleNameUserMap[role],
        role,
        roleName: roleNameMap[role],
        email: `${role}@battery-recycle.com`,
        phone: '13800138000',
        provinceIds: provinceIds.length > 0 ? provinceIds : undefined,
      },
    });
  },
  isNationalRole: () => {
    const { user } = get();
    if (!user) return true;
    return ['group_admin', 'technical_director', 'legal'].includes(user.role);
  },
  getVisibleProvinceIds: () => {
    const { user } = get();
    if (!user) return null;
    const nationalRoles: User['role'][] = ['group_admin', 'technical_director', 'legal'];
    if (nationalRoles.includes(user.role)) {
      return null;
    }
    return user.provinceIds || [];
  },
}));
