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
import { updateApplicationDetails } from '../lib/storage';
import { ReferralLinkModal } from './ReferralLinkModal';
import { StatusHistoryModal } from './StatusHistoryModal';
import { OfferModal } from './OfferModal';
import { SocialPostModal } from './SocialPostModal';
import { StatusChangeModal } from './StatusChangeModal';
import { WhatsAppDispatchModal } from './WhatsAppDispatchModal';
import { OfferCard } from './OfferCard';
import { RecruiterModal } from './RecruiterModal';
import { CandidatesTable } from './CandidatesTable';
import { KPIStats } from './KPIStats';
import { TodayAgendaBanner } from './TodayAgendaBanner';
import { InterviewCalendar } from './InterviewCalendar';
import { ThemeToggle } from './ThemeToggle';
import { getAddMemberButtonLabel } from '../lib/permissions';
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

  const [activeTab, setActiveTab] = useState<'candidates' | 'team' | 'offers' | 'calendar'>('candidates');
  const [searchQuery, setSearchQuery] = useState('');
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedRecruiterFilter, setSelectedRecruiterFilter] = useState('ALL');

  // Offers Tab Search & Filters
  const [offerSearchQuery, setOfferSearchQuery] = useState('');
  const [offerFilterWorkType, setOfferFilterWorkType] = useState<string>('ALL');
  const [offerFilterAvailability, setOfferFilterAvailability] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

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
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  const toggleCandidate = (id: string) => {
    setSelectedCandidateIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const toggleAll = () => {
    setSelectedCandidateIds(prev => prev.length === paginatedCandidates.length ? [] : paginatedCandidates.map(c => c.id));
  };

  const handleStatusUpdate = async (appId: string, newStatus: string, note?: string, scheduledDate?: string) => {
    if (onUpdateStatus) {
      try {
        await onUpdateStatus(appId, newStatus, note, scheduledDate);
        const cand = Array.isArray(candidates) ? candidates.find((c) => c.id === appId) : null;
        if ((isAccountManager || isAdmin) && cand && (newStatus === 'voice note accepted' || newStatus === 'Upcoming Interview')) {
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

  // Team members under this manager/leader
  const myTeamMembers = recruiters.filter((u) => {
    if (u.id === currentUser.id) return false;
    if (isAdmin || isAccountManager) return true;
    if (isUnitManager) {
      return u.unitManagerId === currentUser.id || (u.role === 'team_leader' && u.unitManagerId === currentUser.id);
    }
    if (isTeamLeader) {
      return u.teamLeaderId === currentUser.id;
    }
    return false;
  });

  const filteredTeamMembers = myTeamMembers.filter((m) => {
    const q = teamSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.username.toLowerCase().includes(q) ||
      m.referralCode.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      (m.phone && m.phone.includes(q))
    );
  });

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

  const itemsPerPage = 10;
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

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
            <ThemeToggle />
            {onSaveRecruiter && (
              <button
                onClick={() => {
                  setEditingRecruiter(null);
                  setIsRecruiterModalOpen(true);
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{getAddMemberButtonLabel(currentUser.role).en}</span>
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

      {/* 🚀 Recruiter Daily Action & Guidance Checklist (Organized Onboarding & Flow) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-lg shrink-0">
              📌
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>مرشد الريكروتر اليومي (Recruiter Action Guide & Checklist)</span>
                <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-mono border border-red-500/30">
                  Step-by-Step
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                خطوات واضحة ومنسقة لضمان عدم ضياع أي فرصة وتأكيد أعلى نسبة قبول للمرشحين
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                const link = `${origin}${pathname}?view=apply&ref=${encodeURIComponent(currentUser.referralCode)}`;
                navigator.clipboard.writeText(link);
                alert(`تم نسخ رابط الإحالة الخاص بك بنجاح:\n${link}`);
              }}
              className="flex-1 md:flex-initial px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ كود وإحالة التسجيل</span>
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className="flex-1 md:flex-initial px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <Briefcase className="w-3.5 h-3.5 text-red-400" />
              <span>تصفح العروض المتاحة</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-300 font-bold mb-1.5">
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-[11px]">1</span>
                  اختر العرض الوظيفي
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{offers.length} عروض</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                انتقل لتبويب "Company Offers" واضغط على "Get Link" أو "WhatsApp Post" لمشاركة الشواغر مع المرشحين.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('offers')}
              className="mt-3 text-left font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <span>استعرض العروض الآن</span> &rarr;
            </button>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-300 font-bold mb-1.5">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px]">2</span>
                  سجل المرشحين أو انشر الرابط
                </span>
                <span className="text-[10px] text-slate-400 font-mono">كود: {currentUser.referralCode}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                المرشحون الذين يسجلون عبر رابطك يظهرون مباشرة في جدولك أدناه بكود الإحالة الخاص بك.
              </p>
            </div>
            <button
              onClick={() => onOpenCandidateView(offers[0]?.id || '', currentUser.referralCode)}
              className="mt-3 text-left font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>فتح نموذج تسجيل مرشح</span> &rarr;
            </button>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-300 font-bold mb-1.5">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px]">3</span>
                  تابع حالة الطلبات والمقابلة
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{myCandidates.length} مرشح</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                تابع التحديثات، استمع للفويس نوت، وقم بتحديث الحالات (Voice Note Accepted / Interview) لتسهيل التواصل عبر الواتساب.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('candidates')}
              className="mt-3 text-left font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>عرض جدول المرشحين</span> &rarr;
            </button>
          </div>
        </div>
      </div>



      {/* Today's Agenda Banner */}
      <TodayAgendaBanner
        candidates={myCandidates}
        currentUser={currentUser}
        onOpenCalendar={() => setActiveTab('calendar')}
        onSelectCandidate={(c) => setSelectedCandidateForStatusChange(c)}
      />

      {/* KPI Stats Strip */}
      <KPIStats 
        candidatesCount={totalMyCandidates} 
        activeOffersCount={offers.filter(o => o.isAvailable).length}
        hiredCount={myCandidates.filter(c => c.status === 'accepted' || c.status === 'hired').length}
      />
      
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
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('candidates')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
            activeTab === 'candidates'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {isManagementView ? 'Team Candidates' : 'My Candidates'} ({myCandidates.length})
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'calendar'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-red-500" />
          <span>تقويم المقابلات (Calendar)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-mono">
            {myCandidates.filter((c) => c.status === 'Upcoming Interview').length}
          </span>
        </button>
        {isManagementView && (
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
              activeTab === 'team'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            👥 أعضاء الفريق / My Team ({myTeamMembers.length})
          </button>
        )}
        <button
          onClick={() => setActiveTab('offers')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
            activeTab === 'offers'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Company Offers & Referral Links ({offers.length})
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

          {/* Bulk Action Bar */}
          {selectedCandidateIds.length > 0 && (
            <div className="flex items-center justify-between bg-indigo-50 p-3 rounded-lg border border-indigo-200 mb-4">
              <span className="text-xs font-bold text-indigo-800">{selectedCandidateIds.length} items selected</span>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700">Export</button>
            </div>
          )}

          {/* Candidates Table */}
          <CandidatesTable 
            candidates={myCandidates} // Table handles its own pagination/filtering now
            statuses={statuses}
            isManagementView={isManagementView}
            recruiters={recruiters}
            selectedIds={selectedCandidateIds}
            onToggleCandidate={toggleCandidate}
            onToggleAll={() => setSelectedCandidateIds(selectedCandidateIds.length === myCandidates.length ? [] : myCandidates.map(c => c.id))}
            onUpdateStatus={handleStatusUpdate}
            setSelectedCandidateForAudio={setSelectedCandidateForAudio}
            setSelectedCandidateForStatusChange={setSelectedCandidateForStatusChange}
            setSelectedCandidateForHistory={setSelectedCandidateForHistory}
            currentUser={currentUser}
            />
        </div>
      )}


      {/* Tab: Team Members Management View */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          {/* Search & Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>إدارة أعضاء الفريق (Team Members)</span>
                <span className="px-2 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 font-bold rounded-full border border-indigo-200">
                  {myTeamMembers.length} Members
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isTeamLeader
                  ? 'يمكنك إضافة ريكروترز وتحديد الأكواد وتعديل بياناتهم.'
                  : isUnitManager
                  ? 'يمكنك إضافة ريكروترز وتيم ليدرز وإدارة فريق اليونت.'
                  : 'يمكنك إضافة وإدارة كافة الرتب في النظام.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={teamSearchQuery}
                  onChange={(e) => setTeamSearchQuery(e.target.value)}
                  placeholder="البحث باسم العضو، اليوزر، الكود..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>

              {onSaveRecruiter && (
                <button
                  onClick={() => {
                    setEditingRecruiter(null);
                    setIsRecruiterModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{getAddMemberButtonLabel(currentUser.role).ar}</span>
                </button>
              )}
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">System Role</th>
                    <th className="py-3 px-4">Referral Code & Login</th>
                    <th className="py-3 px-4">Phone / Contact</th>
                    <th className="py-3 px-4">Assigned Leaders</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeamMembers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        {myTeamMembers.length === 0
                          ? 'No team members added yet. Click "+ Add Member" above to create one.'
                          : 'No team members match your search query.'}
                      </td>
                    </tr>
                  ) : (
                    filteredTeamMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {member.fullName}
                          {member.email && (
                            <div className="text-[11px] font-normal text-slate-400">{member.email}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              member.role === 'admin'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : member.role === 'account_manager'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : member.role === 'unit_manager'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : member.role === 'team_leader'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}
                          >
                            {member.role === 'admin'
                              ? 'Admin / CEO'
                              : member.role === 'account_manager'
                              ? 'Account Manager'
                              : member.role === 'unit_manager'
                              ? 'Unit Manager 🏢'
                              : member.role === 'team_leader'
                              ? 'Team Leader 👥'
                              : 'Recruiter'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-red-600">@{member.referralCode}</div>
                          <div className="text-[10px] text-slate-400">user: {member.username}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {member.phone || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-[11px]">
                          {member.teamLeaderName && (
                            <div className="text-purple-700 font-medium">TL: {member.teamLeaderName}</div>
                          )}
                          {member.unitManagerName && (
                            <div className="text-amber-700 font-medium">UM: {member.unitManagerName}</div>
                          )}
                          {member.accountManagerName && (
                            <div className="text-blue-700 font-medium">AM: {member.accountManagerName}</div>
                          )}
                          {!member.teamLeaderName && !member.unitManagerName && !member.accountManagerName && (
                            <span className="text-slate-400 italic">Direct Account</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              member.active !== false
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {member.active !== false ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setEditingRecruiter(member);
                              setIsRecruiterModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Edit User Account"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
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

      {/* Tab 3: Offers & Direct Referral Links */}
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
                    onStatusToggle={onSaveOffer ? (o) => onSaveOffer(o as any) : undefined}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Tab: Interview Calendar */}
      {activeTab === 'calendar' && (
        <div className="animate-in fade-in duration-200">
          <InterviewCalendar
            candidates={myCandidates}
            offers={offers}
            recruiters={recruiters}
            currentUser={currentUser}
            statuses={statuses}
            onSelectCandidateForAudio={(cand) => setSelectedCandidateForAudio(cand)}
            onSelectCandidateForStatus={(cand) => setSelectedCandidateForStatusChange(cand)}
          />
        </div>
      )}

      {/* Audio Player Modal */}
      <AudioPlayerModal
        isOpen={Boolean(selectedCandidateForAudio)}
        onClose={() => setSelectedCandidateForAudio(null)}
        vocarooUrl={selectedCandidateForAudio?.vocarooUrl || ''}
        candidateName={selectedCandidateForAudio?.fullName || ''}
        companyName={selectedCandidateForAudio?.companyName || ''}
        candidateId={selectedCandidateForAudio?.id}
        experienceDetails={selectedCandidateForAudio?.experienceDetails}
        initialEvaluation={selectedCandidateForAudio?.aiEvaluation}
        onUpdateEvaluation={(evalData) => {
          if (selectedCandidateForAudio) {
            updateApplicationDetails(selectedCandidateForAudio.id, { aiEvaluation: evalData });
          }
        }}
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

      {/* Auto WhatsApp Dispatch Modal (Admin & Account Manager only) */}
      {(isAccountManager || isAdmin) && (
        <WhatsAppDispatchModal
          isOpen={Boolean(dispatchCandidate)}
          onClose={() => setDispatchCandidate(null)}
          candidate={dispatchCandidate}
          newStatus={dispatchStatus}
          note={dispatchNote}
        />
      )}

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
          currentUser={currentUser}
          onSave={(data: any) => {
            onSaveRecruiter(data);
          }}
        />
      )}
    </div>
  );
};
