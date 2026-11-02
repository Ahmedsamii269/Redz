import React, { useState } from 'react';
import { Calendar, Clock, ChevronDown, ChevronUp, CheckCircle, MessageSquare, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import { CandidateApplication, User } from '../types';

interface TodayAgendaBannerProps {
  candidates: CandidateApplication[];
  currentUser: User | null;
  onOpenCalendar?: () => void;
  onSelectCandidate?: (candidate: CandidateApplication) => void;
}

const getIsoDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const TodayAgendaBanner: React.FC<TodayAgendaBannerProps> = ({
  candidates,
  currentUser,
  onOpenCalendar,
  onSelectCandidate,
}) => {
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today');
  const [isExpanded, setIsExpanded] = useState(false);

  const now = new Date();
  const todayStr = getIsoDateString(now);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getIsoDateString(tomorrow);

  const filterForDate = (dateStr: string) => {
    return candidates.filter((c) => {
      if (c.status !== 'Upcoming Interview') return false;
      if (!c.scheduledDate) return false;
      // Match startsWith YYYY-MM-DD or contains dateStr
      return c.scheduledDate.startsWith(dateStr) || c.scheduledDate.includes(dateStr);
    });
  };

  const todayInterviews = filterForDate(todayStr);
  const tomorrowInterviews = filterForDate(tomorrowStr);

  const activeInterviews = selectedDay === 'today' ? todayInterviews : tomorrowInterviews;
  const activeDateLabel = selectedDay === 'today'
    ? now.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'short' })
    : tomorrow.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'short' });

  // Group by company
  const companyMap: Record<string, CandidateApplication[]> = {};
  activeInterviews.forEach((c) => {
    const comp = c.companyName || 'General';
    if (!companyMap[comp]) companyMap[comp] = [];
    companyMap[comp].push(c);
  });

  const canDispatchWhatsApp = currentUser?.role === 'admin' || currentUser?.role === 'account_manager';

  if (todayInterviews.length === 0 && tomorrowInterviews.length === 0) {
    return (
      <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900/60 dark:via-slate-900 dark:to-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                جدول المقابلات اليوم وغداً ({activeDateLabel})
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                لا توجد مقابلات مجدولة مسجلة لليوم أو الغد حتى الآن. المقابلات المجدولة ستظهر تلقائياً هنا فور حجز موعدها.
              </p>
            </div>
          </div>
          {onOpenCalendar && (
            <button
              onClick={onOpenCalendar}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>فتح تقويم المقابلات الكامل</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-red-500/10 via-rose-500/5 to-amber-500/10 dark:from-red-950/30 dark:via-rose-950/20 dark:to-amber-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl p-4 shadow-xs transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>📋 تنبيه المقابلات القادمة</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-red-600 text-white shadow-2xs">
                  {activeInterviews.length} مقابلات
                </span>
              </h3>

              {/* Day Toggle Tabs */}
              <div className="inline-flex rounded-lg border border-red-200 dark:border-red-900/50 p-0.5 bg-white/80 dark:bg-slate-900/80 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedDay('today')}
                  className={`px-2.5 py-0.5 rounded-md font-bold transition-all flex items-center gap-1 ${
                    selectedDay === 'today'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-red-600'
                  }`}
                >
                  <span>اليوم</span>
                  <span className="text-[10px] opacity-90 font-mono">({todayInterviews.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDay('tomorrow')}
                  className={`px-2.5 py-0.5 rounded-md font-bold transition-all flex items-center gap-1 ${
                    selectedDay === 'tomorrow'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-red-600'
                  }`}
                >
                  <span>غداً</span>
                  <span className="text-[10px] opacity-90 font-mono">({tomorrowInterviews.length})</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                ({activeDateLabel})
              </span>
            </div>
            
            {/* Company Breakdown Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {Object.keys(companyMap).length > 0 ? (
                Object.entries(companyMap).map(([comp, cands]) => (
                  <span
                    key={comp}
                    className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] font-bold text-slate-800 dark:text-slate-200 shadow-2xs"
                  >
                    {comp}: <strong className="text-red-600 dark:text-red-400 font-mono">{cands.length}</strong>
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-500 italic">
                  لا توجد مقابلات مسجلة لهذا اليوم المختار.
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {onOpenCalendar && (
            <button
              onClick={onOpenCalendar}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5 text-red-500" />
              <span>التقويم التفاعلي</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
          {activeInterviews.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-xs"
            >
              <span>{isExpanded ? 'إخفاء التفاصيل' : 'عرض المرشحين'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Candidate List */}
      {isExpanded && activeInterviews.length > 0 && (
        <div className="mt-4 pt-3 border-t border-red-200/60 dark:border-red-900/40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 animate-in fade-in duration-200">
          {activeInterviews.map((c) => (
            <div
              key={c.id}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0">
                <div className="font-bold text-slate-900 dark:text-white truncate">
                  {c.fullName}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {c.companyName} • <span className="font-mono text-slate-600 dark:text-slate-300">{c.interviewSlotDetails || 'محدد بالموعد'}</span>
                </div>
                <div className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                  ريكروتر: {c.recruiterName}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {canDispatchWhatsApp && (
                  <a
                    href={`https://wa.me/2${c.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 transition-colors"
                    title="محادثة واتساب"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                )}
                {onSelectCandidate && (
                  <button
                    onClick={() => onSelectCandidate(c)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-colors"
                  >
                    تفاصيل
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
