import React from 'react';
import {
  X,
  AlertTriangle,
  User as UserIcon,
  Phone,
  Building2,
  Calendar,
  Clock,
  Volume2,
  MessageSquare,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { CandidateApplication, StatusConfig, User } from '../types';
import { StatusBadge } from './StatusBadge';

interface DuplicateComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidatePhone: string | null;
  allCandidates: CandidateApplication[];
  statuses: StatusConfig[];
  currentUser: User | null;
  onSelectCandidateForAudio?: (candidate: CandidateApplication) => void;
  onSelectCandidateForStatus?: (candidate: CandidateApplication) => void;
}

export const DuplicateComparisonModal: React.FC<DuplicateComparisonModalProps> = ({
  isOpen,
  onClose,
  candidatePhone,
  allCandidates,
  statuses,
  currentUser,
  onSelectCandidateForAudio,
  onSelectCandidateForStatus,
}) => {
  if (!isOpen || !candidatePhone) return null;

  const cleanTargetPhone = candidatePhone.replace(/\D/g, '');
  const matchedApplications = allCandidates.filter((c) => {
    const clean = (c.phone || '').replace(/\D/g, '');
    return clean === cleanTargetPhone;
  });

  // Sort by createdAt descending (newest first)
  matchedApplications.sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  const mainCandidate = matchedApplications[0];
  const canDispatchWhatsApp = currentUser?.role === 'admin' || currentUser?.role === 'account_manager';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      dir="rtl"
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-200 dark:border-amber-900/40 bg-gradient-to-r from-amber-500 to-orange-600 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  كشف التقديم المتكرر للمرشح (Duplicate Applications)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-white text-amber-700 shadow-2xs">
                  {matchedApplications.length} تقديمات
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5 font-mono">
                {mainCandidate?.fullName || 'مرشح'} • {candidatePhone}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-amber-200 hover:text-white rounded-lg hover:bg-white/15 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Summary Box */}
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">تنبيه المزامنة وتكرار البيانات: </span>
              هذا المرشح مسجل في النظام بنفس رقم الهاتف في <strong>{matchedApplications.length} طلبات تقديم</strong>. يمكنك مراجعة تواريخ التقديم والشركات والحالات المسجلة له بالأسفل لتفادي إرساله لنفس الشركة أو تكرار مقابلته.
            </div>
          </div>

          {/* Applications Timeline */}
          <div className="space-y-3.5">
            {matchedApplications.map((app, index) => {
              const isLatest = index === 0;
              const dateFormatted = new Date(app.createdAt || 0).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={app.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isLatest
                      ? 'bg-white dark:bg-slate-800 border-red-300 dark:border-red-900 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                        طلب #{matchedApplications.length - index}
                      </span>
                      {isLatest && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                          أحدث تقديم
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-mono">
                        {dateFormatted}
                      </span>
                    </div>

                    <StatusBadge status={app.status} statuses={statuses} size="sm" />
                  </div>

                  {/* Company & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-700/40 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <Building2 className="w-3.5 h-3.5 text-red-600" />
                        <span>{app.companyName}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                        {app.offerTitle}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        كود: {app.referenceCode}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-700/40 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>الموعد: {app.interviewSlotDetails}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        الريكروتر: <strong className="text-red-600 dark:text-red-400">{app.recruiterName}</strong> (@{app.recruiterCode})
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        السكن: {app.residence}
                      </div>
                    </div>
                  </div>

                  {/* Feedback notes if exists */}
                  {app.feedbackNotes && (
                    <div className="mt-2.5 p-2 bg-slate-100 dark:bg-slate-700/30 rounded-lg text-xs text-slate-700 dark:text-slate-300">
                      <strong>ملاحظات الفيدباك: </strong> {app.feedbackNotes}
                    </div>
                  )}

                  {/* Actions for this specific application */}
                  <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-1.5">
                      {onSelectCandidateForAudio && app.vocarooUrl && (
                        <button
                          onClick={() => onSelectCandidateForAudio(app)}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>استماع الفويس</span>
                        </button>
                      )}

                      {canDispatchWhatsApp && (
                        <a
                          href={`https://wa.me/2${app.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 transition-colors"
                          title="محادثة واتساب"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {onSelectCandidateForStatus && (
                      <button
                        onClick={() => {
                          onClose();
                          onSelectCandidateForStatus(app);
                        }}
                        className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold transition-all shadow-xs"
                      >
                        تعديل حالة هذا الطلب
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
