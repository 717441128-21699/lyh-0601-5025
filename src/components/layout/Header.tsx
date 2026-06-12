import { motion } from 'framer-motion';
import { Bell, Search, ChevronDown, Zap, User, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useAuthStore } from '@/store/useAuthStore';
import { provinces } from '@/data/provinces';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/types';

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'group_admin', label: '集团总裁' },
  { value: 'technical_director', label: '技术总监' },
  { value: 'region_manager', label: '区域负责人' },
  { value: 'quality_control', label: '品控人员' },
  { value: 'factory_manager', label: '工厂管理员' },
  { value: 'legal', label: '法务人员' },
];

export const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [showProvinceMenu, setShowProvinceMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const { visibleProvinces, selectedProvinceId, setSelectedProvince, recalcForRole } = useDashboardStore();
  const { user, setUserRole } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isNational = visibleProvinces.length === provinces.length;
  const selectedProvince = visibleProvinces.find((p) => p.id === selectedProvinceId);
  
  let displayText = '全国';
  if (!isNational) {
    if (selectedProvince) {
      displayText = selectedProvince.name;
    } else if (visibleProvinces.length > 0) {
      displayText = '所辖区域';
    }
  } else if (selectedProvince) {
    displayText = selectedProvince.name;
  }

  const handleProvinceSelect = (provinceId: string | null) => {
    if (provinceId && !visibleProvinces.find((p) => p.id === provinceId)) {
      return;
    }
    setSelectedProvince(provinceId);
    setShowProvinceMenu(false);
    if (provinceId) {
      navigate(`/province/${provinceId}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    recalcForRole();
    setShowRoleMenu(false);
    if (location.pathname.startsWith('/province/')) {
      const provinceId = location.pathname.split('/')[2];
      setTimeout(() => {
        const visible = useDashboardStore.getState().visibleProvinces;
        if (!visible.find((p) => p.id === provinceId)) {
          navigate('/dashboard');
        }
      }, 50);
    }
  };

  const showNationalOption = isNational;

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="h-16 bg-dark-900/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowProvinceMenu(!showProvinceMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all duration-200"
          >
            <span className="text-sm font-medium text-white">{displayText}</span>
            <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${showProvinceMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProvinceMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-56 max-h-80 overflow-y-auto bg-dark-800 rounded-xl border border-white/10 shadow-xl z-50"
            >
              {showNationalOption && (
                <>
                  <div
                    onClick={() => handleProvinceSelect(null)}
                    className={`px-4 py-2.5 cursor-pointer hover:bg-white/5 transition-colors ${selectedProvinceId === null ? 'bg-primary-500/20 text-primary-400' : 'text-white'}`}
                  >
                    全国视图
                  </div>
                  <div className="border-t border-white/5" />
                </>
              )}
              {visibleProvinces.map((province) => (
                <div
                  key={province.id}
                  onClick={() => handleProvinceSelect(province.id)}
                  className={`px-4 py-2 cursor-pointer hover:bg-white/5 transition-colors text-sm ${selectedProvinceId === province.id ? 'bg-primary-500/20 text-primary-400' : 'text-text-secondary hover:text-white'}`}
                >
                  {province.name}
                </div>
              ))}
            </motion.div>
          )}
        </div>

        <div className="h-6 w-px bg-white/10" />

        <div className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-accent-400 animate-pulse" />
          <span className="text-text-secondary">实时数据</span>
          <span className="text-accent-400 font-mono text-xs">●</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className={`relative transition-all duration-300 ${searchOpen ? 'w-64' : 'w-10'}`}>
          {searchOpen ? (
            <input
              type="text"
              placeholder="搜索工厂、电池型号..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary-500/50"
              autoFocus
              onBlur={() => setSearchOpen(false)}
            />
          ) : null}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={`absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-white/10 transition-colors ${searchOpen ? '' : 'relative left-0'}`}
          >
            <Search className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors relative">
          <Bell className="w-5 h-5 text-text-secondary" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full animate-pulse" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
            title="切换角色（演示用）"
          >
            <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary-400" />
            </div>
            <span className="text-sm text-white">{user?.roleName}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-text-secondary transition-transform ${showRoleMenu ? 'rotate-180' : ''}`} />
          </button>

          {showRoleMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 mt-2 w-44 bg-dark-800 rounded-xl border border-white/10 shadow-xl z-50 overflow-hidden"
            >
              <div className="px-3 py-2 text-xs text-text-muted border-b border-white/5">
                切换角色（演示用）
              </div>
              {roleOptions.map((role) => (
                <div
                  key={role.value}
                  onClick={() => handleRoleChange(role.value)}
                  className={`px-3 py-2 cursor-pointer transition-colors text-sm ${
                    user?.role === role.value
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  {role.label}
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
};
