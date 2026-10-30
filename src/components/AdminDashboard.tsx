import React, { useState } from 'react';
import {
  Users,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Plus,
  Share2,
  Volume2,
  Phone,
  MessageSquare,
  Edit,
  Trash2,
  Download,
  Tag,
  Briefcase,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  UserCheck,
  RefreshCw,
  Sparkles,
  Coins,
  X,
  Trophy,
  Medal,
  Award,
  Crown,
} from 'lucide-react';
import { CandidateApplication, CompanyOffer, StatusConfig, User } from '../types';
import * as XLSX from 'xlsx';
import { StatusBadge } from './StatusBadge';
import { AudioPlayerModal } from './AudioPlayerModal';
import { StatusChangeModal } from './StatusChangeModal';
import { OfferModal } from './OfferModal';
import { RecruiterModal } from './RecruiterModal';
import { StatusModal } from './StatusModal';
import { ReferralLinkModal } from './ReferralLinkModal';
import { SocialPostModal } from './SocialPostModal';
import { AdminSecurityModal } from './AdminSecurityModal';
import { WhatsAppDispatchModal } from './WhatsAppDispatchModal';
import { RedzLogo } from './RedzLogo';
import { OfferCard } from './OfferCard';
import { Leaderboard } from './Leaderboard';
import { CandidateEditModal } from './CandidateEditModal';

