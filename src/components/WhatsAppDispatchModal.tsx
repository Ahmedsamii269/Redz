import React, { useState } from 'react';
import { X, Send, Copy, Check, MessageSquare, Phone, UserCheck } from 'lucide-react';
import { CandidateApplication } from '../types';
import {
  getStoredWhatsAppConfig,
  saveStoredWhatsAppConfig,
  formatWhatsAppCandidateMessage,
  openWhatsAppDirect,
} from '../lib/whatsapp';

interface WhatsAppDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateApplication | null;
  newStatus: string;
  note?: string;
}

export const WhatsAppDispatchModal: React.FC<WhatsAppDispatchModalProps> = ({
  isOpen,
  onClose,
  candidate,
  newStatus,
  note,
}) => {
  if (!isOpen || !candidate) return null;

  const isVoiceAccepted = newStatus === 'voice note accepted';
  const isUpcomingInterview = newStatus === 'Upcoming Interview';

  const config = getStoredWhatsAppConfig();
  const initialTargetPhone = isVoiceAccepted ? config.voiceAcceptedPhone : config.upcomingInterviewPhone;
  const initialEmpName = isVoiceAccepted ? config.voiceAcceptedEmployeeName : config.upcomingInterviewEmployeeName;

  const [targetPhone, setTargetPhone] = useState(initialTargetPhone);
  const [employeeName, setEmployeeName] = useState(initialEmpName);
  const [copied, setCopied] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(true);

  const formattedMessage = formatWhatsAppCandidateMessage(candidate, newStatus, note);

  const handleSend = () => {
    if (!targetPhone.trim()) return;

    if (saveAsDefault) {
      if (isVoiceAccepted) {
        saveStoredWhatsAppConfig(
          targetPhone.trim(),
          employeeName.trim() || 'منسق المواعيد',
          config.upcomingInterviewPhone,
          config.upcomingInterviewEmployeeName
        );
      } else {
        saveStoredWhatsAppConfig(
          config.voiceAcceptedPhone,
          config.voiceAcceptedEmployeeName,
          targetPhone.trim(),
          employeeName.trim() || 'مسؤول الفيدباك'
        );
      }
    }

    openWhatsAppDirect(targetPhone.trim(), formattedMessage);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150" dir="rtl">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isVoiceAccepted
                  ? '🎧 إرسال إشعار لمنسق مواعيد الانترفيو'
                  : '📅 إرسال إشعار لمسؤول الفيدباك والمتابعة'}
              </h3>
              <p className="text-xs text-slate-300">
                {isVoiceAccepted
                  ? 'إرسال بيانات الكانديدت للشخص المسؤول لحجز معاد الانترفيو وتحديث الحالة'
                  : 'إرسال بيانات الكانديدت للشخص المسؤول لمتابعة حضور الانترفيو وأخذ الفيدباك'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Target Employee & Phone Input Box */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-emerald-950 text-xs mb-1 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  اسم الموظف المستلم:
                </label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="مثال: منسق حجز المواعيد"
                  className="w-full p-2.5 rounded-lg border border-emerald-300 focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-950 text-xs mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  رقم الواتساب المستهدف:
                </label>
                <input
                  type="tel"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="010xxxxxxxx"
                  className="w-full p-2.5 rounded-lg border border-emerald-300 focus:ring-2 focus:ring-emerald-500 bg-white font-mono text-left dir-ltr font-bold text-slate-900 text-xs"
                />
              </div>
            </div>

            <div className="pt-1 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-900">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={saveAsDefault}
                  onChange={(e) => setSaveAsDefault(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span>حفظ كبيانات افتراضية لـ {isVoiceAccepted ? 'منسق المواعيد' : 'مسؤول الفيدباك'}</span>
              </label>
            </div>
          </div>

          {/* Formatted Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-800 text-xs">معاينة الرسالة المنسقة للموظف:</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded border border-slate-200 transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ الرسالة'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={11}
              value={formattedMessage}
              className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 font-mono text-slate-800 text-[11px] leading-relaxed shadow-inner focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSend}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2 text-xs"
            >
              <Send className="w-4 h-4" />
              <span>إرسال الإشعار عبر الواتساب للموظف 📲</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
