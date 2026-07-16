import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, CheckCircle, AlertTriangle, Phone, MessageCircle, Bookmark } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { formatPrice, getPetStatusText, getPetStatusColor, getHealthStatusText, getHealthStatusColor } from '@/utils';

interface ReservedBy {
  salesId: string;
  salesName: string;
  customerName: string;
  customerPhone: string;
  reservedAt: string;
}

export default function SalesPetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('info');
  const [salesScript, setSalesScript] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showReserveForm, setShowReserveForm] = useState(false);
  const [reserveForm, setReserveForm] = useState({ customerName: '', customerPhone: '' });
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const { data: pet, isLoading } = useQuery({
    queryKey: ['pet', id],
    queryFn: async () => {
      const res: any = await api.get(`/pets/${id}`);
      return res.data;
    },
  });

  const reserveMutation = useMutation({
    mutationFn: (payload: { customerName: string; customerPhone: string }) =>
      api.post(`/pets/${id}/reserve`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet', id] });
      setShowReserveForm(false);
      setReserveForm({ customerName: '', customerPhone: '' });
      showToast('预定成功');
    },
    onError: () => {
      showToast('预定失败，请重试');
    },
  });

  const cancelReserveMutation = useMutation({
    mutationFn: () => api.delete(`/pets/${id}/reserve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet', id] });
      showToast('已取消预定');
    },
    onError: () => {
      showToast('取消预定失败，请重试');
    },
  });

  if (isLoading || !pet) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">加载中...</div></div>;
  }

  const handleGenerateScript = async () => {
    setGenerating(true);
    try {
      const res: any = await api.post('/ai/chat', {
        message: `帮我生成一只${pet.breed}的销售话术，名字叫${pet.name}，价格${pet.salePrice}元，性别${pet.gender === 'MALE' ? '公' : '母'}`,
      });
      setSalesScript(res.data.answer);
    } catch {
      setSalesScript('生成失败，请稍后再试');
    } finally {
      setGenerating(false);
    }
  };

  const photoUrl = pet.photos?.[0]?.url;
  const canCheckout = pet.status === 'IN_STOCK';
  const reservedBy: ReservedBy | null = pet.reservedBy || null;
  const isReservedByMe = reservedBy && user && reservedBy.salesId === user.id;
  const isReservedByOther = reservedBy && user && reservedBy.salesId !== user.id;

  const handleReserveSubmit = () => {
    if (!reserveForm.customerName.trim() || !reserveForm.customerPhone.trim()) {
      showToast('请填写客户姓名和手机号');
      return;
    }
    reserveMutation.mutate(reserveForm);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pet.name || pet.breed}</h1>
          <p className="text-gray-500">{pet.publicId}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="card overflow-hidden">
            <div className="aspect-square bg-gray-100 relative">
              {photoUrl ? (
                <img src={photoUrl} alt={pet.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">暂无图片</div>
              )}
              <div className="absolute top-3 right-3">
                <span className={`badge ${getPetStatusColor(pet.status)}`}>
                  {getPetStatusText(pet.status)}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge ${getHealthStatusColor(pet.healthStatus)}`}>
                  {getHealthStatusText(pet.healthStatus)}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatPrice(pet.salePrice)}</div>
              {pet.purchasePrice && (
                <div className="text-sm text-gray-500 mt-1">
                  成本价 {formatPrice(pet.purchasePrice)}
                </div>
              )}
            </div>
          </div>

          {canCheckout && (
            <div className="card p-4 space-y-3">
              <button
                onClick={() => navigate(`/sales/checkout/${pet.id}`)}
                className="btn btn-primary w-full"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                开单出库
              </button>

              {/* 预定按钮：三种状态 */}
              {isReservedByOther ? (
                <button
                  disabled
                  className="btn btn-secondary w-full opacity-50 cursor-not-allowed"
                  title={`已被 ${reservedBy!.salesName} 预定`}
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  已被{reservedBy!.salesName}预定
                </button>
              ) : isReservedByMe ? (
                <button
                  onClick={() => cancelReserveMutation.mutate()}
                  disabled={cancelReserveMutation.isPending}
                  className="btn btn-secondary w-full"
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  {cancelReserveMutation.isPending ? '取消中...' : '取消预定'}
                </button>
              ) : (
                <button
                  onClick={() => setShowReserveForm(true)}
                  className="btn btn-secondary w-full"
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  标记为预定
                </button>
              )}

              {/* 预定信息展示 */}
              {reservedBy && (
                <div className="text-xs text-gray-500 bg-orange-50 p-2 rounded-lg">
                  预定客户：{reservedBy.customerName} ({reservedBy.customerPhone})
                </div>
              )}

              <button
                onClick={handleGenerateScript}
                className="btn btn-secondary w-full"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {generating ? '生成中...' : '生成销售话术'}
              </button>

              {salesScript && (
                <div className="card p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600">AI 销售话术</span>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(salesScript);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      {copied ? '已复制' : '复制'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{salesScript}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="card">
            <div className="border-b border-gray-200 px-4">
              <div className="flex gap-6">
                {['info', 'health', 'logs'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                      activeTab === tab
                        ? 'border-pet-blue text-pet-blue'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'info' ? '基本信息' : tab === 'health' ? '健康档案' : '护理日志'}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem label="品种" value={pet.breed} />
                    <InfoItem label="性别" value={pet.gender === 'MALE' ? '公' : '母'} />
                    <InfoItem label="花色" value={pet.color || '-'} />
                    <InfoItem label="生日" value={pet.birthday ? new Date(pet.birthday).toLocaleDateString() : '-'} />
                    <InfoItem label="芯片号" value={pet.microchipId || '-'} />
                    <InfoItem label="来源" value={pet.source || '-'} />
                  </div>
                  {pet.defects && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">缺陷描述</div>
                      <div className="text-gray-900">{JSON.stringify(pet.defects)}</div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'health' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem label="健康状态" value={getHealthStatusText(pet.healthStatus)} />
                    <InfoItem label="疫苗状态" value={pet.vaccineStatus || '-'} />
                    <InfoItem label="上次疫苗" value={pet.lastVaccineDate ? new Date(pet.lastVaccineDate).toLocaleDateString() : '-'} />
                  </div>
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="space-y-3">
                  {pet.logs?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">暂无护理记录</div>
                  ) : (
                    pet.logs?.map((log: any) => (
                      <div key={log.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                          <div className="w-px flex-1 bg-gray-200" />
                        </div>
                        <div className="pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">{log.type}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(log.occurredAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{log.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 预定表单 Modal */}
      {showReserveForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">标记为预定</h3>
              <button
                onClick={() => {
                  setShowReserveForm(false);
                  setReserveForm({ customerName: '', customerPhone: '' });
                }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-500">
              请填写客户联系方式，标记后该宠物仅可由您本人开单出库。
            </p>
            <div>
              <label className="label">客户姓名 *</label>
              <input
                type="text"
                value={reserveForm.customerName}
                onChange={(e) => setReserveForm({ ...reserveForm, customerName: e.target.value })}
                className="input"
                placeholder="请输入客户姓名"
              />
            </div>
            <div>
              <label className="label">客户手机号 *</label>
              <input
                type="tel"
                value={reserveForm.customerPhone}
                onChange={(e) => setReserveForm({ ...reserveForm, customerPhone: e.target.value })}
                className="input"
                placeholder="请输入手机号"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowReserveForm(false);
                  setReserveForm({ customerName: '', customerPhone: '' });
                }}
                className="btn btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={handleReserveSubmit}
                disabled={reserveMutation.isPending}
                className="btn btn-primary flex-1"
              >
                {reserveMutation.isPending ? '提交中...' : '确认预定'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-gray-900 font-medium">{value}</div>
    </div>
  );
}
