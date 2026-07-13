import { useState } from 'react';
import { X, Heart, Thermometer, Stethoscope } from 'lucide-react';
import api from '@/lib/api';

interface Props {
  petId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function HealthLogModal({ petId, onClose, onSuccess }: Props) {
  const [logType, setLogType] = useState('HEALTH_CHECK');
  const [content, setContent] = useState('');
  const [healthStatus, setHealthStatus] = useState('');
  const [weight, setWeight] = useState('');
  const [temperature, setTemperature] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const logTypes = [
    { value: 'FEEDING', label: '喂食', icon: '🍚' },
    { value: 'HEALTH_CHECK', label: '健康检查', icon: '🩺' },
    { value: 'VACCINATION', label: '疫苗', icon: '💉' },
    { value: 'DEWORMING', label: '驱虫', icon: '🐛' },
    { value: 'GROOMING', label: '美容', icon: '✂️' },
    { value: 'TREATMENT', label: '治疗', icon: '💊' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload: any = {
        logType,
        content,
      };
      if (healthStatus) payload.healthStatus = healthStatus;
      if (weight) payload.weight = parseFloat(weight);
      if (temperature) payload.temperature = parseFloat(temperature);

      await api.post(`/pet-logs/${petId}/care`, payload);
      onSuccess();
    } catch (err: any) {
      setError(err?.message || '提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">添加护理记录</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">记录类型</label>
            <div className="grid grid-cols-3 gap-2">
              {logTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setLogType(type.value)}
                  className={`p-3 rounded-xl text-center border transition-all ${
                    logType === type.value
                      ? 'border-pet-blue bg-blue-50 text-pet-blue'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-xs">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {logType === 'HEALTH_CHECK' && (
            <div>
              <label className="label">健康状态</label>
              <select
                value={healthStatus}
                onChange={(e) => setHealthStatus(e.target.value)}
                className="input"
              >
                <option value="">保持不变</option>
                <option value="HEALTHY">健康</option>
                <option value="OBSERVATION">观察中</option>
                <option value="SICK">生病</option>
                <option value="RECOVERING">康复中</option>
              </select>
            </div>
          )}

          {(logType === 'HEALTH_CHECK' || logType === 'TREATMENT') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">体重 (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="input"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="label">体温 (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="input"
                  placeholder="38.5"
                />
              </div>
            </div>
          )}

          <div>
            <label className="label">记录内容 *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input min-h-[100px]"
              placeholder="请输入护理详情..."
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting || !content}
              className="btn btn-primary flex-1"
            >
              {submitting ? '提交中...' : '提交'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
