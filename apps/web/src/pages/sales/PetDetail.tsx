import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, CheckCircle, AlertTriangle, Phone, MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatPrice, getPetStatusText, getPetStatusColor, getHealthStatusText, getHealthStatusColor } from '@/utils';

export default function SalesPetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [salesScript, setSalesScript] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: pet, isLoading } = useQuery({
    queryKey: ['pet', id],
    queryFn: async () => {
      const res: any = await api.get(`/pets/${id}`);
      return res.data;
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
