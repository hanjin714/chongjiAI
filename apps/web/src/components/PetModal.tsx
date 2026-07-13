import { useState, useRef } from 'react';
import { X, Camera, Image } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface PetModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function PetModal({ onClose, onSuccess }: PetModalProps) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    publicId: '',
    name: '',
    species: 'CAT',
    breed: '',
    gender: 'MALE',
    color: '',
    salePrice: '',
    purchasePrice: '',
    birthday: '',
    vaccineStatus: '',
    healthStatus: 'HEALTHY',
    source: '',
    photoUrl: '',
    storeId: user?.storeId || '',
  });
  const [loading, setLoading] = useState(false);
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
        setFormData((prev) => ({ ...prev, photoUrl: res.data.url }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: any = {
        ...formData,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
      };

      if (!payload.storeId) {
        delete payload.storeId;
      }

      await api.post('/pets', payload);
      onSuccess();
    } catch (err: any) {
      setError(err?.message || '创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">新建宠物</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">编号 *</label>
              <input
                type="text"
                value={formData.publicId}
                onChange={(e) => setFormData({ ...formData, publicId: e.target.value })}
                placeholder="如：C-2402-001"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">名字</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="宠物昵称"
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">种类</label>
              <select
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                className="input"
              >
                <option value="CAT">猫</option>
                <option value="DOG">狗</option>
                <option value="OTHER">其他</option>
              </select>
            </div>
            <div>
              <label className="label">性别</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="input"
              >
                <option value="MALE">公</option>
                <option value="FEMALE">母</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">品种 *</label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                placeholder="如：英短蓝白"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">花色</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="如：蓝白"
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">售价</label>
              <input
                type="number"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                placeholder="元"
                className="input"
              />
            </div>
            <div>
              <label className="label">出生日期</label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">疫苗状态</label>
              <input
                type="text"
                value={formData.vaccineStatus}
                onChange={(e) => setFormData({ ...formData, vaccineStatus: e.target.value })}
                placeholder="如：3针"
                className="input"
              />
            </div>
            <div>
              <label className="label">健康状态</label>
              <select
                value={formData.healthStatus}
                onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
                className="input"
              >
                <option value="HEALTHY">健康</option>
                <option value="OBSERVATION">观察中</option>
                <option value="SICK">生病</option>
                <option value="RECOVERING">康复中</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">宠物照片</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />

            {formData.photoUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={formData.photoUrl}
                  alt="宠物照片"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, photoUrl: '' })}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors"
              >
                <div className="flex items-center justify-center gap-6 mb-2">
                  <div className="text-center">
                    <Camera className="w-7 h-7 mx-auto text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">拍照</span>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="text-center">
                    <Image className="w-7 h-7 mx-auto text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">相册选择</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">点击上传宠物照片</p>
                {uploading && (
                  <p className="text-sm text-primary-500 mt-1">上传中...</p>
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
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              取消
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? '创建中...' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
