import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { getPetStatusText, getPetStatusColor, formatPrice } from '@/utils';

interface ReservedBy {
  salesId: string;
  salesName: string;
  customerName: string;
  customerPhone: string;
  reservedAt: string;
}

export default function SalesInventory() {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchPets();
  }, [speciesFilter]);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const params: any = { status: 'IN_STOCK' };
      if (speciesFilter) params.species = speciesFilter;
      if (search) params.breed = search;

      const res: any = await api.get('/pets', { params });
      setPets(res.data.items || []);
    } catch (error) {
      console.error('获取库存失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">库存与开单</h1>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索品种、编号..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPets()}
              className="input pl-10"
            />
          </div>
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            className="input w-28"
          >
            <option value="">全部</option>
            <option value="CAT">猫</option>
            <option value="DOG">狗</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : pets.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-blue-50 flex items-center justify-center shadow-sm">
            <Package className="w-11 h-11 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">暂无在售宠物</h3>
          <p className="text-sm text-gray-400 mb-6">当前筛选条件下没有可销售的宠物，联系店长补充库存</p>
          <button
            onClick={fetchPets}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-pet-blue px-4 py-2 rounded-lg bg-pet-blue/10 hover:bg-pet-blue/15 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            重新加载
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pets.map((pet) => {
            const reservedBy: ReservedBy | null = pet.reservedBy || null;
            const isReservedByOther = reservedBy && user && reservedBy.salesId !== user.id;
            const isReservedByMe = reservedBy && user && reservedBy.salesId === user.id;
            return (
              <div
                key={pet.id}
                className="card overflow-hidden cursor-pointer hover:shadow-card-hover transition-shadow group"
                onClick={() => navigate(`/sales/inventory/${pet.id}`)}
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {pet.photoUrl ? (
                    <img
                      src={pet.photoUrl}
                      alt={pet.name || pet.breed}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      暂无图片
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className={`badge ${getPetStatusColor(pet.status)}`}>
                      {getPetStatusText(pet.status)}
                    </span>
                  </div>
                  {/* 预定角标 */}
                  {isReservedByOther && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full shadow">
                      已预定
                    </div>
                  )}
                  {isReservedByMe && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full shadow">
                      我预定的
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">{pet.publicId}</span>
                    <span className="text-xs text-gray-400">
                      {pet.gender === 'MALE' ? '♂' : '♀'}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 truncate">
                    {pet.name || pet.breed}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">{pet.breed}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-pet-blue font-semibold">
                      {formatPrice(pet.salePrice)}
                    </span>
                    {isReservedByOther ? (
                      <button
                        disabled
                        title={`已被 ${reservedBy!.salesName} 预定`}
                        className="text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded-md cursor-not-allowed"
                      >
                        开单
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/sales/checkout/${pet.id}`);
                        }}
                        className="text-xs bg-pet-blue/10 text-pet-blue px-2 py-1 rounded-md hover:bg-pet-blue/20"
                      >
                        开单
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
