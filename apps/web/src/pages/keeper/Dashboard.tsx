import { useState, useEffect } from 'react';
import { Heart, Activity, AlertTriangle, CheckCircle, Stethoscope } from 'lucide-react';
import api from '@/lib/api';
import { getHealthStatusText, getHealthStatusColor } from '@/utils';

export default function KeeperDashboard() {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/pet-logs/health/pets');
      setPets(res.data || []);
    } catch (error) {
      console.error('获取宠物列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const sickPets = pets.filter((p) => p.healthStatus === 'SICK' || p.healthStatus === 'OBSERVATION');
  const healthyPets = pets.filter((p) => p.healthStatus === 'HEALTHY');

  return (
    <div className="space-y-6">
      <div className="card p-6 bg-gradient-to-r from-green-400 to-teal-500 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">今日护理任务</h1>
            <p className="text-white/80">
              共 {pets.length} 只宠物，{sickPets.length} 只需要重点关注
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{healthyPets.length}</div>
              <div className="text-sm text-gray-500">健康</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {pets.filter((p) => p.healthStatus === 'OBSERVATION').length}
              </div>
              <div className="text-sm text-gray-500">观察中</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {pets.filter((p) => p.healthStatus === 'SICK').length}
              </div>
              <div className="text-sm text-gray-500">生病</div>
            </div>
          </div>
        </div>
      </div>

      {sickPets.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">需要重点关注</h3>
          </div>
          <div className="space-y-3">
            {sickPets.map((pet) => (
              <div key={pet.id} className="flex items-center gap-4 p-3 bg-red-50 rounded-lg">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {pet.photos?.[0]?.url ? (
                    <img src={pet.photos[0].url} alt={pet.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">暂无</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{pet.name || pet.breed}</h4>
                    <span className={`badge ${getHealthStatusColor(pet.healthStatus)}`}>
                      {getHealthStatusText(pet.healthStatus)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{pet.publicId} · {pet.breed}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">今日护理清单</h3>
        <div className="space-y-2">
          {['早晚喂食', '清洁笼舍', '观察精神状态', '记录饮食排便', '检查健康状况'].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
              <Heart className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
