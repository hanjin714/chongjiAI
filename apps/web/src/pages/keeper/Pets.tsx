import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, Stethoscope } from 'lucide-react';
import api from '@/lib/api';
import { getHealthStatusText, getHealthStatusColor } from '@/utils';

export default function KeeperPets() {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPets();
  }, [healthFilter]);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (healthFilter) params.healthStatus = healthFilter;

      const res: any = await api.get('/pet-logs/health/pets', { params });
      setPets(res.data || []);
    } catch (error) {
      console.error('获取宠物列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = pets.filter(
    (p) => !search || p.name?.includes(search) || p.breed?.includes(search) || p.publicId?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">宠物健康</h1>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索宠物..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="input w-32"
          >
            <option value="">全部状态</option>
            <option value="HEALTHY">健康</option>
            <option value="OBSERVATION">观察中</option>
            <option value="SICK">生病</option>
            <option value="RECOVERING">康复中</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((pet) => (
            <div
              key={pet.id}
              onClick={() => navigate(`/keeper/pets/${pet.id}`)}
              className="card overflow-hidden cursor-pointer hover:shadow-card-hover transition-shadow group"
            >
              <div className="aspect-square bg-gray-100 relative">
                {pet.photos?.[0]?.url ? (
                  <img
                    src={pet.photos[0].url}
                    alt={pet.name || pet.breed}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">暂无图片</div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`badge ${getHealthStatusColor(pet.healthStatus)}`}>
                    {getHealthStatusText(pet.healthStatus)}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <div className="text-xs text-gray-500 mb-1">{pet.publicId}</div>
                <h3 className="font-medium text-gray-900 truncate">{pet.name || pet.breed}</h3>
                <p className="text-sm text-gray-500 truncate">{pet.breed}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
