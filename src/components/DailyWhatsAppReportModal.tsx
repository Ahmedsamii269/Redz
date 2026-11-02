import React, { useState } from 'react';
import { X, Copy, Check, Share2, Calendar, FileText, Users, Briefcase, Award } from 'lucide-react';
import { CandidateApplication, CompanyOffer, User } from '../types';

interface DailyWhatsAppReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: CandidateApplication[];
  offers: CompanyOffer[];
  recruiters: User[];
  currentUser: User | null;
}

export const DailyWhatsAppReportModal: React.FC<DailyWhatsAppReportModalProps> = ({
  isOpen,
  onClose,
  candidates,
  offers,
  recruiters,
  currentUser,
}) => {
  const [copied, setCopied] = useState(false);

  // Compute stats for today
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

  const todayApps = candidates.filter((c) => (c.createdAt || '').startsWith(todayStr));
  const todayInterviews = candidates.filter((c) => {
    if (c.status !== 'Upcoming Interview') return false;
    if (c.scheduledDate && c.scheduledDate.startsWith(todayStr)) return true;
    return false;
  });

  const tomorrowInterviews = candidates.filter((c) => {
    if (c.status !== 'Upcoming Interview') return false;
    if (c.scheduledDate && c.scheduledDate.startsWith(tomorrowStr)) return true;
    return false;
  });

  const todayAccepted = candidates.filter(
    (c) => (c.status === 'accepted' || c.status === 'hired') && (c.updatedAt || c.createdAt || '').startsWith(todayStr)
  );

  const pendingVoiceNotes = candidates.filter(
    (c) => c.status === 'Pending Feedback' && c.vocarooUrl
  );

  // Group today's interviews by company
  const companyCounts: Record<string, number> = {};
  todayInterviews.forEach((cand) => {
    const comp = cand.companyName || 'Unknown';
    companyCounts[comp] = (companyCounts[comp] || 0) + 1;
  });

  // Top recruiters of the day
  const recruiterAppCounts: Record<string, { name: string; count: number }> = {};
  todayApps.forEach((cand) => {
    const rId = cand.recruiterId || 'other';
    const rName = cand.recruiterName || 'Direct';
    if (!recruiterAppCounts[rId]) {
      recruiterAppCounts[rId] = { name: rName, count: 0 };
    }
    recruiterAppCounts[rId].count += 1;
  });

  const topRecruiters = Object.values(recruiterAppCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Date formatted nicely in Arabic & English
  const dateFormatted = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Construct message text
  let companyLines = '';
  if (Object.keys(companyCounts).length > 0) {
    companyLines = Object.entries(companyCounts)
      .map(([comp, count]) => `   • *${comp}*: ${count} مرشح`)
      .join('\n');
  } else {
    companyLines = '   • لا توجد مقابلات مجدولة اليوم';
  }

  let recruiterLines = '';
  if (topRecruiters.length > 0) {
    recruiterLines = topRecruiters
      .map((r, i) => `${i + 1}. *${r.name}*: ${r.count} مرشح`)
      .join('\n');
  } else {
    recruiterLines = '• لم يتم تسجيل تقديمات بعد اليوم';
  }

  const generatedReport = `📊 *تقرير وكالة REDZ Recruitment اليومي*
📅 *التاريخ:* ${dateFormatted}
━━━━━━━━━━━━━━━━━━━━
👥 *إجمالي التقديمات اليوم:* ${todayApps.length} مرشح جديد
🎯 *مقابلات اليوم المجدولة:* ${todayInterviews.length} مرشح
${companyLines}
⏰ *مقابلات الغد المرتقبة:* ${tomorrowInterviews.length} مرشح
✅ *المقبولين اليوم:* ${todayAccepted.length} مرشح
🎧 *فويس نوت بانتظار المراجعة:* ${pendingVoiceNotes.length}
━━━━━━━━━━━━━━━━━━━━
🏆 *أعلى الريكروترز نشاطاً اليوم:*
${recruiterLines}
━━━━━━━━━━━━━━━━━━━━
🚀 *REDZ Recruitment Agency - Management System*
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToWhatsApp = () => {
    const encoded = encodeURIComponent(generatedReport);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150" dir="rtl">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                📊 تقرير الواتساب اليومي (Daily Summary)
              </h3>
              <p className="text-xs text-emerald-100">
                ملخص أرقام ومقابلات اليوم جاهز للمشاركة في جروبات الواتساب
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-white/15 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-6 space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-center">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">تقديمات اليوم</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{todayApps.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-center">
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">مقابلات اليوم</div>
              <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{todayInterviews.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-center">
              <div className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold">مقابلات الغد</div>
              <div className="text-xl font-black text-blue-700 dark:text-blue-300 mt-0.5">{tomorrowInterviews.length}</div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-xs">
              معاينة نص التقرير للواتساب:
            </label>
            <textarea
              readOnly
              rows={9}
              value={generatedReport}
              className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs leading-relaxed focus:outline-hidden resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={handleShareToWhatsApp}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة على واتساب</span>
            </button>
            <button
              onClick={handleCopy}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                copied
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>تم النسخ بنجاح!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ التقرير</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
