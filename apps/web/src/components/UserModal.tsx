import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface UserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserModal({ onClose, onSuccess }: UserModalProps) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'SALES',
    storeId: user?.storeId || '',
    workWechatId: '',
    password: '123456',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/users', formData);
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
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary-500" />
            <h2 className="text-xl font-bold text-gray-900">添加员工</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">姓名 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">手机号 *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">角色</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input"
              >
                <option value="STORE_MANAGER">店长</option>
                <option value="SALES">销售</option>
                <option value="KEEPER">饲养员</option>
              </select>
            </div>
            <div>
              <label className="label">初始密码</label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">工作微信</label>
            <input
              type="text"
              value={formData.workWechatId}
              onChange={(e) => setFormData({ ...formData, workWechatId: e.target.value })}
              placeholder="微信号"
              className="input"
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              取消
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? '添加中...' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
