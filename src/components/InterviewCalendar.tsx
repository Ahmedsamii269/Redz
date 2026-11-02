import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Building2,
  User as UserIcon,
  MessageSquare,
  Volume2,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { CandidateApplication, CompanyOffer, User, StatusConfig } from '../types';
import { StatusBadge } from './StatusBadge';

interface InterviewCalendarProps {
  candidates: CandidateApplication[];
  offers: CompanyOffer[];
  recruiters: User[];
  currentUser: User | null;
  statuses: StatusConfig[];
  onSelectCandidateForAudio?: (candidate: CandidateApplication) => void;
  onSelectCandidateForStatus?: (candidate: CandidateApplication) => void;
}

export const InterviewCalendar: React.FC<InterviewCalendarProps> = ({
  candidates,
  offers,
  recruiters,
  currentUser,
  statuses,
  onSelectCandidateForAudio,
  onSelectCandidateForStatus,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [filterCompany, setFilterCompany] = useState<string>('ALL');
  const [filterRecruiter, setFilterRecruiter] = useState<string>('ALL');

  const canDispatchWhatsApp = currentUser?.role === 'admin' || currentUser?.role === 'account_manager';

  // Extract year and month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month (0: Sun, 1: Mon, ..., 6: Sat)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Filter candidate interviews
  const scheduledCandidates = candidates.filter((c) => {
    if (c.status !== 'Upcoming Interview' && !c.scheduledDate) return false;
    if (filterCompany !== 'ALL' && c.companyName !== filterCompany) return false;
    if (filterRecruiter !== 'ALL' && c.recruiterId !== filterRecruiter) return false;
    return true;
  });

  // Map candidates by date string (YYYY-MM-DD)
  const candidatesByDate: Record<string, CandidateApplication[]> = {};
  scheduledCandidates.forEach((c) => {
    let dateStr = '';
    if (c.scheduledDate) {
      dateStr = c.scheduledDate.split('T')[0];
    } else if (c.createdAt) {
      dateStr = c.createdAt.split('T')[0];
    }
    if (dateStr) {
      if (!candidatesByDate[dateStr]) candidatesByDate[dateStr] = [];
      candidatesByDate[dateStr].push(c);
    }
  });

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDayStr(today.toISOString().split('T')[0]);
  };

  const monthNames = [
    'January / يناير',
    'February / فبراير',
    'March / مارس',
    'April / أبريل',
    'May / مايو',
    'June / يونيو',
    'July / يوليو',
    'August / أغسطس',
    'September / سبتمبر',
    'October / أكتوبر',
    'November / نوفمبر',
    'December / ديسمبر',
  ];

  const weekDayNames = ['Sun / أحد', 'Mon / اثنين', 'Tue / ثلاثاء', 'Wed / أربعاء', 'Thu / خميس', 'Fri / جمعة', 'Sat / سبت'];

  // Days in selected date
  const selectedDayCandidates = candidatesByDate[selectedDayStr] || [];

  return (
    <div className="space-y-4">
      {/* Calendar Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={prevMonth}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-xs font-bold rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
            {monthNames[month]} {year}
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value="ALL">All Companies (جميع الشركات)</option>
            {offers.map((o) => (
              <option key={o.id} value={o.companyName}>
                {o.companyName}
              </option>
            ))}
          </select>

          {currentUser?.role === 'admin' && (
            <select
              value={filterRecruiter}
              onChange={(e) => setFilterRecruiter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="ALL">All Recruiters (كل الريكروترز)</option>
              {recruiters.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.fullName} (@{r.referralCode})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Calendar Grid (2 Cols on lg) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-400 dark:text-slate-500 mb-2">
            {weekDayNames.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Empty prefix cells for start of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[95px] rounded-xl bg-slate-50/40 dark:bg-slate-950/20" />
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const formattedDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayCandidates = candidatesByDate[formattedDayStr] || [];
              const isToday = formattedDayStr === new Date().toISOString().split('T')[0];
              const isSelected = formattedDayStr === selectedDayStr;

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDayStr(formattedDayStr)}
                  className={`min-h-[70px] sm:min-h-[95px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-red-600 bg-red-50/40 dark:bg-red-950/20 shadow-xs'
                      : isToday
                      ? 'border-amber-400 bg-amber-50/30 dark:bg-amber-950/20'
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-red-600 text-white'
                          : isSelected
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {dayCandidates.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
                        {dayCandidates.length}
                      </span>
                    )}
                  </div>

                  {/* Candidate Pills */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayCandidates.slice(0, 2).map((cand) => (
                      <div
                        key={cand.id}
                        className="truncate text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                      >
                        {cand.fullName.split(' ')[0]} ({cand.companyName.split(' ')[0]})
                      </div>
                    ))}
                    {dayCandidates.length > 2 && (
                      <div className="text-[9px] text-slate-400 font-bold px-1">
                        +{dayCandidates.length - 2} more...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Drawer (1 Col on lg) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {new Date(selectedDayStr).toLocaleDateString('ar-EG', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </h3>
                  <div className="text-[11px] text-slate-500 font-mono">{selectedDayStr}</div>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {selectedDayCandidates.length} Interviews
              </span>
            </div>

            {/* Candidates list for selected day */}
            <div className="mt-4 space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {selectedDayCandidates.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>لا توجد مقابلات مجدولة في هذا اليوم.</p>
                </div>
              ) : (
                selectedDayCandidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2 hover:border-red-300 dark:hover:border-red-800 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          {cand.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{cand.phone}</div>
                      </div>
                      <StatusBadge status={cand.status} statuses={statuses} size="sm" />
                    </div>

                    <div className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Building2 className="w-3.5 h-3.5 text-red-600" />
                        <span>{cand.companyName}</span> • <span className="text-slate-500 font-normal">{cand.offerTitle}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cand.interviewSlotDetails}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>Recruiter: {cand.recruiterName}</span>
                      </div>
                    </div>

                    {/* Quick actions for candidate */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {onSelectCandidateForAudio && cand.vocarooUrl && (
                          <button
                            onClick={() => onSelectCandidateForAudio(cand)}
                            className="px-2 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 text-[10px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Voice</span>
                          </button>
                        )}
                        {canDispatchWhatsApp && (
                          <a
                            href={`https://wa.me/2${cand.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 transition-colors"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {onSelectCandidateForStatus && (
                        <button
                          onClick={() => onSelectCandidateForStatus(cand)}
                          className="px-2.5 py-1 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold hover:opacity-90 transition-opacity"
                        >
                          تحديث الحالة
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
