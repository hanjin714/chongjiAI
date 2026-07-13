import { useState, useEffect } from 'react';
import { Building2, Plus, Store } from 'lucide-react';
import api from '@/lib/api';

export default function BossStores() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/stores');
      setStores(res.data || []);
    } catch (error) {
      console.error('获取门店列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">门店管理</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary gap-2">
          <Plus className="w-4 h-4" />
          添加门店
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <div key={store.id} className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{store.name}</h3>
                  <p className="text-sm text-gray-500">{store.city || '-'}</p>
                  <p className="text-sm text-gray-400 mt-1">{store.address || '暂无地址'}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  员工 {store._count?.users || 0} 人
                </span>
                <span className="text-gray-500">
                  宠物 {store._count?.pets || 0} 只
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <StoreModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchStores();
          }}
        />
      )}
    </div>
  );
}

function StoreModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({ name: '', city: '', address: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/stores', formData);
      onSuccess();
    } catch (err: any) {
      setError(err?.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">添加门店</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">门店名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">城市</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">联系电话</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">地址</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input"
            />
          </div>
          {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">取消</button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? '创建中...' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
