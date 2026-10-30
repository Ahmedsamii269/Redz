import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, User, Bot, Loader2, AlertCircle } from 'lucide-react';
import { CompanyOffer } from '../types';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  offers: CompanyOffer[];
  userName?: string;
}

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose, offers, userName }) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'bot', 
      content: `Hello ${userName || 'Recruiter'}! I am your REDZ Recruitment Assistant. / أهلاً بك ${userName || 'يا موظف التوظيف'}! أنا مساعد التوظيف الخاص بـ REDZ.\n\nTo match your candidate accurately against our company requirements, please share:\nللمطابقة بدقة، يرجى مشاركة:\n\n1. Age / العمر\n2. Residence Location / مكان الإقامة\n3. Education Status / المؤهل الدراسي\n4. Experience / الخبرة\n\nTell me these details and I will provide a clean, structured match evaluation!\nأخبرني بهذه التفاصيل وسأقدم لك تقييماً دقيقاً ومنظماً!` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage, offers }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to get AI response');
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let botContent = '';
      setMessages(prev => [...prev, { role: 'bot', content: '' }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value);
        botContent += chunk;
        setMessages(prev => {
           const newMessages = [...prev];
           newMessages[newMessages.length - 1].content = botContent;
           return newMessages;
        });
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg h-[600px] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">REDZ AI Assistant</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Smart Matching & Advice</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-red-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
              }`}>
                <div className="flex items-center gap-2 mb-1 opacity-70">
                  {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  <span className="font-bold uppercase tracking-tighter text-[9px]">
                    {msg.role === 'user' ? 'Recruiter' : 'AI Assistant'}
                  </span>
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-3.5 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                <span className="text-[10px] text-slate-500 font-bold uppercase">AI is analyzing offers...</span>
              </div>
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[10px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Age 24, from Giza, Graduate, good English..."
            className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-red-500 transition-all outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md shadow-red-500/20 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
