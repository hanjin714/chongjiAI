import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Stethoscope } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import HealthLogModal from '@/components/HealthLogModal';
import { getHealthStatusText, getHealthStatusColor, formatDateTime } from '@/utils';

export default function KeeperPetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const { data: pet, refetch, isLoading } = useQuery({
    queryKey: ['pet', id],
    queryFn: async () => {
      const res: any = await api.get(`/pets/${id}`);
      return res.data;
    },
  });

  if (isLoading || !pet) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">加载中...</div></div>;
  }

  const photoUrl = pet.photos?.[0]?.url;

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
            <div className="aspect-square bg-gray-100">
              {photoUrl ? (
                <img src={photoUrl} alt={pet.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">暂无图片</div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge ${getHealthStatusColor(pet.healthStatus)}`}>
                  {getHealthStatusText(pet.healthStatus)}
                </span>
              </div>
              <div className="text-gray-600">{pet.breed}</div>
            </div>
          </div>

          <div className="card p-4">
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加护理记录
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">护理日志</h3>
            {pet.logs?.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Stethoscope className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>暂无护理记录</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pet.logs?.map((log: any) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <div className="w-px flex-1 bg-gray-200" />
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{log.type}</span>
                        <span className="text-xs text-gray-400">{formatDateTime(log.occurredAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{log.content}</p>
                      <p className="text-xs text-gray-400 mt-1">操作人：{log.operatorName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <HealthLogModal
          petId={pet.id}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
