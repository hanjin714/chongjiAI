import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, Check, AlertCircle, Clock, CheckCircle, XCircle, PartyPopper, ClipboardList } from 'lucide-react';
import api from '@/lib/api';
import { getTaskTypeText, getTaskPriorityText, getTaskPriorityColor, formatDate, copyToClipboard } from '@/utils';

export default function SalesTasks() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('TODO');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { data: tasks = [], isLoading: loading } = useQuery({
    queryKey: ['tasks', filter],
    queryFn: async (): Promise<any[]> => {
      const params: any = { pageSize: 50 };
      if (filter !== 'ALL') params.status = filter;
      const res: any = await api.get('/tasks', { params });
      return res.data.items || [];
    },
  });

  const handleComplete = async (taskId: string, result: string) => {
    try {
      await api.post(`/tasks/${taskId}/complete`, { result });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['daily-report'] });
      setToast('任务已完成！');
      setTimeout(() => setToast(null), 2000);
    } catch (error) {
      console.error('完成任务失败:', error);
    }
  };

  const handleCopyScript = async (taskId: string, content: string) => {
    try {
      await copyToClipboard(content);
      setCopiedId(taskId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const resultOptions = [
    { value: 'SENT', label: '已发送，等待回复' },
    { value: 'REPLIED', label: '客户已回复' },
    { value: 'APPOINTED', label: '已预约' },
    { value: 'DEAL_DONE', label: '已成交' },
    { value: 'NOT_NEEDED', label: '暂不需要' },
    { value: 'NEED_MANAGER', label: '需要老板介入' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">任务管理</h1>
      </div>

      <div className="card p-2 inline-flex">
        {[
          { value: 'TODO', label: '待处理' },
          { value: 'DONE', label: '已完成' },
          { value: 'ALL', label: '全部' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === tab.value
                ? 'bg-pet-blue text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : tasks.length === 0 ? (
        filter === 'TODO' ? (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-50 flex items-center justify-center shadow-sm">
              <PartyPopper className="w-11 h-11 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">今日任务已完成 🎉</h3>
            <p className="text-sm text-gray-400 mb-6">太棒了！所有待处理任务都已搞定，休息一下吧</p>
            <button
              onClick={() => setFilter('DONE')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-pet-blue px-4 py-2 rounded-lg bg-pet-blue/10 hover:bg-pet-blue/15 transition-colors"
            >
              <ClipboardList className="w-4 h-4" />
              查看已完成任务
            </button>
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gray-50 flex items-center justify-center shadow-sm">
              <ClipboardList className="w-11 h-11 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">暂无任务</h3>
            <p className="text-sm text-gray-400">这里还没有任何任务记录</p>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${getTaskPriorityColor(task.priority)}`}>
                      {getTaskPriorityText(task.priority)}优先级
                    </span>
                    <span className="badge bg-gray-100 text-gray-700">
                      {getTaskTypeText(task.type)}
                    </span>
                    {task.status === 'DONE' && (
                      <span className="badge bg-green-100 text-green-700">
                        {task.result}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{task.reason}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {formatDate(task.dueDate)}
                  </div>
                  {task.relatedCustomer && (
                    <div className="text-sm text-gray-400 mt-1">
                      {task.relatedCustomer.name}
                    </div>
                  )}
                </div>
              </div>

              {task.suggestedContent && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">建议话术</span>
                    <button
                      onClick={() => handleCopyScript(task.id, task.suggestedContent!)}
                      className="text-xs text-pet-blue hover:underline flex items-center gap-1"
                    >
                      {copiedId === task.id ? (
                        <><Check className="w-3 h-3" /> 已复制</>
                      ) : (
                        <><Copy className="w-3 h-3" /> 复制</>
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-700">{task.suggestedContent}</p>
                </div>
              )}

              {task.status === 'TODO' && (
                <div className="flex flex-wrap gap-2">
                  {resultOptions.slice(0, 4).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleComplete(task.id, opt.value)}
                      className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:border-pet-blue hover:text-pet-blue transition-colors"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
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
