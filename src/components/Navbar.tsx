import React, { useState } from 'react';
import { User, SystemNotification, CandidateApplication, CompanyOffer } from '../types';
import { Users, LogOut, ChevronDown, Check, Sparkles, Building2, LayoutDashboard, Share2, PlusCircle, Bell, MessageSquare, Coins, Trophy } from 'lucide-react';
import { RedzLogo } from './RedzLogo';
import { AIChatModal } from './AIChatModal';
import { formatWhatsAppCandidateMessage, getStoredWhatsAppConfig, openWhatsAppDirect } from '../lib/whatsapp';

interface NavbarProps {
  currentUser: User | null;
  recruiters: User[];
  notifications?: SystemNotification[];
  candidates?: CandidateApplication[];
  offers?: CompanyOffer[];
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  onOpenCandidateForm: () => void;
  onMarkNotificationRead?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  recruiters,
  notifications = [],
  candidates = [],
  offers = [],
  currentTab,
  onSelectTab,
  onLogout,
  onOpenCandidateForm,
  onMarkNotificationRead,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleCopyLiveLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleNotificationWhatsAppClick = (notif: SystemNotification) => {
    if (onMarkNotificationRead) {
      onMarkNotificationRead(notif.id);
    }
    const cand = candidates.find((c) => c.id === notif.candidateId);
    if (!cand) return;

    const config = getStoredWhatsAppConfig();
    const phone = notif.type === 'voice_accepted' ? config.voiceAcceptedPhone : config.upcomingInterviewPhone;
    const msg = formatWhatsAppCandidateMessage(cand, notif.statusKey);
    openWhatsAppDirect(phone, msg);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element / RedzLogo) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab(isAdmin ? 'dashboard' : 'my_candidates')}
            className="text-right hover:opacity-95 transition-opacity"
            title="REDZ Recruitment Agency"
          >
            <RedzLogo size="sm" variant="horizontal" showSubtitle={true} />
          </button>
        </div>

        {/* Zone 2: Navigation Links (single-line text with subtle active state) */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600 whitespace-nowrap">
          {isAdmin ? (
            <>
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`py-1 transition-colors hover:text-slate-900 ${
                  currentTab === 'dashboard' ? 'text-red-600 border-b-2 border-red-600' : ''
                }`}
              >
                Candidates & Pipeline
              </button>
              <button
                onClick={() => onSelectTab('offers')}
                className={`py-1 transition-colors hover:text-slate-900 ${
                  currentTab === 'offers' ? 'text-red-600 border-b-2 border-red-600' : ''
                }`}
              >
                Job Offers & Schedules
              </button>
              <button
                onClick={() => onSelectTab('recruiters')}
                className={`py-1 transition-colors hover:text-slate-900 ${
                  currentTab === 'recruiters' ? 'text-red-600 border-b-2 border-red-600' : ''
                }`}
              >
                Recruiters Team
              </button>
              <button
                onClick={() => onSelectTab('statuses')}
                className={`py-1 transition-colors hover:text-slate-900 ${
                  currentTab === 'statuses' ? 'text-red-600 border-b-2 border-red-600' : ''
                }`}
              >
                Pipeline Config
              </button>
              <button
                onClick={() => onSelectTab('leaderboard')}
                className={`py-1 transition-colors hover:text-slate-900 flex items-center gap-1.5 ${
                  currentTab === 'leaderboard' ? 'text-red-600 border-b-2 border-red-600 font-bold' : ''
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Leaderboard</span>
              </button>
              <button
                onClick={() => onSelectTab('commissions')}
                className={`py-1 transition-colors hover:text-slate-900 flex items-center gap-1.5 ${
                  currentTab === 'commissions' ? 'text-red-600 border-b-2 border-red-600 font-bold' : ''
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Commissions</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onSelectTab('my_candidates')}
                className={`py-1 transition-colors hover:text-slate-900 ${
                  currentTab === 'my_candidates' ? 'text-red-600 border-b-2 border-red-600' : ''
                }`}
              >
                My Candidates & Feedback
              </button>
              <button
                onClick={() => onSelectTab('recruiter_offers')}
                className={`py-1 transition-colors hover:text-slate-900 ${
                  currentTab === 'recruiter_offers' ? 'text-red-600 border-b-2 border-red-600' : ''
                }`}
              >
                Job Offers & Referral Links
              </button>
              <button
                onClick={() => onSelectTab('leaderboard')}
                className={`py-1 transition-colors hover:text-slate-900 flex items-center gap-1.5 ${
                  currentTab === 'leaderboard' ? 'text-red-600 border-b-2 border-red-600 font-bold' : ''
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Leaderboard</span>
              </button>
              <button
                onClick={() => onSelectTab('commissions')}
                className={`py-1 transition-colors hover:text-slate-900 flex items-center gap-1.5 ${
                  currentTab === 'commissions' ? 'text-red-600 border-b-2 border-red-600 font-bold' : ''
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Commissions</span>
              </button>
            </>
          )}

          <button
            onClick={onOpenCandidateForm}
            className={`py-1 transition-colors hover:text-slate-900 ${
              currentTab === 'candidate_portal' ? 'text-red-600 border-b-2 border-red-600' : ''
            }`}
          >
            Candidate Application Form
          </button>
        </nav>

        {/* Zone 3: Primary Action & Profile Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Real-time System Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowUserDropdown(false);
              }}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="System Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifDropdown && (
              <div
                className="absolute right-0 sm:right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-left"
              >
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-red-600" />
                    System Notifications & Follow-ups
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No new notifications at this time.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 transition-colors ${
                          notif.read ? 'bg-white opacity-75' : 'bg-red-50/40 font-medium'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">{notif.title}</span>
                            <span className="text-[11px] text-slate-600 block mt-0.5">{notif.message}</span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-1">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <button
                            onClick={() => handleNotificationWhatsAppClick(notif)}
                            className="shrink-0 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all"
                            title="Send WhatsApp notification"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Share Live Website Link Button */}
          <button
            onClick={handleCopyLiveLink}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors shadow-2xs"
            title="Copy live website link to share"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'Link Copied!' : 'Copy Website'}</span>
          </button>

          {/* AI Assistant Button */}
          <button
            onClick={() => setIsAIChatOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-red-500/20 animate-pulse"
            title="Ask REDZ AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white/20" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>

          {/* Quick User Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotifDropdown(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-700">
                {currentUser ? currentUser.fullName.charAt(0) : '?'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser?.fullName}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {currentUser?.role === 'admin'
                    ? 'Admin (Ahmed)'
                    : currentUser?.role === 'account_manager'
                    ? 'Account Manager'
                    : currentUser?.role === 'unit_manager'
                    ? 'Unit Manager 🏢'
                    : currentUser?.role === 'team_leader'
                    ? 'Team Leader 👥'
                    : `Recruiter (${currentUser?.referralCode})`}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-left"
                onClick={() => setShowUserDropdown(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="font-bold text-slate-900 text-xs">{currentUser?.fullName}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{currentUser?.email}</div>
                </div>
                <div className="pt-1">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AIChatModal 
        isOpen={isAIChatOpen} 
        onClose={() => setIsAIChatOpen(false)} 
        offers={offers}
        userName={currentUser?.fullName}
      />

      {/* Mobile nav subbar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 py-2 px-3 bg-slate-50 text-[11px] font-bold text-slate-600">
        {isAdmin ? (
          <>
            <button
              onClick={() => onSelectTab('dashboard')}
              className={currentTab === 'dashboard' ? 'text-red-600' : ''}
            >
              Candidates
            </button>
            <button
              onClick={() => onSelectTab('offers')}
              className={currentTab === 'offers' ? 'text-red-600' : ''}
            >
              Offers
            </button>
            <button
              onClick={() => onSelectTab('commissions')}
              className={currentTab === 'commissions' ? 'text-red-600 font-bold' : ''}
            >
              Commissions
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onSelectTab('my_candidates')}
              className={currentTab === 'my_candidates' ? 'text-red-600' : ''}
            >
              Candidates
            </button>
            <button
              onClick={() => onSelectTab('recruiter_offers')}
              className={currentTab === 'recruiter_offers' ? 'text-red-600' : ''}
            >
              Offers
            </button>
            <button
              onClick={() => onSelectTab('commissions')}
              className={currentTab === 'commissions' ? 'text-red-600 font-bold' : ''}
            >
              Commissions
            </button>
          </>
        )}
        <button
          onClick={onOpenCandidateForm}
          className={currentTab === 'candidate_portal' ? 'text-red-600' : ''}
        >
          Apply Form
        </button>
      </div>
    </header>
  );
};
