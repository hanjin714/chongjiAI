import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Calendar, Phone, MapPin, Clock, ChevronRight, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/utils';

export default function PetProfile() {
  const { petId } = useParams<{ petId: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [petId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res: any = await api.get(`/public/pets/${petId}/profile`);
      setProfile(res.data);
    } catch (error) {
      console.error('获取宠物档案失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  const { pet, customer, store, timeline, nextReminders } = profile;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-400 to-orange-500 text-white p-6 pb-20">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium">宠迹 AI · 成长档案</span>
        </div>
      </div>

      {/* Pet Card */}
      <div className="px-4 -mt-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="aspect-[4/3] bg-gray-100 relative">
            {pet.photoUrl ? (
              <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">暂无照片</div>
            )}
            <div className="absolute bottom-4 left-4">
              <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-gray-800">{pet.breed}</span>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{pet.name || pet.publicId}</h1>
              <span className="text-primary-500 font-bold text-lg">
                {pet.gender === 'MALE' ? '♂' : '♀'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {pet.birthday ? calculateAge(pet.birthday) : '-'}
                </div>
                <div className="text-xs text-gray-500">年龄</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{pet.color || '-'}</div>
                <div className="text-xs text-gray-500">花色</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{pet.vaccineStatus || '-'}</div>
                <div className="text-xs text-gray-500">疫苗</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Owner & Store */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl shadow-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pet-pink to-pet-orange rounded-full flex items-center justify-center text-white font-medium">
                {customer?.name?.charAt(0) || '?'}
              </div>
              <div>
                <div className="font-medium text-gray-900">{customer?.name || '宠物主人'}</div>
                <div className="text-sm text-gray-500">铲屎官</div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{store?.name || '门店'}</span>
            </div>
            {store?.phone && (
              <div className="flex items-center gap-2 text-gray-600 mt-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{store.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reminders */}
      {nextReminders?.length > 0 && (
        <div className="px-4 mt-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">下次提醒</h2>
          <div className="space-y-2">
            {nextReminders.map((reminder: any, index: number) => (
              <div key={index} className="bg-white rounded-xl shadow-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{reminder.title}</div>
                  <div className="text-sm text-gray-500">{formatDate(reminder.date)}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-pet-pink" />
          成长记录
        </h2>
        <div className="bg-white rounded-2xl shadow-card p-5">
          {timeline?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无成长记录</div>
          ) : (
            <div className="space-y-4">
              {timeline.map((item: any, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-primary-500 rounded-full" />
                    {index < timeline.length - 1 && (
                      <div className="w-px flex-1 bg-gray-200 mt-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{item.title}</span>
                      <span className="text-xs text-gray-400">{formatDate(item.date)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-lg mx-auto flex gap-3">
          <button className="flex-1 btn btn-secondary">
            <Phone className="w-4 h-4 mr-2" />
            联系门店
          </button>
          <button className="flex-1 btn btn-primary">
            <Calendar className="w-4 h-4 mr-2" />
            预约服务
          </button>
        </div>
      </div>
    </div>
  );
}

function calculateAge(birthday: string): string {
  const birth = new Date(birthday);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  
  if (months < 1) {
    const days = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    return `${days}天`;
  } else if (months < 12) {
    return `${months}个月`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years}岁${remainingMonths}个月` : `${years}岁`;
  }
}