interface AdminDashboardProps {
  currentUser: User | null;
  candidates: CandidateApplication[];
  offers: CompanyOffer[];
  recruiters: User[];
  statuses: StatusConfig[];
  activeSubTab: 'candidates' | 'offers' | 'all-offers' | 'recruiters' | 'statuses' | 'leaderboard';
  onSubTabChange: (tab: 'candidates' | 'offers' | 'all-offers' | 'recruiters' | 'statuses' | 'leaderboard') => void;
  onUpdateStatus: (appId: string, newStatus: string, note?: string, scheduledDate?: string) => void;
  onUpdateCandidateDetails?: (appId: string, updatedFields: Partial<CandidateApplication>) => void;
  onDeleteApplication: (appId: string) => void;
  onSaveOffer: (offerData: Partial<CompanyOffer> & { title: string; companyName: string }) => void;
  onDeleteOffer: (offerId: string) => void;
  onSaveRecruiter: (recruiterData: Partial<User> & { fullName: string; username: string }) => void;
  onDeleteRecruiter: (recruiterId: string) => void;
  onSaveStatus: (statusData: Partial<StatusConfig> & { labelAr: string; key?: string }) => void;
  onDeleteStatus: (statusKey: string) => void;
  onOpenCandidateView: (offerId: string, recruiterCode: string) => void;
  strictAuthMode: boolean;
  onToggleStrictAuth: (enabled: boolean) => void;
  onUpdateAdminCredentials: (newUsername: string, newPassword: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  candidates,
  offers,
  recruiters,
  statuses,
  activeSubTab,
  onSubTabChange,
  onUpdateStatus,
  onDeleteApplication,
  onSaveOffer,
  onDeleteOffer,
  onSaveRecruiter,
  onDeleteRecruiter,
  onSaveStatus,
  onDeleteStatus,
  onOpenCandidateView,
  strictAuthMode,
  onToggleStrictAuth,
  onUpdateAdminCredentials,
  onNavigateTab,
  onUpdateCandidateDetails,
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('ALL');
  const [selectedRecruiterFilter, setSelectedRecruiterFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Offers Tab Search & Filters
  const [offerSearchQuery, setOfferSearchQuery] = useState('');
  const [offerFilterWorkType, setOfferFilterWorkType] = useState<string>('ALL');
  const [offerFilterAvailability, setOfferFilterAvailability] = useState<string>('ALL');

  // Modals state
  const [selectedCandidateForAudio, setSelectedCandidateForAudio] = useState<CandidateApplication | null>(null);
  const [selectedCandidateForStatus, setSelectedCandidateForStatus] = useState<CandidateApplication | null>(null);
  const [selectedCandidateForEdit, setSelectedCandidateForEdit] = useState<CandidateApplication | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<CompanyOffer | null>(null);
  const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState<User | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOfferForReferral, setSelectedOfferForReferral] = useState<CompanyOffer | null>(null);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [selectedOfferForSocialPost, setSelectedOfferForSocialPost] = useState<CompanyOffer | null>(null);
  const [isSocialPostModalOpen, setIsSocialPostModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // WhatsApp Auto Dispatch state
  const [dispatchCandidate, setDispatchCandidate] = useState<CandidateApplication | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<string>('voice note accepted');
  const [dispatchNote, setDispatchNote] = useState<string | undefined>();

  const handleStatusUpdate = async (appId: string, newStatus: string, note?: string, scheduledDate?: string) => {
    try {
      await onUpdateStatus(appId, newStatus, note, scheduledDate);
      const cand = Array.isArray(candidates) ? candidates.find((c) => c.id === appId) : null;
      if (cand && (newStatus === 'voice note accepted' || newStatus === 'Upcoming Interview')) {
        setDispatchCandidate({ ...cand, status: newStatus, scheduledDate: scheduledDate || cand.scheduledDate });
        setDispatchStatus(newStatus);
        setDispatchNote(note);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status. Please check your connection.');
    }
  };

  // Filter logic
  const filteredCandidates = candidates.filter((cand) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      cand.fullName.toLowerCase().includes(q) ||
      cand.phone.includes(q) ||
      cand.email.toLowerCase().includes(q) ||
      cand.referenceCode.toLowerCase().includes(q) ||
      cand.residence.toLowerCase().includes(q) ||
      (cand.experienceLevel && cand.experienceLevel.toLowerCase().includes(q)) ||
      (cand.experienceDetails && cand.experienceDetails.toLowerCase().includes(q));

    const matchesStatus = selectedStatusFilter === 'ALL' || cand.status === selectedStatusFilter;
    const matchesCompany = selectedCompanyFilter === 'ALL' || cand.companyId === selectedCompanyFilter;
    const matchesRecruiter = selectedRecruiterFilter === 'ALL' || cand.recruiterId === selectedRecruiterFilter;

    return matchesSearch && matchesStatus && matchesCompany && matchesRecruiter;
  });

  // Analytics Metrics
  const totalCount = candidates.length;
  const upcomingCount = candidates.filter((c) => c.status === 'Upcoming Interview').length;
  const voiceAcceptedCount = candidates.filter((c) => c.status === 'voice note accepted').length;
  const acceptedInterviewCount = candidates.filter((c) => c.status === 'Accepted interview').length;
  const inTrainingCount = candidates.filter((c) => c.status === 'in training').length;
  const pendingCount = candidates.filter(
    (c) => c.status === 'Pending Feedback' || c.status === 'No answer to schedule interview date'
  ).length;
  const rejectedCount = candidates.filter(
    (c) => c.status === 'Rejected interview' || c.status === 'vocice note rejected' || c.status === 'No show'
  ).length;

  const exportToCSV = () => {
    const headers = [
      'Reference Code',
      'Name',
      'Phone',
      'Email',
      'Company',
      'Job Title',
      'Recruiter',
      'Status',
      'Graduation Status',
      'Experience Level',
      'Experience Details',
      'Egyptian?',
      'Residence',
      'Interview Slot',
      'Voice Note URL',
      'Feedback Notes',
      'Application Date',
    ];

    const rows = filteredCandidates.map((c) => [
      c.referenceCode,
      `"${c.fullName}"`,
      `="${c.phone}"`,
      c.email,
      `"${c.companyName}"`,
      `"${c.offerTitle}"`,
      `"${c.recruiterName}"`,
      `"${c.status}"`,
      c.graduationStatus === 'graduated' ? 'Graduated' : 'Undergraduate',
      `"${c.experienceLevel || 'Fresh'}"`,
      `"${(c.experienceDetails || '').replace(/"/g, '""')}"`,
      c.isEgyptian ? 'Egyptian' : c.otherNationality || 'Other',
      `"${c.residence}"`,
      `"${c.interviewSlotDetails}"`,
      c.vocarooUrl,
      `"${(c.feedbackNotes || '').replace(/"/g, '""')}"`,
      new Date(c.createdAt).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `REDZ_Candidates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const dataToExport = filteredCandidates.map((c) => ({
      'Reference Code': c.referenceCode,
      'Name': c.fullName,
      'Phone': c.phone,
      'Email': c.email,
      'Company': c.companyName,
      'Job Title': c.offerTitle,
      'Recruiter': c.recruiterName,
      'Status': c.status,
      'Graduation Status': c.graduationStatus === 'graduated' ? 'Graduated' : 'Undergraduate',
      'Experience Level': c.experienceLevel || 'Fresh',
      'Experience Details': c.experienceDetails || '',
      'Nationality': c.isEgyptian ? 'Egyptian' : c.otherNationality || 'Other',
      'Residence': c.residence,
      'Interview Slot': c.interviewSlotDetails,
      'Voice Note URL': c.vocarooUrl,
      'Feedback Notes': c.feedbackNotes || '',
      'Application Date': new Date(c.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates');
    XLSX.writeFile(workbook, `REDZ_Candidates_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* CEO Brand Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 rounded-2xl text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-red-900/30">
        <div className="flex items-center gap-4">
          <RedzLogo size="md" theme="dark" className="rounded-xl shadow-lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Executive Management Hub</h1>
              <span className="text-[11px] bg-red-600/30 text-red-200 border border-red-500/40 px-2.5 py-0.5 rounded-full font-semibold">
                Founder & CEO
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {(() => {
                const hour = new Date().getHours();
                const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
                return `${greeting}, `;
              })()}
              <span className="font-semibold text-white">{currentUser?.fullName || 'Ahmed Samii'}</span>. 
              Live agency pipeline, recruiter tracking, and instant candidate feedback for today.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSecurityModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
            title="Manage security & password"
          >
            <span>Security & Credentials</span>
          </button>
          <button
            onClick={() => {
              setEditingOffer(null);
              setIsOfferModalOpen(true);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            + Add Job Offer
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-[11px] font-medium block">Total Candidates</span>
          <span className="text-xl font-bold text-slate-900 font-mono">{totalCount}</span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-amber-600 text-[11px] font-medium block">Pending Feedback</span>
          <span className="text-xl font-bold text-amber-700 font-mono">{pendingCount}</span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-blue-600 text-[11px] font-medium block">Upcoming Interview</span>
          <span className="text-xl font-bold text-blue-700 font-mono">{upcomingCount}</span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-emerald-600 text-[11px] font-medium block">Voice Accepted</span>
          <span className="text-xl font-bold text-emerald-700 font-mono">{voiceAcceptedCount}</span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-green-700 text-[11px] font-medium block">Accepted Interview</span>
          <span className="text-xl font-bold text-green-800 font-mono">{acceptedInterviewCount}</span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-teal-600 text-[11px] font-medium block">In Training</span>
          <span className="text-xl font-bold text-teal-700 font-mono">{inTrainingCount}</span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-red-600 text-[11px] font-medium block">Rejected / No Show</span>
          <span className="text-xl font-bold text-red-700 font-mono">{rejectedCount}</span>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => onSubTabChange('candidates')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeSubTab === 'candidates'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Candidates Pipeline ({candidates.length})
        </button>
        <button
          onClick={() => onSubTabChange('offers')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeSubTab === 'offers'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Company Offers & Slots ({offers.length})
        </button>
        <button
          onClick={() => onSubTabChange('all-offers')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeSubTab === 'all-offers'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Share2 className="w-4 h-4" />
          All Offers View ({offers.length})
        </button>
        <button
          onClick={() => onSubTabChange('recruiters')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeSubTab === 'recruiters'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Recruiters Team ({recruiters.length})
        </button>
        <button
          onClick={() => onSubTabChange('statuses')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeSubTab === 'statuses'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          Feedback Pipeline ({statuses.length})
        </button>
        <button
          onClick={() => onSubTabChange('leaderboard')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeSubTab === 'leaderboard'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          Leaderboard ( Rankings )
        </button>
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('commissions')}
            className="px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
          >
            <Coins className="w-4 h-4 text-red-600" />
            Commission Rates
          </button>
        )}
      </div>

      {/* Tab 1: Candidates Management */}
      {activeSubTab === 'candidates' && (
        <div className="space-y-4">
          {/* Controls Bar: Search + Filters + CSV Export */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate name, phone, residence, or code..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* View Mode & Export */}
            <div className="flex items-center gap-2">
              <button
                onClick={exportToExcel}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                title="Export filtered candidates to Excel (.xlsx)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={exportToCSV}
                className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                title="Export filtered candidates to CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filter By:
            </span>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium"
            >
              <option value="ALL">All Statuses ({totalCount})</option>
              {statuses.map((st) => (
                <option key={st.id} value={st.key}>
                  {st.labelEn || st.labelAr} ({candidates.filter((c) => c.status === st.key).length})
                </option>
              ))}
            </select>

            {/* Company Filter */}
            <select
              value={selectedCompanyFilter}
              onChange={(e) => setSelectedCompanyFilter(e.target.value)}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium"
            >
              <option value="ALL">All Companies</option>
              {offers.map((off) => (
                <option key={off.id} value={off.id}>
                  {off.companyName}
                </option>
              ))}
            </select>

            {/* Recruiter Filter */}
            <select
              value={selectedRecruiterFilter}
              onChange={(e) => setSelectedRecruiterFilter(e.target.value)}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium"
            >
              <option value="ALL">All Recruiters</option>
              {recruiters.map((rec) => (
                <option key={rec.id} value={rec.id}>
                  {rec.fullName} ({rec.referralCode})
                </option>
              ))}
            </select>

            {(searchQuery || selectedStatusFilter !== 'ALL' || selectedCompanyFilter !== 'ALL' || selectedRecruiterFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatusFilter('ALL');
                  setSelectedCompanyFilter('ALL');
                  setSelectedRecruiterFilter('ALL');
                }}
                className="text-red-600 hover:text-red-700 text-xs font-semibold underline"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Company & Role</th>
                    <th className="py-3 px-4">Assigned Recruiter</th>
                    <th className="py-3 px-4">Voice Note</th>
                    <th className="py-3 px-4">Selected Interview Slot</th>
                    <th className="py-3 px-4">Status & Feedback</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No candidates found matching the selected filters. Share referral links to start receiving applications!
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((cand) => (
                      <tr key={cand.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Candidate */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-xs">{cand.fullName}</div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-mono text-slate-600">{cand.phone}</span>
                            <span>·</span>
                            <span>{cand.residence}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-mono text-red-600 font-semibold">{cand.referenceCode}</span>
                            <span>·</span>
                            <span>{cand.graduationStatus === 'graduated' ? 'Graduated' : 'Student'}</span>
                            <span>·</span>
                            <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                              Exp: {cand.experienceLevel || 'Fresh'}
                            </span>
                            {cand.experienceDetails && (
                              <span className="text-slate-500 max-w-[150px] truncate" title={cand.experienceDetails}>
                                ({cand.experienceDetails})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Company & Role */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{cand.companyName}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                            {cand.offerTitle}
                          </div>
                        </td>

                        {/* Recruiter */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">{cand.recruiterName}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono text-slate-400">@{cand.recruiterCode}</span>
                            {(() => {
                              const rec = recruiters.find(r => r.id === cand.recruiterId);
                              if (rec && !rec.teamLeaderId && !rec.unitManagerId && rec.role === 'recruiter') {
                                return (
                                  <span className="text-[9px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded font-bold">
                                    Indirect Team (CEO)
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </td>

                        {/* Voice Note */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1.5">
                            <button
                              onClick={() => setSelectedCandidateForAudio(cand)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md font-medium transition-colors text-[10px]"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>Audio 1 (English)</span>
                            </button>
                            {cand.vocarooUrl2 && (
                              <button
                                onClick={() => setSelectedCandidateForAudio({ ...cand, vocarooUrl: cand.vocarooUrl2! })}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md font-medium transition-colors text-[10px]"
                              >
                                <Volume2 className="w-3 h-3" />
                                <span>Audio 2 (Second Lang)</span>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Interview Slot */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800 text-[11px]">
                            {cand.interviewSlotDetails}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Form Date: {new Date(cand.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        </td>

                        {/* Status & Feedback Notes */}
                        <td className="py-3.5 px-4 max-w-[240px]">
                          <div>
                            <StatusBadge status={cand.status} statuses={statuses} size="sm" />
                          </div>
                          {cand.status === 'Upcoming Interview' && cand.scheduledDate && (
                            <div className="text-[10px] font-bold text-blue-700 mt-1.5 flex flex-wrap items-center justify-between gap-1.5 bg-blue-50/90 p-2 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                <span>
                                  Scheduled: {new Date(cand.scheduledDate).toLocaleString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </span>
                              </div>
                              {(() => {
                                const startDate = new Date(cand.scheduledDate);
                                if (isNaN(startDate.getTime())) return null;
                                const endDate = new Date(startDate.getTime() + 45 * 60 * 1000);
                                const formatIso = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
                                const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Interview: ' + cand.fullName + ' (' + cand.companyName + ')')}&details=${encodeURIComponent('Candidate: ' + cand.fullName + '\nPhone: ' + cand.phone + '\nRef: ' + cand.referenceCode + '\nCompany: ' + cand.companyName + '\nRole: ' + cand.offerTitle + '\nRecruiter: ' + cand.recruiterName)}&dates=${formatIso(startDate)}/${formatIso(endDate)}`;
                                return (
                                  <a
                                    href={gCalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold transition-all shadow-2xs shrink-0"
                                    title="Add interview to Google Calendar"
                                  >
                                    <Calendar className="w-2.5 h-2.5" />
                                    <span>Sync Calendar</span>
                                  </a>
                                );
                              })()}
                            </div>
                          )}
                          {cand.feedbackNotes && (
                            <div className="text-[11px] text-slate-600 italic mt-1 line-clamp-2 bg-slate-50 p-1.5 rounded border border-slate-200/50">
                              "{cand.feedbackNotes}"
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit Data */}
                            <button
                              onClick={() => setSelectedCandidateForEdit(cand)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                              title="Edit candidate data"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Change Status Button */}
                            <button
                              onClick={() => setSelectedCandidateForStatus(cand)}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-[11px] font-bold transition-colors shadow-2xs"
                              title="Update status & give live feedback to recruiter"
                            >
                              Update Status
                            </button>

                            {/* WhatsApp quick chat */}
                            <a
                              href={`https://wa.me/2${cand.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Hello ${cand.fullName}, regarding your application for ${cand.companyName} through REDZ Agency...`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete candidate application "${cand.fullName}"?`)) {
                                  onDeleteApplication(cand.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete candidate"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Offers & Interview Schedules Management */}
      {activeSubTab === 'offers' && (() => {
        const filteredAdminOffers = offers.filter((off) => {
          if (offerFilterAvailability === 'active' && !off.isAvailable) return false;
          if (offerFilterAvailability === 'hold' && off.isAvailable) return false;
          if (offerFilterWorkType !== 'ALL' && off.workType !== offerFilterWorkType) return false;
          if (offerSearchQuery.trim()) {
            const q = offerSearchQuery.toLowerCase();
            const inName = off.companyName.toLowerCase().includes(q);
            const inTitle = off.title.toLowerCase().includes(q);
            const inLoc = (off.location || '').toLowerCase().includes(q);
            const inSalary = (off.salaryPackage || '').toLowerCase().includes(q);
            if (!inName && !inTitle && !inLoc && !inSalary) return false;
          }
          return true;
        });

        const hasOfferFilters =
          offerSearchQuery.trim() !== '' ||
          offerFilterWorkType !== 'ALL' ||
          offerFilterAvailability !== 'ALL';

        const resetOfferFilters = () => {
          setOfferSearchQuery('');
          setOfferFilterWorkType('ALL');
          setOfferFilterAvailability('ALL');
        };

        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Company Offers & Interview Schedules
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                    {offers.length} Configured Offers
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Manage accounts, salary packages, requirements, and candidate interview booking schedules.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={async () => {
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = '.csv,.xlsx';
                    fileInput.onchange = async (e: any) => {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const data = e.target?.result;
                        const workbook = XLSX.read(data, { type: 'array' });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const json = XLSX.utils.sheet_to_json(worksheet);

                        json.forEach((row: any) => {
                          const offerData = {
                            title: row['Offer Details'] || row['Title'] || row['Job Title'] || 'New Job',
                            companyName: row['Company name'] || row['Company'] || 'Unknown',
                            salaryPackage: row['Salary Package'] || row['Salary'] || '',
                            location: row["company's location"] || row['Location'] || 'Cairo',
                            workingHours: row['Working hours'] || row['Hours'] || '',
                            isAvailable: true,
                          };
                          onSaveOffer(offerData);
                        });
                        alert('Offers restored successfully!');
                      };
                      reader.readAsArrayBuffer(file);
                    };
                    fileInput.click();
                  }}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restore CSV
                </button>

                <button
                  onClick={async () => {
                    if (confirm('Run professional text sanitization on all 11 core offers? This fixes garbled emojis and encoding errors.')) {
                      alert('Sanitization process started. Refreshing records...');
                      window.location.reload();
                    }
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Professional Cleanup
                </button>

                <label className="px-3.5 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer">
                  <Download className="w-3.5 h-3.5" />
                  Import CSV
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const data = e.target?.result;
                          const workbook = XLSX.read(data, { type: 'array' });
                          const sheetName = workbook.SheetNames[0];
                          const worksheet = workbook.Sheets[sheetName];
                          const json = XLSX.utils.sheet_to_json(worksheet);

                          json.forEach((row: any) => {
                            const offerData = {
                              title: row['Offer Details'] || 'New Job',
                              companyName: row['Company name'] || 'Unknown',
                              salaryPackage: row['Salary Package'] || '',
                              location: row["company's location"] || 'Cairo',
                              workingHours: row['Working hours'] || '',
                              isAvailable: true,
                            };
                            onSaveOffer(offerData);
                          });
                          alert('Import complete!');
                        };
                        reader.readAsArrayBuffer(file);
                      }
                    }}
                  />
                </label>

                <button
                  onClick={() => {
                    setEditingOffer(null);
                    setIsOfferModalOpen(true);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Offer
                </button>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={offerSearchQuery}
                  onChange={(e) => setOfferSearchQuery(e.target.value)}
                  placeholder="Search company, job position, salary, or location..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Work Type Filter */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {['ALL', 'On-site', 'Hybrid', 'Remote'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setOfferFilterWorkType(type)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
                        offerFilterWorkType === type
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {type === 'ALL' ? 'All Models' : type}
                    </button>
                  ))}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setOfferFilterAvailability('ALL')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
                      offerFilterAvailability === 'ALL'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    All Status
                  </button>
                  <button
                    onClick={() => setOfferFilterAvailability('active')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
                      offerFilterAvailability === 'active'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Active Only
                  </button>
                  <button
                    onClick={() => setOfferFilterAvailability('hold')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
                      offerFilterAvailability === 'hold'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    On Hold
                  </button>
                </div>

                {hasOfferFilters && (
                  <button
                    onClick={resetOfferFilters}
                    className="px-2.5 py-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg font-bold transition-colors flex items-center gap-1"
                    title="Clear offer search and filters"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Grid of Offers */}
            {filteredAdminOffers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">No job offers match your filter</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search terms or clearing work type and status filters.
                </p>
                <button
                  onClick={resetOfferFilters}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {filteredAdminOffers.map((off) => (
                  <OfferCard
                    key={off.id}
                    offer={off}
                    candidateCount={candidates.filter((c) => c.companyId === off.id).length}
                    currentUser={currentUser || ({} as User)}
                    onOpenSocialPost={(o) => {
                      setSelectedOfferForSocialPost(o);
                      setIsSocialPostModalOpen(true);
                    }}
                    onOpenReferralModal={(o) => {
                      setSelectedOfferForReferral(o);
                      setIsReferralModalOpen(true);
                    }}
                    onOpenCandidateView={onOpenCandidateView}
                    onEditOffer={(o) => {
                      setEditingOffer(o);
                      setIsOfferModalOpen(true);
                    }}
                    onDeleteOffer={(id) => onDeleteOffer(id)}
                    isAdmin={true}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Tab: All Offers (Recruiter View) */}
      {activeSubTab === 'all-offers' && (() => {
        const filteredAdminOffers = offers.filter((off) => {
          if (offerFilterAvailability === 'active' && !off.isAvailable) return false;
          if (offerFilterAvailability === 'hold' && off.isAvailable) return false;
          if (offerFilterWorkType !== 'ALL' && off.workType !== offerFilterWorkType) return false;
          if (offerSearchQuery.trim()) {
            const q = offerSearchQuery.toLowerCase();
            const inName = off.companyName.toLowerCase().includes(q);
            const inTitle = off.title.toLowerCase().includes(q);
            const inLoc = (off.location || '').toLowerCase().includes(q);
            const inSalary = (off.salaryPackage || '').toLowerCase().includes(q);
            if (!inName && !inTitle && !inLoc && !inSalary) return false;
          }
          return true;
        });

        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    All Active Offers ({filteredAdminOffers.length})
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Recruiter View
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Quick copy, full edit, deletion, and candidate referral generation
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingOffer(null);
                  setIsOfferModalOpen(true);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Job Offer</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredAdminOffers.map((off) => (
                <OfferCard
                  key={off.id}
                  offer={off}
                  candidateCount={candidates.filter((c) => c.companyId === off.id).length}
                  currentUser={currentUser || ({} as User)}
                  onOpenSocialPost={(o) => {
                    setSelectedOfferForSocialPost(o);
                    setIsSocialPostModalOpen(true);
                  }}
                  onOpenReferralModal={(o) => {
                    setSelectedOfferForReferral(o);
                    setIsReferralModalOpen(true);
                  }}
                  onOpenCandidateView={onOpenCandidateView}
                  onEditOffer={(o) => {
                    setEditingOffer(o);
                    setIsOfferModalOpen(true);
                  }}
                  onDeleteOffer={(id) => onDeleteOffer(id)}
                  isAdmin={true}
                />
              ))}
            </div>
          </div>
        );
      })()}

      {/* Tab: Leaderboard View */}
      {activeSubTab === 'leaderboard' && (
        <Leaderboard 
          candidates={candidates} 
          recruiters={recruiters} 
          isMonthly={true} 
        />
      )}

      {/* Tab 3: Recruiters Accounts Management */}
      {activeSubTab === 'recruiters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Recruiters Team Management</h2>
              <p className="text-xs text-slate-500">
                Create user accounts, set passwords, referral codes, and manage active status
              </p>
            </div>
            <button
              onClick={() => {
                setEditingRecruiter(null);
                setIsRecruiterModalOpen(true);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Recruiter
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Recruiter / User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Team Hierarchy</th>
                  <th className="py-3 px-4">Username & Password</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Referral Code</th>
                  <th className="py-3 px-4">Candidates</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recruiters.map((rec) => {
                  const recCandCount = candidates.filter((c) => c.recruiterId === rec.id).length;
                  const recAcceptedCount = candidates.filter(
                    (c) => c.recruiterId === rec.id && (c.status === 'Accepted interview' || c.status === 'in training')
                  ).length;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {rec.fullName}
                      </td>
                      <td className="py-3.5 px-4">
                        {rec.role === 'admin' && (
                          <span className="text-[10px] bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded font-bold">
                            Founder & CEO
                          </span>
                        )}
                        {rec.role === 'account_manager' && (
                          <span className="text-[10px] bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-bold">
                            Account Manager
                          </span>
                        )}
                        {rec.role === 'unit_manager' && (
                          <span className="text-[10px] bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold">
                            Unit Manager 🏢
                          </span>
                        )}
                        {rec.role === 'team_leader' && (
                          <span className="text-[10px] bg-teal-100 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-bold">
                            Team Leader 👥
                          </span>
                        )}
                        {rec.role === 'recruiter' && (
                          <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-medium">
                            Recruiter
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[11px]">
                        {rec.teamLeaderName && (
                          <div className="text-teal-700 font-semibold">
                            TL: {rec.teamLeaderName}
                          </div>
                        )}
                        {rec.unitManagerName && (
                          <div className="text-blue-700 font-semibold">
                            UM: {rec.unitManagerName}
                          </div>
                        )}
                        {!rec.teamLeaderName && !rec.unitManagerName && rec.role === 'recruiter' && (
                          <div className="text-red-700 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                            Directly Managed (CEO) 👑
                          </div>
                        )}
                        {!rec.teamLeaderName && !rec.unitManagerName && rec.role !== 'recruiter' && (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        <div className="font-semibold text-slate-800">{rec.username}</div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span>{revealedPasswords[rec.id] ? rec.password : '••••••••'}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setRevealedPasswords((prev) => ({
                                ...prev,
                                [rec.id]: !prev[rec.id],
                              }))
                            }
                            className="p-0.5 text-slate-400 hover:text-slate-600 rounded text-[10px] underline"
                          >
                            {revealedPasswords[rec.id] ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-800 font-semibold">
                        {rec.phone || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-bold">
                          {rec.referralCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 font-mono">{recCandCount}</span> candidates
                        {recAcceptedCount > 0 && (
                          <span className="text-[10px] text-emerald-600 block">({recAcceptedCount} accepted)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            rec.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {rec.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingRecruiter(rec);
                              setIsRecruiterModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit account"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {rec.role !== 'admin' && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete account "${rec.fullName}"?`)) {
                                  onDeleteRecruiter(rec.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Status Pipeline Management */}
      {activeSubTab === 'statuses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Feedback & Status Pipeline</h2>
              <p className="text-xs text-slate-500">
                Core feedback statuses with live syncing across all recruiter dashboards
              </p>
            </div>
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Custom Status
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {statuses.map((st) => (
              <div
                key={st.id}
                className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{st.labelEn || st.labelAr}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{st.key}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-500">
                    {candidates.filter((c) => c.status === st.key).length} candidates
                  </span>
                  {!st.isDefault && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete status "${st.labelEn || st.labelAr}"?`)) {
                          onDeleteStatus(st.key);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AudioPlayerModal
        isOpen={Boolean(selectedCandidateForAudio)}
        onClose={() => setSelectedCandidateForAudio(null)}
        vocarooUrl={selectedCandidateForAudio?.vocarooUrl || ''}
        candidateName={selectedCandidateForAudio?.fullName || ''}
        companyName={selectedCandidateForAudio?.companyName || ''}
        showAdminActions={true}
        onAcceptVoice={() => {
          if (selectedCandidateForAudio) {
            handleStatusUpdate(selectedCandidateForAudio.id, 'voice note accepted', 'Voice note accepted after audio evaluation.');
          }
        }}
        onRejectVoice={() => {
          if (selectedCandidateForAudio) {
            handleStatusUpdate(selectedCandidateForAudio.id, 'vocice note rejected', 'Voice note rejected. Language level below requirements.');
          }
        }}
      />

      <StatusChangeModal
        isOpen={Boolean(selectedCandidateForStatus)}
        onClose={() => setSelectedCandidateForStatus(null)}
        candidate={selectedCandidateForStatus}
        statuses={statuses}
        offers={offers}
        currentUser={currentUser}
        onSaveStatus={handleStatusUpdate}
      />

      {/* Auto WhatsApp Dispatch Modal */}
      <WhatsAppDispatchModal
        isOpen={Boolean(dispatchCandidate)}
        onClose={() => setDispatchCandidate(null)}
        candidate={dispatchCandidate}
        newStatus={dispatchStatus}
        note={dispatchNote}
      />

      <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        offerToEdit={editingOffer}
        onSave={onSaveOffer}
      />

      <RecruiterModal
        isOpen={isRecruiterModalOpen}
        onClose={() => setIsRecruiterModalOpen(false)}
        recruiterToEdit={editingRecruiter}
        allUsers={recruiters}
        onSave={onSaveRecruiter}
      />

      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSave={onSaveStatus}
      />

      <ReferralLinkModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        recruiter={currentUser}
        offers={offers}
        initialOffer={selectedOfferForReferral}
        onOpenCandidateView={onOpenCandidateView}
      />

      <AdminSecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        currentUser={currentUser}
        onUpdateAdminCredentials={onUpdateAdminCredentials}
        strictAuthMode={strictAuthMode}
        onToggleStrictAuth={onToggleStrictAuth}
      />
      <SocialPostModal
        isOpen={isSocialPostModalOpen}
        onClose={() => setIsSocialPostModalOpen(false)}
        offer={selectedOfferForSocialPost}
        recruiter={currentUser}
        allOffers={offers}
        onSelectOffer={(newOff) => setSelectedOfferForSocialPost(newOff)}
        onOpenCandidateView={onOpenCandidateView}
      />

      <CandidateEditModal
        isOpen={Boolean(selectedCandidateForEdit)}
        onClose={() => setSelectedCandidateForEdit(null)}
        candidate={selectedCandidateForEdit}
        onSave={async (updatedFields) => {
          if (selectedCandidateForEdit && onUpdateCandidateDetails) {
            await onUpdateCandidateDetails(selectedCandidateForEdit.id, updatedFields);
          }
        }}
      />
    </div>
  );
};
