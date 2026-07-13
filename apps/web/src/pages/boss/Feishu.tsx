import { useState, useEffect } from 'react';
import { Link2, RefreshCw, CheckCircle, AlertCircle, Clock, Database, Settings } from 'lucide-react';
import api from '@/lib/api';

export default function BossFeishu() {
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statusRes: any = await api.get('/feishu/sync/status');
      setSyncStatus(statusRes.data);
      setConnected(statusRes.data?.connected || false);

      const logsRes: any = await api.get('/feishu/sync/logs', { params: { pageSize: 20 } });
      setLogs(logsRes.data?.items || []);
    } catch (error) {
      console.error('获取飞书同步状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post('/feishu/sync/trigger');
      setTimeout(fetchData, 2000);
    } catch (error) {
      console.error('触发同步失败:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleConnect = () => {
    alert('飞书OAuth授权功能需要配置飞书应用凭证后才能使用。\n\n请在后台配置：\n- FEISHU_APP_ID\n- FEISHU_APP_SECRET\n- FEISHU_REDIRECT_URI');
  };

  const modules = [
    { key: 'pets', name: '宠物库存', count: syncStatus?.petCount || 0, synced: syncStatus?.petSynced || 0 },
    { key: 'customers', name: '客户档案', count: syncStatus?.customerCount || 0, synced: syncStatus?.customerSynced || 0 },
    { key: 'orders', name: '销售订单', count: syncStatus?.orderCount || 0, synced: syncStatus?.orderSynced || 0 },
    { key: 'tasks', name: '任务记录', count: syncStatus?.taskCount || 0, synced: syncStatus?.taskSynced || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">飞书多维表格</h1>
        {connected && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn btn-primary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? '同步中...' : '立即同步'}
          </button>
        )}
      </div>

      {/* Connection Status */}
      <div className={`card p-6 ${connected ? 'bg-green-50 border-green-200' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              connected ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {connected ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <Link2 className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {connected ? '飞书已连接' : '飞书未连接'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {connected
                  ? `最后同步：${syncStatus?.lastSyncTime ? new Date(syncStatus.lastSyncTime).toLocaleString() : '暂无'}`
                  : '授权后可自动同步宠物、客户、订单数据到飞书多维表格'}
              </p>
            </div>
          </div>
          {!connected && (
            <button onClick={handleConnect} className="btn btn-primary">
              <Link2 className="w-4 h-4 mr-2" />
              授权连接
            </button>
          )}
        </div>
      </div>

      {/* Sync Modules */}
      {connected && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {modules.map((mod) => (
            <div key={mod.key} className="card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div className="font-medium text-gray-900">{mod.name}</div>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-gray-900">{mod.synced}</span>
                <span className="text-sm text-gray-500 mb-1">/ {mod.count} 已同步</span>
              </div>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${mod.count ? (mod.synced / mod.count) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sync Logs */}
      {connected && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">同步日志</h3>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>暂无同步记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    log.status === 'SUCCESS' ? 'bg-green-100' : log.status === 'PARTIAL' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    {log.status === 'SUCCESS' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : log.status === 'PARTIAL' ? (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">
                      {log.module === 'FULL' ? '全量同步' : getModuleName(log.module)}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {log.status === 'SUCCESS'
                        ? `成功同步 ${log.recordsSynced} 条记录`
                        : log.status === 'PARTIAL'
                        ? `部分同步 ${log.recordsSynced}/${log.recordsTotal}，${log.errorCount || 0} 个错误`
                        : log.errorMessage || '同步失败'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 flex-shrink-0">
                    {formatTime(log.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">同步设置</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">自动同步</div>
              <div className="text-sm text-gray-500">每小时自动同步一次数据</div>
            </div>
            <div className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${
              syncStatus?.autoSync ? 'bg-green-500' : 'bg-gray-300'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                syncStatus?.autoSync ? 'translate-x-5' : ''
              }`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getModuleName(module: string): string {
  const map: Record<string, string> = {
    PETS: '宠物库存',
    CUSTOMERS: '客户档案',
    ORDERS: '销售订单',
    TASKS: '任务记录',
    CARE_LOGS: '护理记录',
  };
  return map[module] || module;
}

function formatTime(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  return d.toLocaleDateString('zh-CN');
}
