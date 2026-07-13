import { useState, useEffect } from 'react';
import { Users, AlertTriangle, TrendingUp, Search, TrendingDown } from 'lucide-react';
import api from '@/lib/api';

export default function BossCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [riskFilter]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params: any = { pageSize: 50 };
      if (riskFilter) params.riskLevel = riskFilter;

      const res: any = await api.get('/customers', { params });
      setCustomers(res.data.items || []);
    } catch (error) {
      console.error('获取客户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(
    (c) => !search || c.name.includes(search) || c.phone.includes(search)
  );

  const highRisk = customers.filter((c) => c.riskLevel === 'HIGH').length;
  const mediumRisk = customers.filter((c) => c.riskLevel === 'MEDIUM').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">客户管理</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
              <div className="text-sm text-gray-500">总客户数</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{highRisk}</div>
              <div className="text-sm text-gray-500">高风险客户</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{mediumRisk}</div>
              <div className="text-sm text-gray-500">中风险客户</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索客户..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="input w-36"
          >
            <option value="">全部风险等级</option>
            <option value="HIGH">高风险</option>
            <option value="MEDIUM">中风险</option>
            <option value="LOW">低风险</option>
            <option value="NONE">无风险</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">客户</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">手机号</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">宠物数</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">来源</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">风险等级</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">跟进销售</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-pet-pink to-pet-orange rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {customer.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{customer.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{customer.phone}</td>
                  <td className="py-3 px-4 text-gray-600">{customer.customerPets?.length || 0} 只</td>
                  <td className="py-3 px-4 text-gray-600">{customer.source || '-'}</td>
                  <td className="py-3 px-4">
                    {customer.riskLevel && customer.riskLevel !== 'NONE' ? (
                      <span className={`badge ${
                        customer.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                        customer.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {customer.riskLevel === 'HIGH' ? '高风险' : customer.riskLevel === 'MEDIUM' ? '中风险' : '低风险'}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{customer.assignedSalesName || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
