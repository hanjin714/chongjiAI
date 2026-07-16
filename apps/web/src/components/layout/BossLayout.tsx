import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Cat,
  Users,
  Store,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Database,
  Package,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/utils';

const menuItems = [
  { path: '/boss/dashboard', label: 'AI 店长台', icon: LayoutDashboard },
  { path: '/boss/pets', label: '宠物库存', icon: Cat },
  { path: '/boss/packages', label: '套餐管理', icon: Package },
  { path: '/boss/customers', label: '客户管理', icon: Users },
  { path: '/boss/users', label: '员工管理', icon: Users },
  { path: '/boss/stores', label: '门店管理', icon: Store },
  { path: '/boss/ai-chat', label: 'AI 对话', icon: MessageSquare },
  { path: '/boss/feishu', label: '飞书同步', icon: Database },
];

export default function BossLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg text-gray-900">宠迹 AI</h1>
                <p className="text-xs text-gray-500">宠物店的 AI 店长</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-gray-500" /> : <Menu className="w-5 h-5 text-gray-500" />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-100">
          <div className={cn('flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50', sidebarOpen ? '' : 'justify-center')}>
            <div className="w-9 h-9 bg-gradient-to-br from-pet-orange to-pet-pink rounded-full flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">店主</p>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" />
                退出
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {menuItems.find((m) => location.pathname.startsWith(m.path))?.label || '管理后台'}
            </h2>
            <p className="text-sm text-gray-500">{user?.storeName || user?.tenantName}</p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
