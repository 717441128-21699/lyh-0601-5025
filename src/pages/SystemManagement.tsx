import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Users,
  Building2,
  Database,
  Shield,
  Bell,
  UserPlus,
  Search,
  MoreVertical,
  ChevronDown,
  Edit,
  Trash2,
} from 'lucide-react';
import { users, getRoleName } from '@/data/users';

const SystemManagement = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'org' | 'settings'>('users');

  const tabs = [
    { id: 'users', label: '用户管理', icon: Users },
    { id: 'org', label: '组织架构', icon: Building2 },
    { id: 'settings', label: '系统设置', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="page-title">系统管理</h1>
          <p className="text-sm text-text-muted mt-1">
            用户权限、组织架构、数据接入配置
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card p-1.5 inline-flex"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      placeholder="搜索用户..."
                      className="pl-10 pr-4 py-2 w-64 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary-500/50"
                    />
                  </div>
                  <div className="relative">
                    <select className="appearance-none pr-8 pl-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none">
                      <option value="all">全部角色</option>
                      <option value="group_admin">集团管理员</option>
                      <option value="region_manager">区域负责人</option>
                      <option value="factory_manager">工厂管理员</option>
                      <option value="quality_control">品控人员</option>
                      <option value="technical_director">技术总监</option>
                      <option value="legal">法务人员</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  </div>
                </div>
                <button className="btn-primary text-sm flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  添加用户
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-text-muted uppercase tracking-wider border-b border-white/5">
                      <th className="pb-3 font-medium">用户信息</th>
                      <th className="pb-3 font-medium">角色</th>
                      <th className="pb-3 font-medium">权限范围</th>
                      <th className="pb-3 font-medium">联系方式</th>
                      <th className="pb-3 font-medium">状态</th>
                      <th className="pb-3 font-medium text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {users.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-white">{user.name}</p>
                              <p className="text-xs text-text-muted">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="px-2.5 py-1 text-xs bg-primary-500/20 text-primary-400 rounded-md">
                            {getRoleName(user.role)}
                          </span>
                        </td>
                        <td className="py-4 text-text-secondary">
                          {user.provinceIds && user.provinceIds.length > 0
                            ? `${user.provinceIds.length} 个省份`
                            : user.factoryIds && user.factoryIds.length > 0
                            ? `${user.factoryIds.length} 家工厂`
                            : '全国范围'}
                        </td>
                        <td className="py-4 text-text-secondary">
                          {user.phone}
                        </td>
                        <td className="py-4">
                          <span className="inline-flex items-center gap-1.5 text-accent-400">
                            <span className="w-2 h-2 bg-accent-400 rounded-full" />
                            正常
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button className="p-1.5 rounded-md hover:bg-white/10 text-text-secondary hover:text-white transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'org' && (
          <motion.div
            key="org"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-6"
          >
            <h3 className="section-title mb-6">组织架构</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">集团总部</p>
                    <p className="text-xs text-text-muted">3 个区域 · 32 家工厂</p>
                  </div>
                </div>
              </div>

              <div className="ml-6 space-y-3">
                {['华南区域', '华东区域', '华北区域'].map((region, idx) => (
                  <div key={region} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-accent-500/10 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-accent-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{region}</p>
                        <p className="text-xs text-text-muted">{8 + idx * 4} 家工厂</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-5 h-5 text-primary-400" />
                <h3 className="section-title">数据接入</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-white">实时数据接入</span>
                  <span className="text-accent-400">已启用</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-white">数据清洗频率</span>
                  <span className="text-text-secondary">每小时</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-white">数据保留期限</span>
                  <span className="text-text-secondary">3 年</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-5 h-5 text-warning-400" />
                <h3 className="section-title">预警设置</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-white">SOH 预警阈值</span>
                  <span className="text-text-secondary">70%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-white">利用率预警阈值</span>
                  <span className="text-text-secondary">50%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-white">连续触发天数</span>
                  <span className="text-text-secondary">7 天</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-accent-400" />
                <h3 className="section-title">安全设置</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-white">双因素认证</span>
                  <span className="text-accent-400">已启用</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-white">密码过期</span>
                  <span className="text-text-secondary">90 天</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-white">登录失败锁定</span>
                  <span className="text-text-secondary">5 次</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-white">会话超时</span>
                  <span className="text-text-secondary">30 分钟</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemManagement;
