import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Download, Copy, Check, CheckCircle, Sparkles, TrendingUp, Trophy } from 'lucide-react';
import api from '@/lib/api';
import { copyToClipboard } from '@/utils';

interface Poster {
  id: string;
  petId: string;
  petName: string;
  breed: string;
  color: string;
  gender: string;
  salePrice: number;
  photoUrl: string;
  caption: string;
  hashtags: string[];
  storeName: string;
  generatedAt: string;
  published: boolean;
}

// 全店今日发布统计（mock 数据）
const storeStats = {
  todayPublished: 5,
  target: 9,
  ranking: [
    { name: '李小花', count: 3, avatar: '李' },
    { name: '陈销售', count: 2, avatar: '陈' },
    { name: '王销售', count: 0, avatar: '王' },
  ],
};

const rankingColors = ['bg-yellow-100 text-yellow-700', 'bg-gray-100 text-gray-600', 'bg-orange-100 text-orange-700'];

export default function BossPosters() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['posters', 'daily'],
    queryFn: () => api.get('/posters/daily'),
  });

  const posters: Poster[] = (data as any)?.data?.items ?? [];
  const posterDate: string = (data as any)?.data?.date ?? new Date().toISOString().slice(0, 10);
  const publishedCount = posters.filter(p => p.published).length;

  const publishMutation = useMutation({
    mutationFn: (id: string) => api.post(`/posters/${id}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posters', 'daily'] });
      showToast('已标记为发布成功！');
    },
  });

  const handleRefresh = async () => {
    await refetch();
    showToast('海报已重新生成！');
  };

  const handleCopy = async (poster: Poster) => {
    const fullText = `${poster.caption}\n${poster.hashtags.join(' ')}`;
    try {
      await copyToClipboard(fullText);
      setCopiedId(poster.id);
      setTimeout(() => setCopiedId(null), 2000);
      showToast('文案已复制到剪贴板！');
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const handleDownload = (poster: Poster) => {
    showToast(`海报「${poster.petName}」开始下载（演示版）`);
  };

  const storeProgress = storeStats.target
    ? Math.min(100, Math.round((storeStats.todayPublished / storeStats.target) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">每日朋友圈海报</h1>
          <p className="text-sm text-gray-500 mt-1">{posterDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="card px-4 py-2 flex items-center gap-2">
            <span className="text-sm text-gray-500">今日已发</span>
            <span className="text-lg font-bold text-primary-600">{publishedCount}</span>
            <span className="text-sm text-gray-400">/ {posters.length || 3}</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="btn btn-primary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? '生成中...' : '重新生成'}
          </button>
        </div>
      </div>

      {/* 全店统计 + 销售排行 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 全店今日发布统计 */}
        <div className="card p-5 lg:col-span-2 bg-gradient-to-br from-primary-50 to-pet-orange/10 border-primary-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">全店今日发布统计</h3>
              </div>
              <p className="text-sm text-gray-500">3 位销售 · 每人 3 张目标</p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-primary-600">{storeStats.todayPublished}</span>
                <span className="text-lg text-gray-400">/ {storeStats.target}</span>
              </div>
              <p className="text-xs text-gray-500">已发 / 目标</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2.5 bg-white/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all"
                style={{ width: `${storeProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">完成度 {storeProgress}%</p>
          </div>
        </div>

        {/* 销售发布排行 */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-pet-orange" />
            <h3 className="font-semibold text-gray-900">销售发布排行</h3>
          </div>
          <div className="space-y-2.5">
            {storeStats.ranking.map((sale, idx) => (
              <div key={sale.name} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${rankingColors[idx]}`}>
                  {idx + 1}
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-pet-blue to-pet-purple rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {sale.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{sale.name}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${sale.count > 0 ? 'text-primary-600' : 'text-gray-400'}`}>
                    {sale.count}
                  </span>
                  <span className="text-xs text-gray-400"> / 3</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 说明卡片 */}
      <div className="card p-4 bg-gradient-to-r from-pet-blue/10 to-pet-purple/10 border-pet-blue/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-pet-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-pet-blue" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI 已为你生成今日精选海报</h3>
            <p className="text-sm text-gray-600 mt-1">
              AI 已根据今日库存为你生成 3 张精选宠物海报，发布到朋友圈获取更多客户咨询。
            </p>
          </div>
        </div>
      </div>

      {/* 海报列表 */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">AI 正在生成海报...</div>
        </div>
      ) : posters.length === 0 ? (
        <div className="card p-12 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无海报</h3>
          <p className="text-gray-500">点击「重新生成」让 AI 为你制作海报</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posters.map((poster) => (
            <div
              key={poster.id}
              className={`card overflow-hidden flex flex-col ${poster.published ? 'opacity-60' : ''}`}
            >
              {/* 海报预览区 */}
              <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                <img
                  src={poster.photoUrl}
                  alt={poster.petName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{poster.petName}</h3>
                      <p className="text-sm opacity-90">
                        {poster.breed} · {poster.color} · {poster.gender}
                      </p>
                    </div>
                    <div className="text-2xl font-bold">
                      ¥{poster.salePrice.toLocaleString('zh-CN')}
                    </div>
                  </div>
                </div>
                {/* 门店水印 */}
                <div className="absolute top-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  {poster.storeName}
                </div>
                {/* 已发布角标 */}
                {poster.published && (
                  <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                    <Check className="w-3 h-3" /> 已发布
                  </div>
                )}
              </div>

              {/* 文案区 */}
              <div className="p-4 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">朋友圈文案</span>
                  <button
                    onClick={() => handleCopy(poster)}
                    className="text-xs text-pet-blue hover:underline flex items-center gap-1"
                  >
                    {copiedId === poster.id ? (
                      <><Check className="w-3 h-3" /> 已复制</>
                    ) : (
                      <><Copy className="w-3 h-3" /> 复制文案</>
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line">{poster.caption}</p>
                <p className="text-sm text-pet-blue mt-2">{poster.hashtags.join(' ')}</p>
              </div>

              {/* 操作按钮 */}
              <div className="px-4 pb-4 flex gap-2">
                <button
                  onClick={() => handleDownload(poster)}
                  className="btn btn-secondary flex-1 text-sm"
                >
                  <Download className="w-4 h-4 mr-1" /> 下载
                </button>
                <button
                  onClick={() => handleCopy(poster)}
                  className="btn btn-secondary flex-1 text-sm"
                >
                  <Copy className="w-4 h-4 mr-1" /> 复制
                </button>
                {!poster.published ? (
                  <button
                    onClick={() => publishMutation.mutate(poster.id)}
                    disabled={publishMutation.isPending}
                    className="btn btn-primary flex-1 text-sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> 已发布
                  </button>
                ) : (
                  <button disabled className="btn flex-1 text-sm bg-gray-100 text-gray-400">
                    <Check className="w-4 h-4 mr-1" /> 已发布
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
