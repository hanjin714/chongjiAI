import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, User, Lock, Eye, EyeOff, Store, UserCog, Cat } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

type TabType = 'login' | 'register';

const demoAccounts = [
  { phone: '13800000000', password: '123456', role: '店主', icon: Store, color: 'from-primary-400 to-primary-600' },
  { phone: '13800000001', password: '123456', role: '销售', icon: UserCog, color: 'from-pet-blue to-pet-purple' },
  { phone: '13800000002', password: '123456', role: '饲养员', icon: Cat, color: 'from-green-400 to-teal-500' },
];

export default function Login() {
  const [tab, setTab] = useState<TabType>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res: any = await api.post('/auth/login', { phone, password });
      login(res.data.token, res.data.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || '登录失败，请检查手机号和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoPhone: string, demoPassword: string) => {
    setPhone(demoPhone);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    try {
      const res: any = await api.post('/auth/login', { phone: demoPhone, password: demoPassword });
      login(res.data.token, res.data.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left - Brand */}
          <div className="hidden md:block">
            <div className="mb-8 flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">宠迹 AI</h1>
                <p className="text-gray-500">宠物店的 AI 店长</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              让宠物店每天知道
              <br />
              <span className="text-primary-500">该跟谁、说什么、卖什么</span>
            </h2>

            <div className="space-y-4 mt-8">
              <Feature icon="✅" title="不漏客户" desc="成交后每一次关键回访都有 AI 提醒" />
              <Feature icon="📦" title="不丢资产" desc="宠物、客户、合同、护理记录都沉淀在门店" />
              <Feature icon="📝" title="不愁内容" desc="基于真实库存，一键生成朋友圈和小红书" />
            </div>
          </div>

          {/* Right - Form */}
          <div className="card p-8">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center justify-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">宠迹 AI</h1>
            </div>

            {/* Tabs */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setTab('login')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  tab === 'login'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                登录
              </button>
              <button
                onClick={() => setTab('register')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  tab === 'register'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                新店主入驻
              </button>
            </div>

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label">手机号</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="请输入手机号"
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">密码</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="请输入密码"
                      className="input pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full py-3"
                >
                  {loading ? '登录中...' : '登 录'}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">演示账号</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('13800000000', '123456')}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  一键体验全部功能（店主视角）
                </button>
                <p className="text-xs text-gray-400 text-center mt-2 mb-3">点击立即进入，无需输入账号密码</p>

                <div className="grid grid-cols-3 gap-2">
                  {demoAccounts.map((demo) => {
                    const Icon = demo.icon;
                    return (
                      <button
                        key={demo.phone}
                        type="button"
                        onClick={() => handleDemoLogin(demo.phone, demo.password)}
                        disabled={loading}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${demo.color} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 group-hover:text-primary-600">
                          {demo.role}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </form>
            ) : (
              <RegisterForm />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </div>
  );
}

function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    tenantName: '',
    storeName: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res: any = await api.post('/auth/register-boss', formData);
      login(res.data.token, res.data.user);
      setSuccess(true);
      setTimeout(() => navigate('/boss/dashboard'), 1000);
    } catch (err: any) {
      setError(err?.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">注册成功！</h3>
        <p className="text-gray-500">正在跳转到管理后台...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">姓名</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="您的姓名"
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">手机号</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="手机号"
            className="input"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">品牌名称</label>
          <input
            type="text"
            value={formData.tenantName}
            onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
            placeholder="如：XX宠物"
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">门店名称</label>
          <input
            type="text"
            value={formData.storeName}
            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
            placeholder="如：静安店"
            className="input"
            required
          />
        </div>
      </div>

      <div>
        <label className="label">设置密码</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="至少6位"
          className="input"
          minLength={6}
          required
        />
      </div>

      {error && (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full py-3"
      >
        {loading ? '注册中...' : '立即入驻'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        注册即表示同意《服务协议》和《隐私政策》
      </p>
    </form>
  );
}
