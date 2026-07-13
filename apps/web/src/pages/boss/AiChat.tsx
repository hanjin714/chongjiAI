import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, BarChart3 } from 'lucide-react';
import api from '@/lib/api';

interface Message {
  id: string;
  sender: 'USER' | 'AI';
  content: string;
  cards?: any[];
}

export default function BossAiChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'AI',
      content:
        '老板好！我是您的AI店长助手 📊\n\n我可以帮您：\n• 分析门店经营数据\n• 识别风险客户和宠物\n• 生成复购机会\n• 查看库存周转情况\n• 解答管理问题\n\n试试问我："最近7天的销售情况怎么样？"',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    '今天的经营情况怎么样？',
    '有哪些高风险客户需要关注？',
    '库存周转最慢的宠物有哪些？',
    '最近一个月的销售趋势',
  ];

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'USER',
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res: any = await api.post('/ai/chat', { message: messageText });
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'AI',
        content: res.data.answer,
        cards: res.data.cards,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI对话失败:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'AI',
        content: '抱歉，服务暂时不可用，请稍后再试。',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.sender === 'AI'
                  ? 'bg-gradient-to-br from-primary-400 to-orange-500'
                  : 'bg-gray-200'
              }`}
            >
              {msg.sender === 'AI' ? (
                <Bot className="w-5 h-5 text-white" />
              ) : (
                <User className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.sender === 'AI'
                  ? 'bg-white border border-gray-200 text-gray-900'
                  : 'bg-gradient-to-r from-primary-400 to-orange-500 text-white'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              
              {msg.cards && msg.cards.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.cards.map((card, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-3"
                    >
                      <div className="font-medium text-sm text-gray-900">{card.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{card.subtitle}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-sm px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:border-primary-500 hover:text-primary-500 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="问我任何经营问题..."
              className="input pr-12 resize-none min-h-[48px] max-h-32 py-3"
              rows={1}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="btn btn-primary px-4"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
