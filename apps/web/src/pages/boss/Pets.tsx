import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, PlusCircle } from 'lucide-react';
import api from '@/lib/api';
import { getPetStatusText, getPetStatusColor, formatPrice } from '@/utils';
import PetModal from '@/components/PetModal';

interface Pet {
  id: string;
  publicId: string;
  name: string | null;
  species: string;
  breed: string;
  gender: string;
  status: string;
  healthStatus: string;
  salePrice: number | null;
  photoUrl: string;
  store: { name: string };
}

export default function BossPets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchPets = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (speciesFilter) params.species = speciesFilter;
      if (search) params.breed = search;

      const res: any = await api.get('/pets', { params });
      setPets(res.data.items || []);
    } catch (error) {
      console.error('获取宠物列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [statusFilter, speciesFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">宠物库存</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary gap-2">
          <Plus className="w-4 h-4" />
          新建宠物
        </button>
      </div>

      {/* Filters */}
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-32"
          >
            <option value="">全部状态</option>
            <option value="TRANSIT">在途</option>
            <option value="IN_STOCK">在售</option>
            <option value="RESERVED">预定</option>
            <option value="SOLD">已售</option>
          </select>
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            className="input w-28"
          >
            <option value="">全部种类</option>
            <option value="CAT">猫</option>
            <option value="DOG">狗</option>
            <option value="OTHER">其他</option>
          </select>
          <button onClick={fetchPets} className="btn btn-secondary gap-2">
            <Filter className="w-4 h-4" />
            筛选
          </button>
        </div>
      </div>

      {/* Pet Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : pets.length === 0 ? (
        <div className="card p-12 text-center">
          <PlusCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无宠物</h3>
          <p className="text-gray-500 mb-4">点击上方按钮添加第一只宠物</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            新建宠物
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {pets.map((pet) => (
            <div
              key={pet.id}
              onClick={() => navigate(`/boss/pets/${pet.id}`)}
              className="card overflow-hidden cursor-pointer hover:shadow-card-hover transition-shadow group"
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
                  <span className="text-primary-500 font-semibold">
                    {formatPrice(pet.salePrice ?? undefined)}
                  </span>
                  <span className="text-xs text-gray-400">{pet.store?.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <PetModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchPets();
          }}
        />
      )}
    </div>
  );
}
