import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Mic, CheckCircle, ShoppingCart, Bookmark } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice } from '@/utils';

interface SoldPet {
  id: string;
  name: string;
  breed: string;
  salePrice: number;
  customerName: string;
}

interface ReservedPet {
  id: string;
  name: string;
  breed: string;
  salePrice: number;
  customerName: string;
  customerPhone: string;
}

interface DailyReportData {
  date: string;
  salesId: string;
  soldPets: SoldPet[];
  reservedPets: ReservedPet[];
  submittedReport: string | null;
}

// Web Speech API 类型声明（非标准 DOM 类型，用 any 兼容）
type SpeechRecognitionLike = any;

function getSpeechRecognition(): SpeechRecognitionLike | null {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export default function SalesDailyReport() {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const { data: resp, isLoading } = useQuery({
    queryKey: ['reports', 'sales-daily'],
    queryFn: async () => {
      const res: any = await api.get('/reports/sales-daily');
      return res.data as DailyReportData;
    },
  });

  const report = resp;

  // 同步已提交内容到 textarea
  useEffect(() => {
    if (report?.submittedReport) {
      setContent(report.submittedReport);
    }
  }, [report?.submittedReport]);

  const submitMutation = useMutation({
    mutationFn: (payload: { content: string }) =>
      api.post('/reports/sales-daily', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'sales-daily'] });
      showToast('日报已提交');
    },
    onError: () => {
      showToast('提交失败，请重试');
    },
  });

  const isSubmitted = !!report?.submittedReport;

  const handleAiGenerate = () => {
    setAiLoading(true);
    setTimeout(() => {
      const sold = report?.soldPets ?? [];
      const reserved = report?.reservedPets ?? [];
      const soldText = sold.length > 0
        ? sold.map(p => `${p.breed}${p.name}（${p.salePrice}元，客户${p.customerName}）`).join('、')
        : '今日无开单';
      const reservedText = reserved.length > 0
        ? reserved.map(p => `${p.breed}${p.name}（${p.salePrice}元，客户${p.customerName} ${p.customerPhone}）`).join('、')
        : '今日无预定';
      const generated = `今日共开单${sold.length}只宠物，分别为${soldText}；预定${reserved.length}只宠物，分别为${reservedText}。整体销售情况良好，建议明日继续跟进预定客户促成开单，同时加强库存宠物的推广力度。`;
      setContent(generated);
      setAiLoading(false);
      showToast('AI 整理完成');
    }, 2000);
  };

  const handleVoiceToggle = () => {
    if (recording) {
      // 停止录音
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const SR = getSpeechRecognition();
    if (!SR) {
      showToast('当前浏览器不支持语音输入，请使用 Chrome 浏览器');
      return;
    }
    const recognition = new SR();
    recognition.lang = 'zh-CN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        }
      }
      if (finalText) {
        setContent(prev => prev + finalText);
      }
    };
    recognition.onerror = () => {
      setRecording(false);
      showToast('语音识别出错，请重试');
    };
    recognition.onend = () => {
      setRecording(false);
    };
    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      showToast('请填写日报内容');
      return;
    }
    submitMutation.mutate({ content });
  };

  if (isLoading || !report) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">加载中...</div></div>;
  }

  return (
    <div className="space-y-6">
      {/* 顶部标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">今日日报</h1>
          <p className="text-sm text-gray-500 mt-1">{report.date}</p>
        </div>
      </div>

      {/* 上半部分：两个卡片 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 今日开单 */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-pet-blue/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-pet-blue" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">今日开单</h3>
            <span className="ml-auto text-sm text-gray-400">{report.soldPets.length} 只</span>
          </div>
          {report.soldPets.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">今日暂无开单</div>
          ) : (
            <div className="space-y-3">
              {report.soldPets.map((pet) => (
                <div key={pet.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{pet.name}</div>
                    <div className="text-xs text-gray-500">{pet.breed} · 客户 {pet.customerName}</div>
                  </div>
                  <div className="text-pet-blue font-semibold">{formatPrice(pet.salePrice)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 今日预定 */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-pet-orange/10 rounded-lg flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-pet-orange" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">今日预定</h3>
            <span className="ml-auto text-sm text-gray-400">{report.reservedPets.length} 只</span>
          </div>
          {report.reservedPets.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">今日暂无预定</div>
          ) : (
            <div className="space-y-3">
              {report.reservedPets.map((pet) => (
                <div key={pet.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{pet.name}</div>
                    <div className="text-xs text-gray-500">
                      {pet.breed} · 客户 {pet.customerName} {pet.customerPhone}
                    </div>
                  </div>
                  <div className="text-pet-orange font-semibold">{formatPrice(pet.salePrice)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 下半部分：日报输入区 */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">日报内容</h3>
          {isSubmitted && (
            <span className="badge bg-green-100 text-green-800 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> 已提交
            </span>
          )}
        </div>

        {/* 按钮组 */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={handleAiGenerate}
            disabled={aiLoading || isSubmitted}
            className="btn btn-secondary text-sm"
            style={{ backgroundColor: aiLoading ? undefined : 'rgba(168,85,247,0.1)', color: '#a855f7' }}
          >
            <Sparkles className="w-4 h-4 mr-1" />
            {aiLoading ? 'AI 整理中...' : 'AI 智能整理'}
          </button>
          <button
            onClick={handleVoiceToggle}
            disabled={isSubmitted}
            className="btn btn-secondary text-sm"
            style={{ backgroundColor: recording ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)', color: '#3b82f6' }}
          >
            <Mic className="w-4 h-4 mr-1" />
            {recording ? '录音中...点击停止' : '语音输入'}
          </button>
        </div>

        {/* textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitted}
          placeholder="请输入今日日报内容，可点击 AI 智能整理或语音输入..."
          className="input min-h-[200px] resize-y"
        />

        {/* 提交按钮 */}
        <div className="mt-4 flex justify-end">
          {isSubmitted ? (
            <button disabled className="btn bg-green-100 text-green-600 cursor-default">
              <CheckCircle className="w-4 h-4 mr-1" />
              已提交 ✓
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="btn text-white"
              style={{ backgroundColor: '#22c55e' }}
            >
              {submitMutation.isPending ? '提交中...' : '提交日报'}
            </button>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
