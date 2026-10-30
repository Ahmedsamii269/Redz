import React, { useState } from 'react';
import {
  User,
  CandidateApplication,
  CompanyOffer,
  StatusConfig,
} from '../types';
import {
  Building2,
  Calendar,
  Share2,
  Volume2,
  MessageSquare,
  Search,
  Copy,
  Check,
  Send,
  ExternalLink,
  Clock,
  Briefcase,
  AlertCircle,
  TrendingUp,
  Info,
  Plus,
  Sparkles,
  Edit,
  Coins,
  X,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { AudioPlayerModal } from './AudioPlayerModal';
import { ReferralLinkModal } from './ReferralLinkModal';
import { StatusHistoryModal } from './StatusHistoryModal';
import { OfferModal } from './OfferModal';
import { SocialPostModal } from './SocialPostModal';
import { StatusChangeModal } from './StatusChangeModal';
import { WhatsAppDispatchModal } from './WhatsAppDispatchModal';
import { OfferCard } from './OfferCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RecruiterDashboardProps {
  currentUser: User;
  candidates: CandidateApplication[];
  offers: CompanyOffer[];
  statuses: StatusConfig[];
  recruiters?: User[];
  onOpenCandidateView: (offerId: string, recruiterCode: string) => void;
  onSaveOffer?: (offerData: Partial<CompanyOffer> & { title: string; companyName: string }) => void;
  onUpdateStatus?: (appId: string, newStatus: string, note?: string, scheduledDate?: string) => void;
  onNavigateTab?: (tab: string) => void;
  onSaveRecruiter?: (recruiterData: Partial<User> & { fullName: string; username: string }) => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  currentUser,
  candidates,
  offers,
  statuses,
  recruiters = [],
  onOpenCandidateView,
  onSaveOffer,
  onUpdateStatus,
  onNavigateTab,
  onSaveRecruiter,
}) => {
  const isAccountManager = currentUser.role === 'account_manager';
  const isUnitManager = currentUser.role === 'unit_manager';
  const isTeamLeader = currentUser.role === 'team_leader';
  const isRecruiter = currentUser.role === 'recruiter';
  const isAdmin = currentUser.role === 'admin';
  const isManagementView = isAccountManager || isUnitManager || isTeamLeader || isAdmin;

  const [activeTab, setActiveTab] = useState<'candidates' | 'offers'>('candidates');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedRecruiterFilter, setSelectedRecruiterFilter] = useState('ALL');

  // Offers Tab Search & Filters
  const [offerSearchQuery, setOfferSearchQuery] = useState('');
  const [offerFilterWorkType, setOfferFilterWorkType] = useState<string>('ALL');
  const [offerFilterAvailability, setOfferFilterAvailability] = useState<string>('ALL');

  // Modals
  const [selectedCandidateForAudio, setSelectedCandidateForAudio] = useState<CandidateApplication | null>(null);
  const [selectedCandidateForHistory, setSelectedCandidateForHistory] = useState<CandidateApplication | null>(null);
  const [selectedCandidateForStatusChange, setSelectedCandidateForStatusChange] = useState<CandidateApplication | null>(null);
  const [selectedOfferForReferral, setSelectedOfferForReferral] = useState<CompanyOffer | null>(null);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [copiedOfferId, setCopiedOfferId] = useState<string | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<CompanyOffer | null>(null);
  const [selectedOfferForSocialPost, setSelectedOfferForSocialPost] = useState<CompanyOffer | null>(null);
  const [isSocialPostModalOpen, setIsSocialPostModalOpen] = useState(false);
  const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState<User | null>(null);

  // WhatsApp Auto Dispatch state
  const [dispatchCandidate, setDispatchCandidate] = useState<CandidateApplication | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<string>('voice note accepted');
  const [dispatchNote, setDispatchNote] = useState<string | undefined>();

  const handleStatusUpdate = async (appId: string, newStatus: string, note?: string, scheduledDate?: string) => {
    if (onUpdateStatus) {
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
    }
  };

  // Managed Recruiter IDs logic
  const managedRecruiterIds = new Set<string>();
  managedRecruiterIds.add(currentUser.id);

  if (isTeamLeader) {
    recruiters.forEach((r) => {
      if (r.teamLeaderId === currentUser.id) {
        managedRecruiterIds.add(r.id);
      }
    });
  } else if (isUnitManager) {
    recruiters.forEach((r) => {
      if (r.unitManagerId === currentUser.id) {
        managedRecruiterIds.add(r.id);
      }
    });
  }

  // Candidates for this user role
  const myCandidates = (isAccountManager || isAdmin)
    ? candidates
    : (isUnitManager || isTeamLeader)
    ? candidates.filter((c) => managedRecruiterIds.has(c.recruiterId))
    : candidates.filter((c) => c.recruiterId === currentUser.id);

  const filteredCandidates = myCandidates.filter((cand) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      cand.fullName.toLowerCase().includes(q) ||
      cand.phone.includes(q) ||
      cand.referenceCode.toLowerCase().includes(q) ||
      cand.companyName.toLowerCase().includes(q) ||
      (cand.experienceLevel && cand.experienceLevel.toLowerCase().includes(q)) ||
      (cand.experienceDetails && cand.experienceDetails.toLowerCase().includes(q)) ||
      (cand.recruiterName && cand.recruiterName.toLowerCase().includes(q)) ||
      (cand.recruiterCode && cand.recruiterCode.toLowerCase().includes(q));

    const matchesStatus = selectedStatusFilter === 'ALL' || cand.status === selectedStatusFilter;
    const matchesRecruiter = selectedRecruiterFilter === 'ALL' || cand.recruiterId === selectedRecruiterFilter;

    return matchesSearch && matchesStatus && matchesRecruiter;
  });

  // KPIs
  const totalMyCandidates = myCandidates.length;
  const myPending = myCandidates.filter(
    (c) => c.status === 'Pending Feedback' || c.status === 'No answer to schedule interview date'
  ).length;
  const myVoiceAccepted = myCandidates.filter((c) => c.status === 'voice note accepted').length;
  const myUpcoming = myCandidates.filter((c) => c.status === 'Upcoming Interview').length;
  const myAccepted = myCandidates.filter((c) => c.status === 'Accepted interview').length;
  const myInTraining = myCandidates.filter((c) => c.status === 'in training').length;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.redzagency.com';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  const handleQuickCopyLink = (offer: CompanyOffer) => {
    const link = `${origin}${pathname}?view=apply&ref=${encodeURIComponent(currentUser.referralCode)}&offer=${encodeURIComponent(offer.id)}`;
    navigator.clipboard.writeText(link);
    setCopiedOfferId(offer.id);
    setTimeout(() => setCopiedOfferId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 bg-slate-900 rounded-2xl text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>
                {(() => {
                  const hour = new Date().getHours();
                  return hour < 12 ? 'Good Morning ☀️' : hour < 17 ? 'Good Afternoon ☕' : 'Good Evening 🌙';
                })()}
              </span>
              <span className="text-slate-400 font-normal">|</span>
              <span className="text-white">{currentUser.fullName}</span>
            </h1>
            <span className="text-[11px] font-mono font-bold bg-red-500/30 text-red-300 border border-red-400/30 px-2.5 py-0.5 rounded">
              {isAccountManager
                ? 'Account Manager'
                : isUnitManager
                ? 'Unit Manager 🏢'
                : isTeamLeader
                ? 'Team Leader 👥'
                : `Your Code: ${currentUser.referralCode}`}
            </span>
            <span className="text-[11px] font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700 px-2.5 py-0.5 rounded flex items-center gap-1">
              📱 WhatsApp: {currentUser.phone || 'Not set'}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {isManagementView
              ? 'Team Operations Access: Monitor candidate submissions, review voice notes, track interviews, and update application statuses for your team.'
              : 'Track your candidate submissions with real-time status and feedback from management. Share company referral links to invite candidates.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
            {onSaveRecruiter && (
              <button
                onClick={() => {
                  setEditingRecruiter(null);
                  setIsRecruiterModalOpen(true);
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Recruiter</span>
              </button>
            )}
            {onSaveOffer && (
              <button
                onClick={() => {
                  setEditingOffer(null);
                  setIsOfferModalOpen(true);
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors border border-slate-700 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-red-400" />
                <span>+ Add Company</span>
              </button>
            )}
          <button
            onClick={() => {
              setSelectedOfferForSocialPost(offers[0] || null);
              setIsSocialPostModalOpen(true);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            title="معاينة العرض كامل كبوست سوشيال ميديا ونسخه مع رقم هاتفك"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>بوستات السوشيال ميديا 📱</span>
          </button>
          <button
            onClick={() => {
              setSelectedOfferForReferral(offers[0] || null);
              setIsReferralModalOpen(true);
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors border border-slate-700 flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            Get Referral Link
          </button>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('commissions')}
              className="px-3.5 py-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 border border-slate-700"
              title="View Commission Schedule"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Commission Matrix</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-[11px] font-medium block">
            {isManagementView ? 'Team Candidates' : 'My Candidates'}
          </span>
          <span className="text-xl font-bold text-slate-900 font-mono">{totalMyCandidates}</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-amber-600 text-[11px] font-medium block">Pending Feedback</span>
          <span className="text-xl font-bold text-amber-700 font-mono">{myPending}</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-emerald-600 text-[11px] font-medium block">Voice Accepted</span>
          <span className="text-xl font-bold text-emerald-700 font-mono">{myVoiceAccepted}</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-blue-600 text-[11px] font-medium block">Upcoming Interview</span>
          <span className="text-xl font-bold text-blue-700 font-mono">{myUpcoming}</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-green-700 text-[11px] font-medium block">Accepted Interview</span>
          <span className="text-xl font-bold text-green-800 font-mono">{myAccepted}</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-teal-600 text-[11px] font-medium block">In Training</span>
          <span className="text-xl font-bold text-teal-700 font-mono">{myInTraining}</span>
        </div>
      </div>
      
      {/* Analytics Charts */}
      {isManagementView && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
             <h3 className="text-xs font-bold text-slate-800 mb-4">Team Performance by Recruiter</h3>
             <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={recruiters.filter(r => managedRecruiterIds.has(r.id)).map(r => ({ name: r.fullName, count: candidates.filter(c => c.recruiterId === r.id).length }))}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="name" fontSize={10} />
                   <YAxis fontSize={10} />
                   <Tooltip />
                   <Bar dataKey="count" fill="#E11D48" />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('candidates')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'candidates'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {isManagementView ? 'Team Candidates' : 'My Candidates'} ({myCandidates.length})
        </button>
        <button
          onClick={() => setActiveTab('offers')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'offers'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Company Offers & Direct Referral Links ({offers.length})
        </button>
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('commissions')}
            className="px-4 py-2 text-xs font-bold rounded-lg transition-all text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center gap-1.5"
          >
            <Coins className="w-4 h-4 text-red-600" />
            Commission Rates
          </button>
        )}
      </div>

      {/* Tab 1: Candidates View */}
      {activeTab === 'candidates' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isManagementView
                    ? "Search candidate, recruiter, phone, or reference code..."
                    : "Search candidates by name, phone, or reference code..."
                }
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isManagementView && recruiters.length > 0 && (
                <select
                  value={selectedRecruiterFilter}
                  onChange={(e) => setSelectedRecruiterFilter(e.target.value)}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium"
                >
                  <option value="ALL">All Team Members ({myCandidates.length})</option>
                  {recruiters
                    .filter((r) => isAccountManager || isAdmin || managedRecruiterIds.has(r.id))
                    .map((rec) => (
                      <option key={rec.id} value={rec.id}>
                        {rec.fullName} (@{rec.referralCode})
                      </option>
                    ))}
                </select>
              )}

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium"
              >
                <option value="ALL">All Statuses ({myCandidates.length})</option>
                {statuses.map((st) => (
                  <option key={st.id} value={st.key}>
                    {st.labelEn || st.labelAr} ({myCandidates.filter((c) => c.status === st.key).length})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Candidates Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Company & Role</th>
                    {isManagementView && <th className="py-3 px-4">Recruiter</th>}
                    <th className="py-3 px-4">Interview Slot</th>
                    <th className="py-3 px-4">Voice Note</th>
                    <th className="py-3 px-4">Current Status & Feedback</th>
                    <th className="py-3 px-4 text-center">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={isManagementView ? 7 : 6} className="py-12 text-center text-slate-400">
                        {myCandidates.length === 0
                          ? 'No candidates registered in your team yet.'
                          : 'No candidates matching search criteria.'}
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((cand) => (
                      <tr key={cand.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Candidate Details */}
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

                        {/* Company */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{cand.companyName}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                            {cand.offerTitle}
                          </div>
                        </td>

                        {/* Recruiter (Only for Management Views) */}
                        {isManagementView && (
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{cand.recruiterName}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-mono text-red-600 font-bold">@{cand.recruiterCode}</span>
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
                        )}

                        {/* Interview Slot */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800 text-[11px]">
                            {cand.interviewSlotDetails}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Applied: {new Date(cand.createdAt).toLocaleDateString()}
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

                        {/* Status & Feedback Notes */}
                        <td className="py-3.5 px-4 max-w-[260px]">
                          <div className="flex items-center justify-between gap-2">
                            <StatusBadge status={cand.status} statuses={statuses} size="sm" />
                            {onUpdateStatus && (
                              <button
                                onClick={() => setSelectedCandidateForStatusChange(cand)}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded border border-red-200 transition-colors shrink-0"
                                title="Change candidate status"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Status</span>
                              </button>
                            )}
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
                          {cand.feedbackNotes ? (
                            <div className="text-[11px] text-slate-700 bg-amber-50/80 p-2 rounded border border-amber-200/80 mt-1.5">
                              <span className="text-[10px] font-bold text-amber-800 block">
                                Feedback / Notes:
                              </span>
                              "{cand.feedbackNotes}"
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 block mt-1 italic">
                              Awaiting status update...
                            </span>
                          )}
                          <button
                            onClick={() => setSelectedCandidateForHistory(cand)}
                            className="text-[10px] text-red-600 hover:text-red-700 mt-2 font-semibold underline block"
                          >
                            View Full History & Updates
                          </button>
                        </td>

                        {/* WhatsApp Contact */}
                        <td className="py-3.5 px-4 text-center">
                          <a
                            href={`https://wa.me/2${cand.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Hello ${cand.fullName}, regarding your application for ${cand.companyName}...`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md transition-colors font-medium text-[11px]"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
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

      {/* Tab 2: Offers & Direct Referral Links */}
      {activeTab === 'offers' && (() => {
        const filteredOffers = offers.filter((off) => {
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
          <div className="space-y-5">
            {/* Header Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                    Company Offers & Referral Hub
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                    {offers.length} Live Positions
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Share candidate application links locked to your code or copy full offer text with official channels.
                </p>
              </div>

              {onSaveOffer && (
                <button
                  onClick={() => {
                    setEditingOffer(null);
                    setIsOfferModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Company Offer</span>
                </button>
              )}
            </div>

            {/* Recruiter Referral Lock Notice */}
            <div className="p-3.5 bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border border-red-200/80 rounded-xl text-slate-800 text-xs flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <span className="leading-relaxed">
                  Every referral link is automatically locked with your code (
                  <strong className="text-red-700 font-mono font-bold">@{currentUser.referralCode}</strong>
                  ) and target company so candidates cannot divert their application.
                </span>
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

            {/* Offers Cards Grid */}
            {filteredOffers.length === 0 ? (
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
                {filteredOffers.map((off) => (
                  <OfferCard
                    key={off.id}
                    offer={off}
                    candidateCount={candidates.filter((c) => c.companyId === off.id).length}
                    currentUser={currentUser}
                    onOpenSocialPost={(o) => {
                      setSelectedOfferForSocialPost(o);
                      setIsSocialPostModalOpen(true);
                    }}
                    onOpenReferralModal={(o) => {
                      setSelectedOfferForReferral(o);
                      setIsReferralModalOpen(true);
                    }}
                    onOpenCandidateView={onOpenCandidateView}
                    onEditOffer={
                      onSaveOffer
                        ? (o) => {
                            setEditingOffer(o);
                            setIsOfferModalOpen(true);
                          }
                        : undefined
                    }
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Audio Player Modal */}
      <AudioPlayerModal
        isOpen={Boolean(selectedCandidateForAudio)}
        onClose={() => setSelectedCandidateForAudio(null)}
        vocarooUrl={selectedCandidateForAudio?.vocarooUrl || ''}
        candidateName={selectedCandidateForAudio?.fullName || ''}
        companyName={selectedCandidateForAudio?.companyName || ''}
        showAdminActions={Boolean(onUpdateStatus)}
        onAcceptVoice={() => {
          if (selectedCandidateForAudio && onUpdateStatus) {
            handleStatusUpdate(selectedCandidateForAudio.id, 'voice note accepted', 'Accepted voice note evaluation.');
          }
        }}
        onRejectVoice={() => {
          if (selectedCandidateForAudio && onUpdateStatus) {
            handleStatusUpdate(selectedCandidateForAudio.id, 'Rejected / Drop out', 'Rejected voice note evaluation.');
          }
        }}
      />

      <StatusHistoryModal
        isOpen={Boolean(selectedCandidateForHistory)}
        onClose={() => setSelectedCandidateForHistory(null)}
        candidate={selectedCandidateForHistory}
        statuses={statuses}
      />

      {/* Status Change Modal */}
      <StatusChangeModal
        isOpen={Boolean(selectedCandidateForStatusChange)}
        onClose={() => setSelectedCandidateForStatusChange(null)}
        candidate={selectedCandidateForStatusChange}
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

      {/* Referral Link & WhatsApp Share Modal */}
      <ReferralLinkModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        recruiter={currentUser}
        offers={offers}
        initialOffer={selectedOfferForReferral}
        onOpenCandidateView={onOpenCandidateView}
      />

      {/* Offer Modal */}
      {onSaveOffer && (
        <OfferModal
          isOpen={isOfferModalOpen}
          onClose={() => {
            setIsOfferModalOpen(false);
            setEditingOffer(null);
          }}
          offerToEdit={editingOffer}
          onSave={onSaveOffer}
        />
      )}
      {/* Social Media Post & Full Offer Modal */}
      <SocialPostModal
        isOpen={isSocialPostModalOpen}
        onClose={() => setIsSocialPostModalOpen(false)}
        offer={selectedOfferForSocialPost}
        recruiter={currentUser}
        allOffers={offers}
        onSelectOffer={(newOff) => setSelectedOfferForSocialPost(newOff)}
        onOpenCandidateView={onOpenCandidateView}
      />
      
      {onSaveRecruiter && (
        <RecruiterModal
          isOpen={isRecruiterModalOpen}
          onClose={() => {
            setIsRecruiterModalOpen(false);
            setEditingRecruiter(null);
          }}
          recruiterToEdit={editingRecruiter}
          allUsers={recruiters}
          onSave={(data) => {
            const finalData = { ...data };
            if (isTeamLeader) {
              finalData.teamLeaderId = currentUser.id;
            } else if (isUnitManager) {
              finalData.unitManagerId = currentUser.id;
            } else if (isAccountManager) {
              finalData.accountManagerId = currentUser.id;
            }
            onSaveRecruiter(finalData);
          }}
        />
      )}
    </div>
  );
};
