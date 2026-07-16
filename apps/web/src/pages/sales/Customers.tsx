import { useState, useEffect } from 'react';
import { Search, Users } from 'lucide-react';
import api from '@/lib/api';

export default function SalesCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [followUpCustomer, setFollowUpCustomer] = useState<any>(null);
  const [followUpForm, setFollowUpForm] = useState({ method: '电话', content: '', nextDate: '' });

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

  const openFollowUp = (customer: any) => {
    setFollowUpCustomer(customer);
    setFollowUpForm({ method: '电话', content: '', nextDate: '' });
  };

  const submitFollowUp = () => {
    setFollowUpCustomer(null);
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
            <div key={customer.id} className="card p-4 hover:shadow-card-hover transition-shadow">
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
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openDetail(customer.id)}
                    className="px-3 py-1.5 text-sm text-pet-orange border border-pet-orange rounded-lg hover:bg-pet-orange hover:text-white transition-colors"
                  >
                    查看详情
                  </button>
                  <button
                    onClick={() => openFollowUp(customer)}
                    className="px-3 py-1.5 text-sm text-white bg-pet-orange rounded-lg hover:opacity-90 transition-opacity"
                  >
                    添加跟进
                  </button>
                </div>
              </div>
            </div>
          ))}
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

                <div>
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
              </>
            )}
          </div>
        </div>
      )}

      {followUpCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setFollowUpCustomer(null)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">添加跟进 — {followUpCustomer.name}</h2>
              <button onClick={() => setFollowUpCustomer(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">跟进方式</label>
                <select
                  value={followUpForm.method}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, method: e.target.value })}
                  className="input"
                >
                  <option value="电话">电话</option>
                  <option value="微信">微信</option>
                  <option value="到店">到店</option>
                  <option value="短信">短信</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">跟进内容</label>
                <textarea
                  value={followUpForm.content}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, content: e.target.value })}
                  placeholder="请输入跟进内容..."
                  rows={4}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">下次跟进时间</label>
                <input
                  type="date"
                  value={followUpForm.nextDate}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, nextDate: e.target.value })}
                  className="input"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setFollowUpCustomer(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
                <button onClick={submitFollowUp} className="px-4 py-2 text-sm text-white bg-pet-orange rounded-lg hover:opacity-90">保存</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
