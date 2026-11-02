import React, { useState, useMemo } from 'react';
import {
  CandidateApplication,
  StatusConfig,
  User,
} from '../types';
import { StatusBadge } from './StatusBadge';
import { DuplicateComparisonModal } from './DuplicateComparisonModal';
import { 
  Edit, 
  Volume2, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Trash2, 
  RefreshCcw,
  Search,
  Filter,
  CheckSquare,
  Clock,
  AlertTriangle,
  MapPin,
  Building2,
  Phone
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CandidatesTableProps {
  candidates: CandidateApplication[];
  statuses: StatusConfig[];
  isManagementView: boolean;
  recruiters: User[];
  selectedIds: string[];
  onToggleCandidate: (id: string) => void;
  onToggleAll: () => void;
  onUpdateStatus?: (appId: string, newStatus: string, note?: string, scheduledDate?: string) => void;
  onBulkUpdateStatus?: (ids: string[], newStatus: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  setSelectedCandidateForAudio: (cand: CandidateApplication | null) => void;
  setSelectedCandidateForStatusChange: (cand: CandidateApplication | null) => void;
  setSelectedCandidateForHistory: (cand: CandidateApplication | null) => void;
  currentUser: User | null;
}

export const CandidatesTable: React.FC<CandidatesTableProps> = ({
  candidates,
  statuses,
  isManagementView,
  recruiters,
  selectedIds,
  onToggleCandidate,
  onToggleAll,
  onUpdateStatus,
  onBulkUpdateStatus,
  onBulkDelete,
  setSelectedCandidateForAudio,
  setSelectedCandidateForStatusChange,
  setSelectedCandidateForHistory,
  currentUser,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDuplicatesOnly, setFilterDuplicatesOnly] = useState(false);
  const [selectedDuplicatePhone, setSelectedDuplicatePhone] = useState<string | null>(null);

  // Compute duplicate candidate occurrences by normalized phone digits
  const phoneDuplicatesMap = useMemo(() => {
    const map: Record<string, CandidateApplication[]> = {};
    candidates.forEach((c) => {
      const clean = (c.phone || '').replace(/\D/g, '');
      if (clean) {
        if (!map[clean]) map[clean] = [];
        map[clean].push(c);
      }
    });
    return map;
  }, [candidates]);

  const totalDuplicatesCount = useMemo(() => {
    return Object.values(phoneDuplicatesMap).filter((list) => list.length > 1).length;
  }, [phoneDuplicatesMap]);

  // Filtering
  const filteredCandidates = candidates.filter((cand) => {
    const clean = (cand.phone || '').replace(/\D/g, '');
    const isDup = (phoneDuplicatesMap[clean] || []).length > 1;
    if (filterDuplicatesOnly && !isDup) return false;

    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    return (
      cand.fullName.toLowerCase().includes(term) ||
      cand.phone.includes(term) ||
      cand.offerTitle.toLowerCase().includes(term) ||
      (cand.companyName && cand.companyName.toLowerCase().includes(term))
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + itemsPerPage);

  const exportToExcel = () => {
    const dataToExport = (selectedIds.length > 0 ? candidates.filter(c => selectedIds.includes(c.id)) : candidates).map(c => ({
      'Full Name': c.fullName,
      'Phone': c.phone,
      'Email': c.email,
      'Offer': c.offerTitle,
      'Company': c.companyName,
      'Status': statuses.find(s => s.key === c.status)?.labelEn || c.status,
      'Recruiter': c.recruiterName,
      'Interview Slot': c.interviewSlotDetails,
      'Created At': new Date(c.createdAt).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Candidates");
    XLSX.writeFile(wb, `Candidates_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Search & Bulk Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white"
            />
          </div>

          {totalDuplicatesCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setFilterDuplicatesOnly(!filterDuplicatesOnly);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                filterDuplicatesOnly
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}
              title="Show only duplicate candidate applications"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>المكررين فقط ({totalDuplicatesCount})</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
              <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md border border-red-100 dark:border-red-900/30">
                {selectedIds.length} Selected
              </span>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
              <button
                onClick={exportToExcel}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Export Selected"
              >
                <Download className="w-4 h-4" />
              </button>
              {onBulkDelete && (
                <button
                  onClick={() => {
                    if (confirm(`Delete ${selectedIds.length} candidates?`)) onBulkDelete(selectedIds);
                  }}
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete Selected"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              {onBulkUpdateStatus && (
                <select
                  onChange={(e) => onBulkUpdateStatus(selectedIds, e.target.value)}
                  className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-red-500"
                  defaultValue=""
                >
                  <option value="" disabled>Change Status...</option>
                  {statuses.map(s => (
                    <option key={s.key} value={s.key}>{s.labelEn}</option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-lg hover:opacity-90 transition-opacity shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export All to Excel
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {/* Desktop Table View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-4 px-4 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === paginatedCandidates.length && paginatedCandidates.length > 0} 
                    onChange={onToggleAll}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                </th>
                <th className="py-4 px-4">Candidate</th>
                <th className="py-4 px-4">Company & Role</th>
                {isManagementView && <th className="py-4 px-4">Recruiter</th>}
                <th className="py-4 px-4">Interview Slot</th>
                <th className="py-4 px-4">Voice Note</th>
                <th className="py-4 px-4">Current Status</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={isManagementView ? 8 : 7} className="py-12 text-center text-slate-400">
                    No candidates found.
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((cand) => {
                  const clean = (cand.phone || '').replace(/\D/g, '');
                  const dupList = phoneDuplicatesMap[clean] || [];
                  const isDup = dupList.length > 1;

                  return (
                    <tr key={cand.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="py-4 px-4">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(cand.id)} 
                          onChange={() => onToggleCandidate(cand.id)}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">{cand.fullName}</span>
                          {isDup && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDuplicatePhone(cand.phone);
                              }}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 dark:text-amber-400 border border-amber-300 dark:border-amber-800 cursor-pointer transition-colors"
                              title="اضغط هنا لمقارنة جميع تقديمات هذا المرشح"
                            >
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                              <span>مكرر ({dupList.length}x) 🔍</span>
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono">{cand.phone}</span>
                          <span>·</span>
                          <span className="truncate max-w-[100px]">{cand.residence}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{cand.companyName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[150px]">
                          {cand.offerTitle}
                        </div>
                      </td>
                      {isManagementView && (
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-[10px] font-bold text-red-600">
                              {cand.recruiterName.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{cand.recruiterName}</span>
                          </div>
                        </td>
                      )}
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200 text-[11px] flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {cand.interviewSlotDetails}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => setSelectedCandidateForAudio(cand)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-lg font-bold transition-all text-[10px] active:scale-95"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>LISTEN</span>
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1.5">
                          <StatusBadge status={cand.status} statuses={statuses} size="sm" />
                          <button
                            onClick={() => setSelectedCandidateForHistory(cand)}
                            className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors font-medium hover:underline text-left"
                            title="عرض سجل تاريخ التغييرات والملاحظات"
                          >
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>سجل الحالة (History)</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {onUpdateStatus && (
                            <button
                              onClick={() => setSelectedCandidateForStatusChange(cand)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                              title="Quick Status Update"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {(currentUser?.role === 'admin' || currentUser?.role === 'account_manager') && (
                            <a
                              href={`https://wa.me/2${cand.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                              title="WhatsApp Candidate"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards View (< md) */}
        <div className="block md:hidden p-3.5 space-y-3">
          {paginatedCandidates.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              No candidates found.
            </div>
          ) : (
            paginatedCandidates.map((cand) => {
              const clean = (cand.phone || '').replace(/\D/g, '');
              const dupList = phoneDuplicatesMap[clean] || [];
              const isDup = dupList.length > 1;

              return (
                <div
                  key={cand.id}
                  className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(cand.id)}
                        onChange={() => onToggleCandidate(cand.id)}
                        className="rounded border-slate-300 text-red-600 focus:ring-red-500 mt-0.5"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            {cand.fullName}
                          </span>
                          {isDup && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDuplicatePhone(cand.phone);
                              }}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 dark:text-amber-400 border border-amber-300 dark:border-amber-800 cursor-pointer transition-colors"
                              title="اضغط هنا لمقارنة جميع تقديمات هذا المرشح"
                            >
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                              <span>مكرر ({dupList.length}x) 🔍</span>
                            </button>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {cand.phone} • {cand.residence}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={cand.status} statuses={statuses} size="sm" />
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {cand.companyName} • <span className="text-slate-500 font-normal">{cand.offerTitle}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[10px] pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {cand.interviewSlotDetails}
                      </span>
                      {isManagementView && (
                        <span className="font-medium text-red-600 dark:text-red-400">
                          Recruiter: {cand.recruiterName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedCandidateForAudio(cand)}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>LISTEN</span>
                      </button>

                      <button
                        onClick={() => setSelectedCandidateForHistory(cand)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-[10px] flex items-center gap-1 transition-colors"
                        title="عرض سجل تاريخ التغييرات والملاحظات"
                      >
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>السجل</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {onUpdateStatus && (
                        <button
                          onClick={() => setSelectedCandidateForStatusChange(cand)}
                          className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[11px] font-bold transition-all shadow-xs"
                        >
                          تحديث الحالة
                        </button>
                      )}
                      {(currentUser?.role === 'admin' || currentUser?.role === 'account_manager') && (
                        <a
                          href={`https://wa.me/2${cand.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 transition-colors"
                          title="WhatsApp Candidate"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 font-medium">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCandidates.length)} of {filteredCandidates.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                    currentPage === page 
                      ? "bg-red-600 text-white shadow-md" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Duplicate Applications Comparison Modal */}
      <DuplicateComparisonModal
        isOpen={Boolean(selectedDuplicatePhone)}
        onClose={() => setSelectedDuplicatePhone(null)}
        candidatePhone={selectedDuplicatePhone}
        allCandidates={candidates}
        statuses={statuses}
        currentUser={currentUser}
        onSelectCandidateForAudio={setSelectedCandidateForAudio}
        onSelectCandidateForStatus={setSelectedCandidateForStatusChange}
      />
    </div>
  );
};
