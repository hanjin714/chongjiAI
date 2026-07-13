import { useState, useEffect } from 'react';
import { Plus, Search, UserPlus, Trash2, UserCheck, UserX } from 'lucide-react';
import api from '@/lib/api';
import { getRoleText } from '@/utils';
import UserModal from '@/components/UserModal';

interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
  active: boolean;
  storeName: string;
  workWechatId: string | null;
  lastLoginAt: string | null;
}

export default function BossUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (roleFilter) params.role = roleFilter;

      const res: any = await api.get('/users', { params });
      setUsers(res.data || []);
    } catch (error) {
      console.error('获取员工列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleActive = async (userId: string, active: boolean) => {
    try {
      if (active) {
        await api.post(`/users/${userId}/deactivate`);
      } else {
        await api.post(`/users/${userId}/activate`);
      }
      fetchUsers();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      !search ||
      u.name.includes(search) ||
      u.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">员工管理</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary gap-2">
          <UserPlus className="w-4 h-4" />
          添加员工
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索姓名、手机号..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input w-32"
          >
            <option value="">全部角色</option>
            <option value="STORE_MANAGER">店长</option>
            <option value="SALES">销售</option>
            <option value="KEEPER">饲养员</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">姓名</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">手机号</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">角色</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">门店</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">状态</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">最后登录</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.phone}</td>
                  <td className="px-6 py-4">
                    <span className="badge bg-gray-100 text-gray-700">
                      {getRoleText(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.storeName || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${user.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {user.active ? '在职' : '已停用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('zh-CN') : '未登录'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== 'TENANT_OWNER' && (
                      <button
                        onClick={() => handleToggleActive(user.id, user.active)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        {user.active ? (
                          <UserX className="w-4 h-4 text-gray-500" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-green-500" />
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <UserModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}
