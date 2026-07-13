import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock,
  Cat,
  Users,
  ShoppingBag,
  RefreshCw,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/utils';

interface DailyReport {
  summary: string;
  date: string;
  stats: {
    inStockPets: number;
    reservedPets: number;
    soldPets: number;
    todayOrders: number;
    weekOrders: number;
    todoTasks: number;
    todayCompletedTasks: number;
    highPriorityTasks: number;
    highRiskCustomers: number;
    sickPets: number;
    failedSyncPets: number;
    employees: number;
  };
  risks: { type: string; title: string; description: string; priority: string; action: string }[];
  opportunities: { type: string; title: string; description: string; action: string }[];
}

export default function BossDashboard() {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/reports/daily-report');
      setReport(res.data);
    } catch (error) {
      console.error('获取日报失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI 店长台</h1>
          <p className="text-gray-500 mt-1">{report.date} · 今日经营概览</p>
        </div>
        <button
          onClick={fetchReport}
          className="btn btn-secondary gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          刷新日报
        </button>
      </div>

      {/* AI Summary Card */}
      <div className="card p-6 bg-gradient-to-r from-primary-500 to-orange-500 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">今日 AI 摘要</h3>
            <p className="text-white/90 whitespace-pre-line leading-relaxed">
              {report.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Cat className="w-5 h-5" />}
          label="在售宠物"
          value={report.stats.inStockPets}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={<ShoppingBag className="w-5 h-5" />}
          label="今日出库"
          value={report.stats.todayOrders}
          sub={`近7天 ${report.stats.weekOrders} 单`}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="待处理任务"
          value={report.stats.todoTasks}
          sub={`高优 ${report.stats.highPriorityTasks} 个`}
          color="bg-yellow-50 text-yellow-600"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="今日完成"
          value={report.stats.todayCompletedTasks}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Two Column */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Risks */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">风险提醒</h3>
            </div>
            {report.risks.length > 0 && (
              <span className="badge bg-red-100 text-red-700">
                {report.risks.length} 项
              </span>
            )}
          </div>

          {report.risks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
              <p>太棒了！今日无风险事项</p>
            </div>
          ) : (
            <div className="space-y-3">
              {report.risks.map((risk, index) => (
                <button
                  key={index}
                  onClick={() => handleRiskAction(risk.type)}
                  className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50/50 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`badge ${
                            risk.priority === 'HIGH'
                              ? 'bg-red-100 text-red-700'
                              : risk.priority === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {risk.priority === 'HIGH' ? '高' : risk.priority === 'MEDIUM' ? '中' : '低'}
                        </span>
                        <h4 className="font-medium text-gray-900">{risk.title}</h4>
                      </div>
                      <p className="text-sm text-gray-500">{risk.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Opportunities */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">今日机会</h3>
            </div>
          </div>

          {report.opportunities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>暂无推荐机会</p>
            </div>
          ) : (
            <div className="space-y-3">
              {report.opportunities.map((opp, index) => (
                <button
                  key={index}
                  onClick={() => handleOppAction(opp.type)}
                  className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{opp.title}</h4>
                      <p className="text-sm text-gray-500">{opp.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">经营数据</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          <QuickStat label="总宠物数" value={report.stats.inStockPets + report.stats.reservedPets + report.stats.soldPets} />
          <QuickStat label="预定中" value={report.stats.reservedPets} />
          <QuickStat label="已售出" value={report.stats.soldPets} />
          <QuickStat label="高风险客户" value={report.stats.highRiskCustomers} />
          <QuickStat label="健康异常" value={report.stats.sickPets} />
          <QuickStat label="员工数" value={report.stats.employees} />
        </div>
      </div>
    </div>
  );

  function handleRiskAction(type: string) {
    switch (type) {
      case 'HIGH_RISK_CUSTOMERS':
        navigate('/boss/customers?risk=HIGH');
        break;
      case 'SICK_PETS':
        navigate('/keeper/pets');
        break;
      case 'HIGH_PRIORITY_TASKS':
        navigate('/boss/users');
        break;
      case 'FAILED_SYNC':
        navigate('/boss/feishu');
        break;
      default:
        break;
    }
  }

  function handleOppAction(type: string) {
    switch (type) {
      case 'INVENTORY_OPPORTUNITY':
      case 'RESERVED_PETS':
        navigate('/boss/pets');
        break;
      default:
        break;
    }
  }
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="card p-4">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
