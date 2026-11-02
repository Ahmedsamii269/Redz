import React from 'react';
import { X, Clock, User, ShieldCheck } from 'lucide-react';
import { CandidateApplication, StatusConfig } from '../types';
import { StatusBadge } from './StatusBadge';

interface StatusHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateApplication | null;
  statuses: StatusConfig[];
}

export const StatusHistoryModal: React.FC<StatusHistoryModalProps> = ({
  isOpen,
  onClose,
  candidate,
  statuses,
}) => {
  if (!isOpen || !candidate) return null;

  const historyList = candidate.statusHistory && candidate.statusHistory.length > 0
    ? candidate.statusHistory
    : [
        {
          status: candidate.status || 'Pending Feedback',
          changedBy: candidate.recruiterName || 'System',
          changedByRole: 'recruiter' as const,
          timestamp: candidate.createdAt || new Date().toISOString(),
          note: 'تقديم الطلب الأولي وتصنيف المرشح',
        },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">سجل وتاريخ تغييرات الحالة (Status History)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200">{candidate.fullName}</span> · كود: <span className="font-mono text-red-600 font-bold">{candidate.referenceCode}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="p-3 bg-red-50/60 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/40 text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">الشركة والوظيفة:</span>
              <span className="font-bold text-slate-900 dark:text-white">{candidate.companyName}</span> · {candidate.offerTitle}
            </div>
            <div className="text-right">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">مسؤول التوظيف:</span>
              <span className="font-bold text-red-600 dark:text-red-400">{candidate.recruiterName}</span>
            </div>
          </div>

          <div className="relative pl-3 pr-1 pt-2 space-y-5">
            {historyList.map((entry, idx) => (
              <div key={idx} className="flex gap-3 text-xs">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-800">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  {idx < historyList.length - 1 && (
                    <div className="w-0.5 grow bg-slate-200 dark:bg-slate-800 my-1" />
                  )}
                </div>
                <div className="pb-2 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={entry.status} statuses={statuses} size="sm" />
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(entry.timestamp).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="text-slate-700 dark:text-slate-300 mt-2 font-medium bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs leading-relaxed">
                      {entry.note}
                    </p>
                  )}
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>بواسطة: <strong className="text-slate-600 dark:text-slate-400">{entry.changedBy}</strong> ({entry.changedByRole})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
