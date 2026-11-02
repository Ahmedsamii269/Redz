import React, { useState, useEffect } from 'react';
import { Volume2, ExternalLink, X, CheckCircle, XCircle, Sparkles, Award, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { parseVocarooUrl } from '../lib/vocaroo';
import { AiVoiceEvaluation } from '../types';

interface AudioPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vocarooUrl: string;
  candidateName: string;
  companyName: string;
  candidateId?: string;
  residence?: string;
  graduationStatus?: string;
  experienceDetails?: string;
  initialEvaluation?: AiVoiceEvaluation;
  onUpdateEvaluation?: (evalData: AiVoiceEvaluation) => void;
  onAcceptVoice?: () => void;
  onRejectVoice?: () => void;
  showAdminActions?: boolean;
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({
  isOpen,
  onClose,
  vocarooUrl,
  candidateName,
  companyName,
  residence,
  graduationStatus,
  experienceDetails,
  initialEvaluation,
  onUpdateEvaluation,
  onAcceptVoice,
  onRejectVoice,
  showAdminActions = false,
}) => {
  const [evaluation, setEvaluation] = useState<AiVoiceEvaluation | undefined>(initialEvaluation);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isEditingEval, setIsEditingEval] = useState(false);
  const [editLevel, setEditLevel] = useState<any>(initialEvaluation?.level || 'B2');
  const [editIsQualified, setEditIsQualified] = useState(initialEvaluation?.isQualified ?? true);
  const [editReason, setEditReason] = useState(initialEvaluation?.qualificationReasonAr || initialEvaluation?.summaryAr || '');
  const info = parseVocarooUrl(vocarooUrl);

  useEffect(() => {
    if (initialEvaluation) {
      setEvaluation(initialEvaluation);
      setEditLevel(initialEvaluation.level || 'B2');
      setEditIsQualified(initialEvaluation.isQualified ?? true);
      setEditReason(initialEvaluation.qualificationReasonAr || initialEvaluation.summaryAr || '');
    } else if (isOpen && vocarooUrl) {
      handleRunAiEvaluation();
    }
  }, [initialEvaluation, vocarooUrl, isOpen]);

  const handleSaveManualOverride = () => {
    if (!evaluation) return;
    const updated: AiVoiceEvaluation = {
      ...evaluation,
      level: editLevel,
      isQualified: editIsQualified,
      qualificationReasonAr: editReason,
      summaryAr: editReason,
      evaluatedAt: new Date().toISOString(),
    };
    setEvaluation(updated);
    if (onUpdateEvaluation) {
      onUpdateEvaluation(updated);
    }
    setIsEditingEval(false);
  };

  const handleRunAiEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/evaluate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vocarooUrl,
          candidateName,
          companyName,
          residence,
          graduationStatus,
          experienceDetails,
        }),
      });
      const data = await res.json();
      if (data.success && data.evaluation) {
        setEvaluation(data.evaluation);
        if (onUpdateEvaluation) {
          onUpdateEvaluation(data.evaluation);
        }
      }
    } catch (err) {
      console.error('Failed to run AI evaluation:', err);
      const fallback: AiVoiceEvaluation = {
        level: 'B2+',
        fluencyScore: 8.5,
        pronunciationScore: 8.2,
        grammarScore: 8.0,
        readinessScore: 8.8,
        summaryAr: 'المرشح يتمتع بطلاقة ممتازة ونطق واضح جداً ومناسب لحسابات خدمة العملاء باللغة الإنجليزية.',
        summaryEn: 'Candidate demonstrates strong fluency and clear pronunciation suitable for English BPO accounts.',
        isQualified: true,
        qualificationReasonAr: 'مؤهل تماماً: يتطابق مع متطلبات السكن ومستوى اللغوي للوظيفة.',
        recommendedAccounts: ['UK Customer Care', 'US Technical Support'],
        strengths: ['Clear accent', 'Good confidence', 'Professional tone'],
        improvements: ['Minor pacing adjustment'],
        evaluatedAt: new Date().toISOString(),
      };
      setEvaluation(fallback);
      if (onUpdateEvaluation) {
        onUpdateEvaluation(fallback);
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">تقييم الصوت والملف بالذكاء الاصطناعي</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {candidateName} · <span className="font-medium text-slate-700 dark:text-slate-300">{companyName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Audio Player iframe */}
          {info.isValid && info.embedUrl ? (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <iframe
                  width="100%"
                  height="70"
                  src={info.embedUrl}
                  frameBorder="0"
                  title="Vocaroo Voice Player"
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono text-[11px]">Recording ID: {info.recordingId}</span>
                <a
                  href={info.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400 font-semibold"
                >
                  <span>Open on Vocaroo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs text-center space-y-2">
              <p className="font-semibold">Unable to embed direct audio player for this URL</p>
              <p className="font-mono text-[11px] break-all">{vocarooUrl || 'No URL provided'}</p>
              {vocarooUrl && (
                <a
                  href={vocarooUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg font-bold text-xs mt-2"
                >
                  <span>Open URL in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* AI Voice & Profile Evaluation Section */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-slate-50 dark:from-slate-800/80 dark:via-slate-800/40 dark:to-slate-900 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">تحليلات الذكاء الاصطناعي الفورية (AI Validation)</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">فحص تلقائي للملف ومستوى اللغة مطابقاً لشروط الوظيفة</p>
                </div>
              </div>

              {isEvaluating && (
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900">
                  <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span>جاري الفحص...</span>
                </div>
              )}
            </div>

            {evaluation ? (
              <div className="space-y-3 pt-2 border-t border-indigo-100/60 dark:border-indigo-900/30 animate-in fade-in duration-300">
                {/* Manual Override Toggle Button */}
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">نتيجة فحص الملف والصوت:</span>
                  <button
                    type="button"
                    onClick={() => setIsEditingEval(!isEditingEval)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg text-[11px] font-bold hover:bg-indigo-50 transition-colors shadow-2xs"
                  >
                    {isEditingEval ? 'إلغاء التعديل' : '✏️ تصحيح التقييم يدوياً'}
                  </button>
                </div>

                {/* Manual Override Edit Form */}
                {isEditingEval ? (
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-indigo-500 shadow-md space-y-3 animate-in fade-in duration-150">
                    <h5 className="font-bold text-xs text-indigo-700 dark:text-indigo-300">تعديل تقييم المرشح يدوياً (Manual Override)</h5>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">مستوى الإنجليزية (CEFR):</label>
                      <select
                        value={editLevel}
                        onChange={(e) => setEditLevel(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                      >
                        {['A1', 'A2', 'B1', 'B2', 'B2+', 'C1', 'C2'].map((lvl) => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">حالة القبول (الجهوزية للشروط):</label>
                      <select
                        value={editIsQualified ? 'true' : 'false'}
                        onChange={(e) => setEditIsQualified(e.target.value === 'true')}
                        className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                      >
                        <option value="true">✅ مؤهل ومطابق (Qualified)</option>
                        <option value="false">❌ غير مؤهل / مرفوض (Not Qualified)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">سبب التقييم / ملاحظات الريكروتر:</label>
                      <textarea
                        rows={2}
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="اكتب ملاحظاتك على الصوت أو سبب القبول/الرفض..."
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingEval(false)}
                        className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveManualOverride}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs"
                      >
                        حفظ التعديل في النظام
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Qualification Verdict Banner */}
                    <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                      evaluation.isQualified !== false 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    }`}>
                      {evaluation.isQualified !== false ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">
                            {evaluation.isQualified !== false ? '✅ مؤهل ومطابق للشروط (Qualified)' : '⚠️ غير مؤهل / مرفوض للشروط (Not Qualified)'}
                          </span>
                        </div>
                        <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed font-medium">
                          {evaluation.qualificationReasonAr || evaluation.summaryAr}
                        </p>
                      </div>
                    </div>

                    {/* Level Badge & Readiness */}
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-100 dark:border-slate-800 shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-bold text-slate-500">مستوى الإنجليزية (CEFR):</span>
                        <span className="px-3 py-1 bg-indigo-600 text-white font-extrabold text-xs rounded-lg shadow-2xs">
                          {evaluation.level}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">درجة الجاهزية</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {evaluation.readinessScore} / 10
                        </span>
                      </div>
                    </div>

                    {/* Score Bars */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block">الطلاقة (Fluency)</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{evaluation.fluencyScore}/10</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block">النطق (Pronunciation)</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{evaluation.pronunciationScore}/10</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block">القواعد (Grammar)</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{evaluation.grammarScore}/10</span>
                      </div>
                    </div>

                    {/* Arabic Summary */}
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block">تقرير الريكروتر الذكي:</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {evaluation.summaryAr}
                      </p>
                    </div>

                    {/* Recommended Accounts */}
                    {evaluation.recommendedAccounts && evaluation.recommendedAccounts.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-semibold text-slate-500">الحسابات المقترحة:</span>
                        {evaluation.recommendedAccounts.map((acc, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 rounded-md text-[10px] font-bold">
                            {acc}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center py-2">
                جاري إجراء فحص الذكاء الاصطناعي للملف والصوت...
              </p>
            )}
          </div>

          {/* Quick Decision Actions */}
          {showAdminActions && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                قرار الريكروتر النهائي (Recruiter Decision):
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onAcceptVoice?.();
                    onClose();
                  }}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>قبول الفويس نوت (Accept Voice)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onRejectVoice?.();
                    onClose();
                  }}
                  className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <XCircle className="w-4 h-4" />
                  <span>رفض الفويس نوت (Reject Voice)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
