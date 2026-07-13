import { useState, useEffect } from 'react';
import { Search, Users } from 'lucide-react';
import api from '@/lib/api';

export default function SalesCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/customers', { params: { pageSize: 50 } });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">客户跟进</h1>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索客户姓名、手机号..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无客户</h3>
          <p className="text-gray-500">成交后客户会自动添加到这里</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((customer) => (
            <div key={customer.id} className="card p-4 hover:shadow-card-hover transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pet-pink to-pet-orange rounded-full flex items-center justify-center text-white font-medium">
                  {customer.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    {customer.riskLevel && customer.riskLevel !== 'NONE' && (
                      <span className={`badge ${
                        customer.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                        customer.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {customer.riskLevel === 'HIGH' ? '高风险' : customer.riskLevel === 'MEDIUM' ? '中风险' : '低风险'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{customer.phone}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-400">
                      宠物 {customer.customerPets?.length || 0} 只
                    </span>
                    {customer.source && (
                      <span className="text-xs text-gray-400">来源：{customer.source}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
