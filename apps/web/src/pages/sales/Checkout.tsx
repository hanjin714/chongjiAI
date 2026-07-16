import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, CheckCircle, Camera, Image, X, ExternalLink, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { formatPrice } from '@/utils';

export default function SalesCheckout() {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerWechat: '',
    customerSource: '到店咨询',
    soldPrice: '',
    suppliesPrice: '',
    warrantyDays: '30',
    contractUrl: '',
  });
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res: any = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.success && res.data?.url) {
        setFormData((prev) => ({ ...prev, contractUrl: res.data.url }));
      } else {
        setError('上传失败，请重试');
      }
    } catch (err: any) {
      setError(err?.message || '上传失败，请重试');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    fetchPet();
  }, [petId]);

  const fetchPet = async () => {
    try {
      const res: any = await api.get(`/pets/${petId}`);
      setPet(res.data);
      if (res.data.salePrice) {
        setFormData((prev) => ({ ...prev, soldPrice: String(res.data.salePrice) }));
      }
    } catch (error) {
      console.error('获取宠物信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        soldPrice: parseFloat(formData.soldPrice),
        suppliesPrice: formData.suppliesPrice ? parseFloat(formData.suppliesPrice) : 0,
        warrantyDays: parseInt(String(formData.warrantyDays)),
      };

      await api.post('/sales-orders', payload);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || '出库失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !pet) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">加载中...</div></div>;
  }

  // 预定拦截：若宠物已被其他销售预定，禁止开单
  const reservedByOther = pet.reservedBy && user && pet.reservedBy.salesId !== user.id;
  if (reservedByOther) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="card p-8 text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">无法开单</h2>
          <p className="text-gray-500 mb-6">
            这只宠物已被 <span className="font-semibold text-orange-600">{pet.reservedBy.salesName}</span> 预定，您无法开单
          </p>
          <button
            onClick={() => navigate('/sales/inventory')}
            className="btn btn-primary w-full"
          >
            返回库存
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="card p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">出库成功！</h2>
          <p className="text-gray-500 mb-6">系统已自动生成客户回访任务和成长档案</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/sales/tasks')}
              className="btn btn-primary w-full"
            >
              查看回访任务
            </button>
            <button
              onClick={() => navigate('/public/pet/' + petId + '/profile')}
              className="btn btn-secondary w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              查看宠物公开档案
            </button>
            <button
              onClick={() => navigate('/sales/inventory')}
              className="btn btn-secondary w-full"
            >
              返回库存列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  const photoUrl = pet.photos?.[0]?.url;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">销售出库</h1>
      </div>

      {/* Pet Info Card */}
      <div className="card p-4 mb-6 flex items-center gap-4">
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {photoUrl ? (
            <img src={photoUrl} alt={pet.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">暂无图片</div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{pet.name || pet.breed}</h3>
          <p className="text-sm text-gray-500">{pet.publicId} · {pet.breed}</p>
          <p className="text-lg font-bold text-primary-500 mt-1">{formatPrice(pet.salePrice)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">客户信息</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">客户姓名 *</label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">手机号 *</label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              className="input"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">微信号</label>
            <input
              type="text"
              value={formData.customerWechat}
              onChange={(e) => setFormData({ ...formData, customerWechat: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">来源渠道</label>
            <select
              value={formData.customerSource}
              onChange={(e) => setFormData({ ...formData, customerSource: e.target.value })}
              className="input"
            >
              <option value="到店咨询">到店咨询</option>
              <option value="微信咨询">微信咨询</option>
              <option value="朋友推荐">朋友推荐</option>
              <option value="小红书">小红书</option>
              <option value="抖音">抖音</option>
              <option value="其他">其他</option>
            </select>
          </div>
        </div>

        <hr className="my-4" />

        <h3 className="text-lg font-semibold text-gray-900">交易信息</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">成交价 *</label>
            <input
              type="number"
              value={formData.soldPrice}
              onChange={(e) => setFormData({ ...formData, soldPrice: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">用品金额</label>
            <input
              type="number"
              value={formData.suppliesPrice}
              onChange={(e) => setFormData({ ...formData, suppliesPrice: e.target.value })}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">保修天数</label>
          <input
            type="number"
            value={formData.warrantyDays}
            onChange={(e) => setFormData({ ...formData, warrantyDays: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="label">合同照片</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          {formData.contractUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              <img
                src={formData.contractUrl}
                alt="合同照片"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, contractUrl: '' })}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors"
            >
              <div className="flex items-center justify-center gap-6 mb-3">
                <div className="text-center">
                  <Camera className="w-8 h-8 mx-auto text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">拍照</span>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="text-center">
                  <Image className="w-8 h-8 mx-auto text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">相册选择</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">点击上传合同照片</p>
              {uploading && (
                <p className="text-sm text-primary-500 mt-2">上传中...</p>
              )}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">支持拍照或从相册选择，最大10MB</p>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary flex-1"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary flex-1"
          >
            {submitting ? '提交中...' : '确认出库'}
          </button>
        </div>
      </form>
    </div>
  );
}
