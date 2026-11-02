import React, { useState } from 'react';
import { X, Send, Copy, Check, MessageSquare, Phone, UserCheck, Sparkles } from 'lucide-react';
import { CandidateApplication } from '../types';
import {
  getStoredWhatsAppConfig,
  saveStoredWhatsAppConfig,
  formatWhatsAppCandidateMessage,
  getCompanyConfirmationMessage,
  getAskForFeedbackMessage,
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
  const isVoiceAccepted = newStatus === 'voice note accepted';
  const isUpcomingInterview = newStatus === 'Upcoming Interview';

  const config = getStoredWhatsAppConfig();
  
  // Message template mode for Upcoming Interview
  // 'candidate_confirmation' | 'candidate_feedback' | 'internal_routing'
  const [msgMode, setMsgMode] = useState<'candidate_confirmation' | 'candidate_feedback' | 'internal_routing'>(
    isUpcomingInterview ? 'candidate_confirmation' : 'internal_routing'
  );

  const [targetPhone, setTargetPhone] = useState(
    msgMode === 'internal_routing' 
      ? (isVoiceAccepted ? config.voiceAcceptedPhone : config.upcomingInterviewPhone)
      : (candidate?.phone || '')
  );
  const [employeeName, setEmployeeName] = useState(
    isVoiceAccepted ? config.voiceAcceptedEmployeeName : config.upcomingInterviewEmployeeName
  );
  const [copied, setCopied] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(true);

  if (!isOpen || !candidate) return null;

  // Compute active message based on mode
  let activeMessage = '';
  if (isUpcomingInterview) {
    if (msgMode === 'candidate_confirmation') {
      activeMessage = getCompanyConfirmationMessage(candidate);
    } else if (msgMode === 'candidate_feedback') {
      activeMessage = getAskForFeedbackMessage(candidate);
    } else {
      activeMessage = formatWhatsAppCandidateMessage(candidate, newStatus, note);
    }
  } else {
    activeMessage = formatWhatsAppCandidateMessage(candidate, newStatus, note);
  }

  const handleModeChange = (mode: 'candidate_confirmation' | 'candidate_feedback' | 'internal_routing') => {
    setMsgMode(mode);
    if (mode === 'internal_routing') {
      setTargetPhone(isVoiceAccepted ? config.voiceAcceptedPhone : config.upcomingInterviewPhone);
    } else {
      setTargetPhone(candidate.phone || '');
    }
  };

  const handleSend = () => {
    if (!targetPhone.trim()) return;

    if (saveAsDefault && msgMode === 'internal_routing') {
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

    openWhatsAppDirect(targetPhone.trim(), activeMessage);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150" dir="rtl">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[95vh] flex flex-col overflow-hidden text-right"
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
                {isUpcomingInterview
                  ? '📅 إرسال رسالة واتساب للانترفيو أو الفيدباك'
                  : '🎧 إرسال إشعار لمنسق مواعيد الانترفيو'}
              </h3>
              <p className="text-xs text-slate-300">
                إرسال رسالة كونفرميشن أو طلب فيدباك للكانديدت أو إشعار داخلي للاكونت مانجر
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
          {/* Mode Selector for Upcoming Interview */}
          {isUpcomingInterview && (
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => handleModeChange('candidate_confirmation')}
                className={`py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                  msgMode === 'candidate_confirmation'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>تأكيد الانترفيو (للعنوان والوقت)</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('candidate_feedback')}
                className={`py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                  msgMode === 'candidate_feedback'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>طلب الفيدباك (Ask for Feedback)</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('internal_routing')}
                className={`py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                  msgMode === 'internal_routing'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>إشعار داخلي (للاكونت مانجر)</span>
              </button>
            </div>
          )}

          {/* Target Phone & Recipient Box */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {msgMode === 'internal_routing' && (
                <div>
                  <label className="block font-bold text-emerald-950 text-xs mb-1 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    اسم المسؤول المستلم:
                  </label>
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="مثال: مسؤول الفيدباك"
                    className="w-full p-2.5 rounded-lg border border-emerald-300 focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-slate-900 text-xs"
                  />
                </div>
              )}

              <div className={msgMode === 'internal_routing' ? '' : 'sm:col-span-2'}>
                <label className="block font-bold text-emerald-950 text-xs mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {msgMode === 'internal_routing' ? 'رقم الواتساب المستهدف (المسؤول):' : `رقم واتساب الكانديدت (${candidate.fullName}):`}
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

            {msgMode === 'internal_routing' && (
              <div className="pt-1 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-900">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={saveAsDefault}
                    onChange={(e) => setSaveAsDefault(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span>حفظ كبيانات افتراضية</span>
                </label>
              </div>
            )}
          </div>

          {/* Formatted Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-800 text-xs">
                {msgMode === 'candidate_confirmation'
                  ? `معاينة رسالة تأكيد الانترفيو (${candidate.companyName}):`
                  : msgMode === 'candidate_feedback'
                  ? 'معاينة رسالة طلب الفيدباك (Ask for Feedback):'
                  : 'معاينة الإشعار الداخلي المنسق:'}
              </span>
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
              rows={12}
              value={activeMessage}
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
              <span>{msgMode === 'internal_routing' ? 'إرسال الإشعار للمسؤول عبر الواتساب 📲' : 'إرسال الرسالة للكانديدت عبر الواتساب 📲'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
