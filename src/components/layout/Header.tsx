import { motion } from 'framer-motion';
import { Bell, Search, RefreshCw, ChevronDown, Zap } from 'lucide-react';
import { useState } from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useAuthStore } from '@/store/useAuthStore';
import { provinces } from '@/data/provinces';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [showProvinceMenu, setShowProvinceMenu] = useState(false);
  const { selectedProvinceId, setSelectedProvince } = useDashboardStore();
  const { user, setUserRole } = useAuthStore();
  const navigate = useNavigate();

  const selectedProvince = provinces.find((p) => p.id === selectedProvinceId);
  const displayText = selectedProvince ? selectedProvince.name : '全国';

  const handleProvinceSelect = (provinceId: string | null) => {
    setSelectedProvince(provinceId);
    setShowProvinceMenu(false);
    if (provinceId) {
      navigate(`/province/${provinceId}`);
    } else {
      navigate('/dashboard');
    }
  };

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
              <div
                onClick={() => handleProvinceSelect(null)}
                className={`px-4 py-2.5 cursor-pointer hover:bg-white/5 transition-colors ${selectedProvinceId === null ? 'bg-primary-500/20 text-primary-400' : 'text-white'}`}
              >
                全国视图
              </div>
              <div className="border-t border-white/5" />
              {provinces.slice(0, 15).map((province) => (
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

        <button
          onClick={() => {
            const roles = ['group_admin', 'region_manager', 'factory_manager', 'quality_control', 'technical_director', 'legal'];
            const currentIndex = roles.indexOf(user?.role || 'group_admin');
            const nextRole = roles[(currentIndex + 1) % roles.length];
            setUserRole(nextRole as any);
          }}
          className="text-xs text-text-muted hover:text-text-secondary transition-colors px-2 py-1 rounded hover:bg-white/5"
          title="切换角色（演示用）"
        >
          切换角色
        </button>
      </div>
    </motion.header>
  );
};
