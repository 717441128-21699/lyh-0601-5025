import { create } from 'zustand';
import { User } from '@/types';
import { currentUser, hasPermission as checkPermission } from '@/data/users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  setUserRole: (role: User['role']) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: currentUser,
  isAuthenticated: true,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  hasPermission: (permission) => {
    const { user } = get();
    if (!user) return false;
    return checkPermission(user, permission);
  },
  setUserRole: (role) => {
    const { user } = get();
    if (!user) return;
    const roleNames: Record<User['role'], string> = {
      group_admin: '集团管理员',
      region_manager: '区域负责人',
      factory_manager: '工厂管理员',
      quality_control: '品控人员',
      technical_director: '技术总监',
      legal: '法务人员',
    };
    set({
      user: {
        ...user,
        role,
        roleName: roleNames[role],
      },
    });
  },
}));
