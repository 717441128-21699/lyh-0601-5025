import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  FileBarChart,
  Settings,
  Battery,
  Recycle,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const menuItems = [
  {
    id: 'dashboard',
    label: '核心看板',
    icon: LayoutDashboard,
    path: '/dashboard',
    permission: 'dashboard:view',
  },
  {
    id: 'warnings',
    label: '预警中心',
    icon: AlertTriangle,
    path: '/warnings',
    permission: 'warning:view',
    badge: 4,
  },
  {
    id: 'batteries',
    label: '电池档案',
    icon: Battery,
    path: '/batteries',
    permission: 'dashboard:view',
  },
  {
    id: 'cascade',
    label: '梯次利用',
    icon: Recycle,
    path: '/cascade',
    permission: 'dashboard:view',
  },
  {
    id: 'contracts',
    label: '合同管理',
    icon: FileText,
    path: '/contracts',
    permission: 'contract:view',
  },
  {
    id: 'reports',
    label: '健康诊断',
    icon: FileBarChart,
    path: '/reports',
    permission: 'report:view',
  },
  {
    id: 'system',
    label: '系统管理',
    icon: Settings,
    path: '/system',
    permission: 'system:manage',
    children: [
      { label: '用户管理', path: '/system/users', icon: Users },
    ],
  },
];

export const Sidebar = () => {
  const { user, hasPermission } = useAuthStore();

  const visibleItems = menuItems.filter((item) => hasPermission(item.permission));

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-64 h-screen bg-dark-900/80 backdrop-blur-xl border-r border-white/5 flex flex-col fixed left-0 top-0 z-40"
    >
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-primary">
            <Battery className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-white">电池回收监测</h1>
            <p className="text-xs text-text-muted">智能分析平台</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'text-text-secondary hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-400 rounded-r-full"
                      />
                    )}
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : ''}`} />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-danger-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-text-muted truncate">{user?.roleName}</p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
