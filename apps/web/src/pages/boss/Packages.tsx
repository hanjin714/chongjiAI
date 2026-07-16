import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, Camera, Image, X, Tag, Package as PackageIcon } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice } from '@/utils';

export default function BossPackages() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    items: '',
    originalPrice: '',
    salePrice: '',
    stock: '',
    expiryDate: '',
    imageUrl: '',
    isPromotional: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPackages();
  }, [keyword]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/packages', {
        params: { keyword: keyword || undefined, pageSize: 100 },
      });
      setPackages(res.data?.items || []);
    } catch (error) {
      console.error('获取套餐列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      items: '',
      originalPrice: '',
      salePrice: '',
      stock: '',
      expiryDate: '',
      imageUrl: '',
      isPromotional: false,
    });
    setError('');
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      items: item.items || '',
      originalPrice: item.originalPrice ? String(item.originalPrice) : '',
      salePrice: item.salePrice ? String(item.salePrice) : '',
      stock: item.stock ? String(item.stock) : '',
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      imageUrl: item.imageUrl || '',
      isPromotional: item.isPromotional || false,
    });
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个套餐吗？')) return;
    try {
      await api.delete(`/packages/${id}`);
      fetchPackages();
      setToast('套餐已删除');
      setTimeout(() => setToast(null), 2000);
    } catch (error) {
      console.error('删除套餐失败:', error);
    }
  };

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
        setFormData((prev) => ({ ...prev, imageUrl: res.data.url }));
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
    setSubmitting(true);

    try {
      const payload: any = {
        ...formData,
        originalPrice: parseFloat(formData.originalPrice) || 0,
        salePrice: parseFloat(formData.salePrice) || 0,
        stock: formData.stock ? parseInt(formData.stock) : 0,
      };

      if (!payload.expiryDate) {
        delete payload.expiryDate;
      }

      if (editingItem) {
        await api.put(`/packages/${editingItem.id}`, payload);
      } else {
        await api.post('/packages', payload);
      }

      setShowModal(false);
      fetchPackages();
      setToast(editingItem ? '套餐已更新' : '套餐已创建');
      setTimeout(() => setToast(null), 2000);
    } catch (err: any) {
      setError(err?.message || '保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const discount = formData.originalPrice && formData.salePrice
    ? ((1 - parseFloat(formData.salePrice) / parseFloat(formData.originalPrice)) * 100).toFixed(0)
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">套餐管理</h1>
          <p className="text-sm text-gray-500 mt-1">拍摄套餐照片，设置价格，一键上架</p>
        </div>
        <button
          onClick={handleAdd}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建套餐
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索套餐名称..."
            className="input pl-10"
          />
        </div>
      </div>

      {/* Package Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : packages.length === 0 ? (
        <div className="card p-12 text-center">
          <PackageIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">还没有套餐，点击右上角新建第一个吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="card overflow-hidden group">
              <div className="relative h-40 bg-gray-100">
                {pkg.imageUrl ? (
                  <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <PackageIcon className="w-10 h-10" />
                  </div>
                )}
                {pkg.isPromotional && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    促销
                  </span>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="w-7 h-7 bg-white/90 hover:bg-red-50 rounded-full flex items-center justify-center shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">{pkg.name}</h3>
                {pkg.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{pkg.description}</p>
                )}
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-xl font-black text-primary-600">
                    {formatPrice(pkg.salePrice)}
                  </span>
                  {pkg.originalPrice > pkg.salePrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(pkg.originalPrice)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                  <span>库存: {pkg.stock} 份</span>
                  {pkg.store?.name && <span className="truncate ml-2">{pkg.store.name}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? '编辑套餐' : '新建套餐'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* 套餐照片 */}
              <div>
                <label className="label">套餐照片</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {formData.imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={formData.imageUrl}
                      alt="套餐照片"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
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
                    <p className="text-sm text-gray-500">点击上传套餐照片</p>
                    {uploading && (
                      <p className="text-sm text-primary-500 mt-1">上传中...</p>
                    )}
                  </div>
                )}
              </div>

              {/* 套餐名称 */}
              <div>
                <label className="label">套餐名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="如：新手猫主子大礼包"
                  className="input"
                  required
                />
              </div>

              {/* 套餐描述 */}
              <div>
                <label className="label">套餐描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="简要描述套餐包含内容"
                  className="input min-h-[60px]"
                  rows={2}
                />
              </div>

              {/* 包含项目 */}
              <div>
                <label className="label">包含项目</label>
                <textarea
                  value={formData.items}
                  onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                  placeholder="每行一项，如：&#10;• 英短蓝猫 1只&#10;• 猫粮 2袋&#10;• 猫砂盆 1个"
                  className="input min-h-[80px]"
                  rows={3}
                />
              </div>

              {/* 价格 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">原价 (元)</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="0.00"
                    className="input"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="label">售价 (元) *</label>
                  <input
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    placeholder="0.00"
                    className="input"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* 折扣提示 */}
              {discount && parseFloat(discount) > 0 && (
                <div className="bg-orange-50 text-orange-600 text-sm p-3 rounded-lg flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>相当于打 <strong>{(10 - parseFloat(discount) / 10).toFixed(1)} 折</strong>（省 {discount}%）</span>
                </div>
              )}

              {/* 库存 + 有效期 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">库存数量</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    className="input"
                    min="0"
                  />
                </div>
                <div>
                  <label className="label">有效期至</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              {/* 促销标记 */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPromotional"
                  checked={formData.isPromotional}
                  onChange={(e) => setFormData({ ...formData, isPromotional: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <label htmlFor="isPromotional" className="text-sm text-gray-700 cursor-pointer">
                  标记为促销套餐（显示促销标签）
                </label>
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary flex-1"
                >
                  {submitting ? '保存中...' : editingItem ? '保存修改' : '创建套餐'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
