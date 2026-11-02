import React, { useState } from 'react';
import { X, Send, Megaphone, Bell } from 'lucide-react';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendBroadcast: (title: string, message: string) => Promise<void>;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  onSendBroadcast,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    try {
      await onSendBroadcast(title.trim(), message.trim());
      setTitle('');
      setMessage('');
      onClose();
      alert('Broadcast notification sent successfully to all team members!');
    } catch (err) {
      console.error('Failed to send broadcast:', err);
      alert('Failed to send broadcast. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150" dir="rtl">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-red-600 to-rose-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                📢 إرسال إشعار عام للجميع (Broadcast)
              </h3>
              <p className="text-xs text-red-100">
                إرسال تنبيه فوري يظهر في جرس الإشعارات لكل الريكروترز والاكونت مانجرز
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-red-200 hover:text-white rounded-lg hover:bg-white/15 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              عنوان التنبيه / الإشعار:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: 🚨 تحديث هام بخصوص شروط الانترفيو اليوم"
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 bg-white font-bold text-slate-900 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              محتوى الرسالة والتفاصيل:
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب تفاصيل التحديث أو التعليمات الجديدة لجميع فريق العمل..."
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 bg-white text-slate-900 text-xs leading-relaxed"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
            <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              سيتم إضافة هذا الإشعار تلقائياً إلى صندوق إشعارات جميع أعضاء الفريق المترابطين فور الضغط على زر الإرسال.
            </span>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'جاري الإرسال...' : 'إرسال للجميع الآن'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
