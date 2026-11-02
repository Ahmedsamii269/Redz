import React, { useState, useEffect } from 'react';
import { X, Clock, Check, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { CandidateApplication, StatusConfig, User, CompanyOffer } from '../types';
import { StatusBadge } from './StatusBadge';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateApplication | null;
  statuses: StatusConfig[];
  offers: CompanyOffer[];
  currentUser: User | null;
  onSaveStatus: (appId: string, newStatus: string, note?: string, scheduledDate?: string) => void;
}

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  onClose,
  candidate,
  statuses,
  offers,
  currentUser,
  onSaveStatus,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>(candidate?.status || '');
  const [feedbackNote, setFeedbackNote] = useState<string>(candidate?.feedbackNotes || '');
  const [scheduledDate, setScheduledDate] = useState<string>(candidate?.scheduledDate || '');
  
  // Scheduling Helper State
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const currentOffer = offers.find(o => o.id === candidate?.offerId || o.id === candidate?.companyId);
  const rules = currentOffer?.schedulingRules;

  // Initialize selected day/time if scheduledDate exists
  useEffect(() => {
    if (candidate?.scheduledDate) {
      const d = new Date(candidate.scheduledDate);
      if (!isNaN(d.getTime())) {
        setSelectedDay(d.toISOString().split('T')[0]);
        setSelectedTime(d.toTimeString().slice(0, 5));
      }
    }
  }, [candidate?.scheduledDate]);

  // Synchronize state when candidate changes
  useEffect(() => {
    if (candidate) {
      setSelectedStatus(candidate.status);
      setFeedbackNote(candidate.feedbackNotes || '');
      setScheduledDate(candidate.scheduledDate || '');
    }
  }, [candidate?.id, candidate?.status, candidate?.feedbackNotes, candidate?.scheduledDate]);

  if (!isOpen || !candidate) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;

    let finalDate = scheduledDate;
    if (selectedStatus === 'Upcoming Interview' && selectedDay && selectedTime) {
      finalDate = `${selectedDay}T${selectedTime}:00`;
    }

    onSaveStatus(candidate.id, selectedStatus, feedbackNote.trim() || undefined, finalDate || undefined);
    onClose();
  };

  // Generate next 14 available dates
  const getAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    
    for (let i = 0; i < 30 && dates.length < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const dayOfWeek = d.getDay();
      
      if (rules?.allowedDays.includes(dayOfWeek)) {
        dates.push(new Date(d));
      }
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Update Status & Recruiter Feedback</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Candidate: <span className="font-semibold text-slate-800">{candidate.fullName}</span> · Ref:{' '}
              <span className="font-mono text-slate-700">{candidate.referenceCode}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Quick info row */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Company & Role:</span>
              <span className="font-bold text-slate-900">{candidate.companyName}</span>
              <span className="text-slate-500 mx-1.5">·</span>
              <span className="text-slate-600">{candidate.offerTitle}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Recruiter:</span>
              <span className="font-semibold text-red-600">
                {candidate.recruiterName} (@{candidate.recruiterCode})
              </span>
            </div>
          </div>

          {/* Current Status Display */}
          <div>
            <span className="block font-semibold text-slate-700 mb-1.5">Current Status:</span>
            <StatusBadge status={candidate.status} statuses={statuses} size="md" />
          </div>

          {/* New Status Picker */}
          <div>
            <label className="block font-bold text-slate-900 mb-2">
              Select New Feedback Status *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {statuses.map((st) => {
                const isSelected = selectedStatus === st.key;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStatus(st.key)}
                    className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-red-600 bg-red-50/70 font-bold shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                      <span className="text-xs text-slate-900">{st.labelEn || st.labelAr}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-red-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Date Picker for Upcoming Interview */}
          {selectedStatus === 'Upcoming Interview' && rules && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
              <div className="flex items-center gap-2 text-blue-900 font-bold mb-2">
                <CalendarIcon className="w-4 h-4" />
                <span>Scheduling Interview for {candidate.companyName}</span>
              </div>

              {/* Day Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-blue-800 mb-1.5">
                  1. Choose available day ({rules.allowedDays.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}):
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableDates.map((date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isSel = selectedDay === dateStr;
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => setSelectedDay(dateStr)}
                        className={`px-3 py-2 rounded-lg border text-center transition-all ${
                          isSel
                            ? 'bg-blue-600 text-white border-blue-700 font-bold shadow-sm'
                            : 'bg-white text-slate-700 border-blue-200 hover:bg-blue-100'
                        }`}
                      >
                        <div className="text-[10px] uppercase font-bold">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-xs">{date.getDate()} {date.toLocaleDateString('en-US', { month: 'short' })}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              {rules.mode !== 'Flexible' ? (
                <div>
                  <label className="block text-[11px] font-semibold text-blue-800 mb-1.5">
                    2. Choose interview time ({rules.startTime} – {rules.endTime}):
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(() => {
                      const times = [];
                      const [startH, startM] = (rules.startTime || '09:00').split(':').map(Number);
                      const [endH, endM] = (rules.endTime || '17:00').split(':').map(Number);
                      
                      let currentH = startH;
                      let currentM = startM;
                      
                      while (currentH < endH || (currentH === endH && currentM <= endM)) {
                        const t = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
                        times.push(t);
                        currentM += 30;
                        if (currentM >= 60) {
                          currentM = 0;
                          currentH += 1;
                        }
                      }
                      
                      return times.map(t => {
                        const isSel = selectedTime === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedTime(t)}
                            className={`p-2 rounded border text-center transition-all text-[11px] font-mono ${
                              isSel
                                ? 'bg-blue-600 text-white border-blue-700 font-bold'
                                : 'bg-white text-slate-700 border-blue-200 hover:bg-blue-100'
                            }`}
                          >
                            {t}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white rounded border border-blue-200">
                  <label className="block text-[11px] font-semibold text-blue-800 mb-1.5">
                    2. Select approximate time (HR will coordinate):
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-2 rounded border border-blue-200 text-xs"
                  />
                  <p className="text-[10px] text-blue-600 mt-1">
                    For {candidate.companyName}, HR manually coordinates the final time with the candidate.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Feedback Note Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-900">
                Feedback Notes & Instructions
              </label>
              <div className="flex flex-wrap gap-1">
                {['English Level', 'Accent Issue', 'Underage', 'No Show', 'Overqualified', 'Location mismatch'].map((tmpl) => (
                  <button
                    key={tmpl}
                    type="button"
                    onClick={() => {
                      const prefix = feedbackNote ? (feedbackNote.endsWith('.') || feedbackNote.endsWith(' ') ? '' : '. ') : '';
                      setFeedbackNote(prev => prev + prefix + tmpl);
                    }}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-red-50 text-[10px] font-medium text-slate-600 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded transition-all"
                  >
                    + {tmpl}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={3}
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="e.g. Excellent English C1 accent, confirmed for Tuesday interview at 1 PM..."
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Click the templates above to quickly add common rejection or feedback reasons.
            </p>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedStatus === 'Upcoming Interview' && (!selectedDay || !selectedTime)}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all shadow-md disabled:opacity-50"
            >
              Update Status & Sync
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
