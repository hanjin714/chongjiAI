import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Upload, ClipboardCopy, CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import {
  getPetStatusText,
  getPetStatusColor,
  getHealthStatusText,
  getHealthStatusColor,
  formatPrice,
  formatDate,
  formatDateTime,
  copyToClipboard,
} from '@/utils';
import HealthLogModal from '@/components/HealthLogModal';

export default function BossPetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const isSales = location.pathname.startsWith('/sales');

  const fetchPet = async () => {
    setLoading(true);
    try {
      const res: any = await api.get(`/pets/${id}`);
      setPet(res.data);
    } catch (error) {
      console.error('获取宠物详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPet();
  }, [id]);

  const handleConfirmArrival = async () => {
    try {
      await api.post(`/pets/${id}/confirm-arrival`);
      fetchPet();
    } catch (error) {
      console.error('确认到店失败:', error);
    }
  };

  const handleCheckout = () => {
    navigate(`/sales/checkout/${id}`);
  };

  const handleGenerateProfile = async () => {
    const profileUrl = `${window.location.origin}/public/pet/${id}/profile`;
    try {
      await copyToClipboard(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  if (loading || !pet) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  const photoUrl = pet.photos?.[0]?.url;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {pet.name || pet.breed}
          </h1>
          <p className="text-gray-500">{pet.publicId} · {pet.store?.name}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left - Photo & Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="card overflow-hidden">
            <div className="aspect-square bg-gray-100">
              {photoUrl ? (
                <img src={photoUrl} alt={pet.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  暂无图片
                </div>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className={`badge ${getPetStatusColor(pet.status)}`}>
                  {getPetStatusText(pet.status)}
                </span>
                <span className={`badge ${getHealthStatusColor(pet.healthStatus)}`}>
                  {getHealthStatusText(pet.healthStatus)}
                </span>
              </div>
              <div className="text-2xl font-bold text-primary-500">
                {formatPrice(pet.salePrice)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card p-4 space-y-2">
            {pet.status === 'TRANSIT' && (
              <button onClick={handleConfirmArrival} className="btn btn-primary w-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                确认到店
              </button>
            )}
            {(pet.status === 'IN_STOCK' || pet.status === 'RESERVED') && isSales && (
              <button onClick={handleCheckout} className="btn btn-primary w-full">
                <Upload className="w-4 h-4 mr-2" />
                销售出库
              </button>
            )}
            {pet.status === 'SOLD' && (
              <button onClick={handleGenerateProfile} className="btn btn-secondary w-full">
                {copied ? (
                  <><CheckCircle className="w-4 h-4 mr-2" /> 已复制链接</>
                ) : (
                  <><ClipboardCopy className="w-4 h-4 mr-2" /> 复制成长档案链接</>
                )}
              </button>
            )}
            <button onClick={() => setShowHealthModal(true)} className="btn btn-secondary w-full">
              <AlertCircle className="w-4 h-4 mr-2" />
              添加护理记录
            </button>
          </div>
        </div>

        {/* Right - Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoItem label="品种" value={pet.breed} />
              <InfoItem label="性别" value={pet.gender === 'MALE' ? '公' : '母'} />
              <InfoItem label="花色" value={pet.color || '-'} />
              <InfoItem label="出生日期" value={formatDate(pet.birthday)} />
              <InfoItem label="疫苗状态" value={pet.vaccineStatus || '-'} />
              <InfoItem label="来源" value={pet.source || '-'} />
              {pet.purchasePrice && (
                <InfoItem label="采购成本" value={formatPrice(pet.purchasePrice)} />
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">成长日志</h3>
            {pet.logs?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                暂无日志记录
              </div>
            ) : (
              <div className="space-y-4">
                {pet.logs?.map((log: any) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-primary-500 rounded-full" />
                      <div className="w-px flex-1 bg-gray-200" />
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {log.type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDateTime(log.occurredAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{log.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        操作人：{log.operatorName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showHealthModal && (
        <HealthLogModal
          petId={pet.id}
          onClose={() => setShowHealthModal(false)}
          onSuccess={() => {
            setShowHealthModal(false);
            fetchPet();
          }}
        />
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-gray-900">{value}</div>
    </div>
  );
}
