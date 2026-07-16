import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import Login from './pages/Login';
import BossLayout from './components/layout/BossLayout';
import SalesLayout from './components/layout/SalesLayout';
import KeeperLayout from './components/layout/KeeperLayout';
import BossDashboard from './pages/boss/Dashboard';
import BossPets from './pages/boss/Pets';
import BossPetDetail from './pages/boss/PetDetail';
import BossUsers from './pages/boss/Users';
import BossStores from './pages/boss/Stores';
import BossCustomers from './pages/boss/Customers';
import BossAiChat from './pages/boss/AiChat';
import BossFeishu from './pages/boss/Feishu';
import BossPosters from './pages/boss/Posters';
import BossPackages from './pages/boss/Packages';
import SalesDashboard from './pages/sales/Dashboard';
import SalesInventory from './pages/sales/Inventory';
import SalesPetDetail from './pages/sales/PetDetail';
import SalesCustomers from './pages/sales/Customers';
import SalesTasks from './pages/sales/Tasks';
import SalesAiChat from './pages/sales/AiChat';
import SalesPosters from './pages/sales/Posters';
import SalesCheckout from './pages/sales/Checkout';
import SalesDailyReport from './pages/sales/DailyReport';
import KeeperDashboard from './pages/keeper/Dashboard';
import KeeperPets from './pages/keeper/Pets';
import KeeperPetDetail from './pages/keeper/PetDetail';
import PetProfile from './pages/public/PetProfile';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function RoleRedirect() {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'TENANT_OWNER':
    case 'STORE_MANAGER':
      return <Navigate to="/boss/dashboard" replace />;
    case 'SALES':
      return <Navigate to="/sales/dashboard" replace />;
    case 'KEEPER':
      return <Navigate to="/keeper/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/public/pet/:petId/profile" element={<PetProfile />} />
      
      <Route path="/" element={<RoleRedirect />} />

      <Route
        path="/boss"
        element={
          <ProtectedRoute allowedRoles={['TENANT_OWNER', 'STORE_MANAGER']}>
            <BossLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<BossDashboard />} />
        <Route path="pets" element={<BossPets />} />
        <Route path="pets/:id" element={<BossPetDetail />} />
        <Route path="packages" element={<BossPackages />} />
        <Route path="customers" element={<BossCustomers />} />
        <Route path="users" element={<BossUsers />} />
        <Route path="stores" element={<BossStores />} />
        <Route path="ai-chat" element={<BossAiChat />} />
        <Route path="feishu" element={<BossFeishu />} />
        <Route path="posters" element={<BossPosters />} />
      </Route>

      <Route
        path="/sales"
        element={
          <ProtectedRoute allowedRoles={['SALES', 'TENANT_OWNER', 'STORE_MANAGER']}>
            <SalesLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SalesDashboard />} />
        <Route path="inventory" element={<SalesInventory />} />
        <Route path="inventory/:id" element={<SalesPetDetail />} />
        <Route path="checkout/:petId" element={<SalesCheckout />} />
        <Route path="customers" element={<SalesCustomers />} />
        <Route path="tasks" element={<SalesTasks />} />
        <Route path="ai-chat" element={<SalesAiChat />} />
        <Route path="posters" element={<SalesPosters />} />
        <Route path="daily-report" element={<SalesDailyReport />} />
      </Route>

      <Route
        path="/keeper"
        element={
          <ProtectedRoute allowedRoles={['KEEPER', 'TENANT_OWNER', 'STORE_MANAGER']}>
            <KeeperLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<KeeperDashboard />} />
        <Route path="pets" element={<KeeperPets />} />
        <Route path="pets/:id" element={<KeeperPetDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
