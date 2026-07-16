import { useState, useEffect } from 'react';
import { Users, AlertTriangle, TrendingUp, Search, TrendingDown } from 'lucide-react';
import api from '@/lib/api';

export default function BossCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setSelectedCustomer(null);
    try {
      const res: any = await api.get(`/customers/${id}`);
      setSelectedCustomer(res.data);
    } catch (error) {
      console.error('获取客户详情失败:', error);
    } finally {
      setDetailLoading(false);
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
                <tr key={customer.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openDetail(customer.id)}>
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

      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !detailLoading && setSelectedCustomer(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            {detailLoading ? (
              <div className="text-center py-8 text-gray-500">加载中...</div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-pet-pink to-pet-orange rounded-full flex items-center justify-center text-white font-medium">
                      {selectedCustomer.name?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{selectedCustomer.name}</h2>
                      <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">风险等级：</span>
                    <span className={selectedCustomer.riskLevel === 'HIGH' ? 'text-red-600' : selectedCustomer.riskLevel === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}>
                      {selectedCustomer.riskLevel === 'HIGH' ? '高风险' : selectedCustomer.riskLevel === 'MEDIUM' ? '中风险' : '低风险'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">标签：</span>
                    <span className="text-gray-900">{selectedCustomer.tag || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">累计消费：</span>
                    <span className="text-gray-900 font-medium">¥{selectedCustomer.totalSpent?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">跟进销售：</span>
                    <span className="text-gray-900">{selectedCustomer.assignedSalesName || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">上次联系：</span>
                    <span className="text-gray-900">{selectedCustomer.lastContactAt || '-'}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">关联宠物</h3>
                  {selectedCustomer.pets && selectedCustomer.pets.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCustomer.pets.map((p: any) => (
                        <div key={p.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                          {p.photoUrl && <img src={p.photoUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />}
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{p.name} · {p.breed}</div>
                            <div className="text-xs text-gray-500">{p.species} · {p.gender} · ¥{p.price?.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">暂无关联宠物</p>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">消费记录</h3>
                  {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCustomer.orders.map((o: any) => (
                        <div key={o.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2 text-sm">
                          <div>
                            <div className="text-gray-900">{o.petName || o.packageName}</div>
                            <div className="text-xs text-gray-500">{o.createdAt}</div>
                          </div>
                          <div className="text-gray-900 font-medium">¥{o.totalAmount?.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">暂无消费记录</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">备注</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{selectedCustomer.remark || '暂无备注'}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
