import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  CheckSquare,
  MessageSquare,
  LogOut,
  Sparkles,
  Image,
  FileText,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

const menuItems = [
  { path: '/sales/dashboard', label: '今日工作台', icon: LayoutDashboard },
  { path: '/sales/inventory', label: '库存与开单', icon: Package },
  { path: '/sales/customers', label: '客户跟进', icon: Users },
  { path: '/sales/tasks', label: '任务管理', icon: CheckSquare },
  { path: '/sales/posters', label: '每日海报', icon: Image },
  { path: '/sales/daily-report', label: '每日日报', icon: FileText },
  { path: '/sales/ai-chat', label: 'AI 助手', icon: MessageSquare },
];

export default function SalesLayout() {
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
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100 gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-pet-blue to-pet-purple rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900">宠迹 AI</h1>
            <p className="text-xs text-gray-500">销售端</p>
          </div>
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-pet-blue/10 text-pet-blue font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-pet-blue to-pet-purple rounded-full flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">销售顾问</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
              退出
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {menuItems.find((m) => location.pathname.startsWith(m.path))?.label || '销售端'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/sales/ai-chat')}
              className="btn btn-primary text-sm"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              问 AI
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
