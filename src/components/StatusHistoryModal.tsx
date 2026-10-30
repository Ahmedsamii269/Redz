import React from 'react';
import { X, Clock } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">Status History: {candidate.fullName}</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">
          <div className="space-y-4">
            {candidate.statusHistory?.map((entry, idx) => (
              <div key={idx} className="flex gap-3 text-xs">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  {idx < candidate.statusHistory.length - 1 && (
                    <div className="w-0.5 grow bg-slate-100" />
                  )}
                </div>
                <div className="pb-4">
                  <StatusBadge status={entry.status} statuses={statuses} size="sm" />
                  <p className="text-slate-700 mt-1 font-medium">{entry.note}</p>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(entry.timestamp).toLocaleString()} by {entry.changedBy} ({entry.changedByRole})
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
