import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import Dashboard from '@/pages/Dashboard';
import ProvinceDetail from '@/pages/ProvinceDetail';
import WarningCenter from '@/pages/WarningCenter';
import ContractManagement from '@/pages/ContractManagement';
import HealthReport from '@/pages/HealthReport';
import BatteryArchive from '@/pages/BatteryArchive';
import CascadeUtilization from '@/pages/CascadeUtilization';
import SystemManagement from '@/pages/SystemManagement';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/province/:provinceId" element={<ProvinceDetail />} />
          <Route path="/warnings" element={<WarningCenter />} />
          <Route path="/batteries" element={<BatteryArchive />} />
          <Route path="/cascade" element={<CascadeUtilization />} />
          <Route path="/contracts" element={<ContractManagement />} />
          <Route path="/reports" element={<HealthReport />} />
          <Route path="/system" element={<SystemManagement />} />
          <Route path="/system/users" element={<SystemManagement />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
