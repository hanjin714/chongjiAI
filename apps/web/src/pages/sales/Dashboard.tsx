import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Users, Package, MessageSquare, Clock, AlertCircle, ChevronRight, Sparkles } from 'lucide-react';
import api from '@/lib/api';

export default function SalesDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState({ todo: 0, completed: 0, high: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/tasks', { params: { pageSize: 10 } });
      const items = res.data.items || [];
      setTasks(items.filter((t: any) => t.status === 'TODO').slice(0, 5));
      setStats({
        todo: items.filter((t: any) => t.status === 'TODO').length,
        completed: items.filter((t: any) => t.status === 'DONE').length,
        high: items.filter((t: any) => t.priority === 'HIGH' && t.status === 'TODO').length,
      });
    } catch (error) {
      console.error('获取任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: '查看库存', icon: Package, path: '/sales/inventory', color: 'bg-blue-50 text-blue-600' },
    { label: '客户管理', icon: Users, path: '/sales/customers', color: 'bg-green-50 text-green-600' },
    { label: '任务列表', icon: CheckSquare, path: '/sales/tasks', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'AI 助手', icon: MessageSquare, path: '/sales/ai-chat', color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card p-6 bg-gradient-to-r from-pet-blue to-pet-purple text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">早上好 👋</h1>
            <p className="text-white/80">今天有 {stats.high} 个高优先级任务待处理</p>
          </div>
          <button
            onClick={() => navigate('/sales/ai-chat')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            问 AI
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.todo}</div>
          <div className="text-sm text-gray-500">待处理任务</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-red-500">{stats.high}</div>
          <div className="text-sm text-gray-500">高优先级</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
          <div className="text-sm text-gray-500">已完成</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="card p-4 hover:shadow-card-hover transition-shadow text-center"
            >
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Today's Tasks */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-pet-blue" />
            <h3 className="text-lg font-semibold text-gray-900">今日任务</h3>
          </div>
          <button
            onClick={() => navigate('/sales/tasks')}
            className="text-sm text-pet-blue hover:underline flex items-center gap-1"
          >
            查看全部 <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">加载中...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckSquare className="w-12 h-12 mx-auto mb-2 text-green-400" />
            <p>太棒了！今日任务已全部完成</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-lg border border-gray-200 hover:border-pet-blue/30 hover:bg-blue-50/30 transition-all cursor-pointer"
                onClick={() => navigate('/sales/tasks')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`badge ${
                          task.priority === 'HIGH'
                            ? 'bg-red-100 text-red-700'
                            : task.priority === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {task.priority === 'HIGH' ? '高' : task.priority === 'MEDIUM' ? '中' : '低'}
                      </span>
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">{task.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
