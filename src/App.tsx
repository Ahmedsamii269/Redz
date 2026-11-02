import React, { useState, useEffect } from 'react';
import {
  CandidateApplication,
  CompanyOffer,
  StatusConfig,
  User,
  SystemNotification,
} from './types';
import {
  initializeStorage,
  subscribeToRecruiters as recruitersSub,
  subscribeToOffers as offersSub,
  subscribeToStatuses as statusesSub,
  subscribeToApplications as applicationsSub,
  subscribeToNotifications,
  markNotificationRead,
  getCurrentUser,
  setCurrentUser,
  updateApplicationStatus,
  deleteApplication,
  saveOffer,
  deleteOffer,
  saveRecruiter,
  deleteRecruiter,
  saveStatus,
  deleteStatus,
  updateApplicationDetails,
  resetToSeedData,
} from './lib/storage';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { RecruiterDashboard } from './components/RecruiterDashboard';
import { CandidateForm } from './components/CandidateForm';
import { CommissionTab } from './components/CommissionTab';
import { LoginModal } from './components/LoginModal';
import { RedzLogo } from './components/RedzLogo';
import { WelcomeToast } from './components/WelcomeToast';
import { ToastContainer } from './components/ToastContainer';
import { Leaderboard } from './components/Leaderboard';
import { ExecutiveAnalytics } from './components/ExecutiveAnalytics';

import { logout as fbLogout } from './lib/firebase';
import { ExternalLink, RefreshCw, Eye, Sparkles, Trophy } from 'lucide-react';

export default function App() {
  const [currentUser, setUser] = useState<User | null>(getCurrentUser());
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [offers, setOffers] = useState<CompanyOffer[]>([]);
  const [recruiters, setRecruiters] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<StatusConfig[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Navigation
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [adminSubTab, setAdminSubTab] = useState<'candidates' | 'offers' | 'all-offers' | 'recruiters' | 'statuses' | 'leaderboard' | 'kanban' | 'hierarchy' | 'calendar'>('candidates');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [showWelcomeToast, setShowWelcomeToast] = useState<boolean>(false);

  // Candidate View overrides
  const [candidateViewActive, setCandidateViewActive] = useState<boolean>(false);
  const [candidateViewOfferId, setCandidateViewOfferId] = useState<string | undefined>();
  const [candidateViewRecruiterCode, setCandidateViewRecruiterCode] = useState<string | undefined>();

  // Strict Security Authentication Mode (hides quick demo login buttons)
  const [strictAuthMode, setStrictAuthMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rf_strict_auth') === 'true';
    }
    return false;
  });

  const handleToggleStrictAuth = (enabled: boolean) => {
    setStrictAuthMode(enabled);
    localStorage.setItem('rf_strict_auth', String(enabled));
  };

  const handleUpdateAdminCredentials = async (newUsername: string, newPassword: string) => {
    if (!currentUser) return;
    try {
      const updated = await saveRecruiter({
        id: currentUser.id,
        fullName: currentUser.fullName,
        username: newUsername,
        password: newPassword,
        role: 'admin',
        email: currentUser.email,
        phone: currentUser.phone,
        referralCode: currentUser.referralCode,
        active: true,
      });
      setUser(updated);
      setCurrentUser(updated);
    } catch (err) {
      alert('Failed to update credentials. Please try again.');
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await initializeStorage();
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();

    // Check URL parameters for direct apply mode
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isApply = urlParams.get('view') === 'apply' || urlParams.has('ref') || urlParams.has('offer');
      if (isApply) {
        setCandidateViewActive(true);
        setCandidateViewOfferId(urlParams.get('offer') || undefined);
        setCandidateViewRecruiterCode(urlParams.get('ref') || undefined);
      }
    }

    // Subscriptions
    const unsubRecruiters = recruitersSub(setRecruiters);
    const unsubOffers = offersSub(setOffers);
    const unsubStatuses = statusesSub(setStatuses);
    const unsubNotifs = subscribeToNotifications((allNotifs) => {
      if (currentUser?.role === 'admin') {
        setNotifications(allNotifs);
      } else {
        setNotifications(allNotifs.filter(n => !n.targetUserId || n.targetUserId === 'all' || n.targetUserId === currentUser?.id));
      }
    });
    
    // Subscribe to applications with the current user context for hierarchy filtering
    const unsubApps = applicationsSub((allApps) => {
      let filtered = allApps;
      
      if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'account_manager') {
        if (currentUser.role === 'recruiter') {
          filtered = allApps.filter(a => a.recruiterId === currentUser.id);
        } else if (currentUser.role === 'team_leader') {
          // Team Leader sees their own and recruiters assigned to them
          const teamMemberIds = recruiters
            .filter(r => r.teamLeaderId === currentUser.id)
            .map(r => r.id);
          filtered = allApps.filter(a => a.recruiterId === currentUser.id || teamMemberIds.includes(a.recruiterId));
        } else if (currentUser.role === 'unit_manager') {
          // Unit Manager sees their own, team leaders assigned to them, and recruiters in those teams
          const teamLeadersInUnit = recruiters.filter(r => r.role === 'team_leader' && r.unitManagerId === currentUser.id);
          const tlIds = teamLeadersInUnit.map(tl => tl.id);
          const recruitersInUnit = recruiters.filter(r => r.unitManagerId === currentUser.id || (r.teamLeaderId && tlIds.includes(r.teamLeaderId)));
          const unitMemberIds = [...tlIds, ...recruitersInUnit.map(r => r.id)];
          filtered = allApps.filter(a => a.recruiterId === currentUser.id || unitMemberIds.includes(a.recruiterId));
        }
      }
      
      setApplications(filtered);
    }, currentUser);

    return () => {
      unsubRecruiters();
      unsubOffers();
      unsubStatuses();
      unsubNotifs();
      unsubApps();
    };
  }, [currentUser?.id, currentUser?.role, recruiters.length]);

  const handleOpenCandidateView = (offerId?: string, recruiterCode?: string) => {
    setCandidateViewOfferId(offerId);
    setCandidateViewRecruiterCode(recruiterCode || currentUser?.referralCode || 'admin');
    setCandidateViewActive(true);
  };

  const handleLogout = async () => {
    try {
      await fbLogout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setCurrentUser(null);
    setUser(null);
    setIsLoginModalOpen(true);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300" dir="ltr">
      {/* Top Bar Navigation */}
      <Navbar
        currentUser={currentUser}
        recruiters={recruiters}
        notifications={notifications}
        candidates={applications}
        offers={offers}
        onMarkNotificationRead={(id) => markNotificationRead(id)}
        currentTab={candidateViewActive ? 'candidate_portal' : currentTab}
        onSelectTab={(tab) => {
          setCandidateViewActive(false);
          setCurrentTab(tab);
          if (tab === 'dashboard' || tab === 'offers' || tab === 'recruiters' || tab === 'statuses' || tab === 'leaderboard') {
            setAdminSubTab(tab as any);
          }
        }}
        onLogout={handleLogout}
        onOpenCandidateForm={() => handleOpenCandidateView()}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {candidateViewActive ? (
          <div className="space-y-4">
            {/* Top switcher back banner */}
            <div className="max-w-2xl mx-auto p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs shadow-md">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-red-400" />
                <span>
                  You are viewing the <strong>Live Candidate Application Form</strong> (as candidates see it)
                </span>
              </div>
              <button
                onClick={() => setCandidateViewActive(false)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
              >
                Return to Dashboard
              </button>
            </div>

            <CandidateForm
              initialOfferId={candidateViewOfferId}
              initialRecruiterCode={candidateViewRecruiterCode}
              onSuccessReturn={() => setCandidateViewActive(false)}
            />
          </div>
        ) : !currentUser ? (
          <div className="max-w-md mx-auto my-16 text-center space-y-4">
            <RedzLogo size="lg" variant="horizontal" showSubtitle={true} />
            <p className="text-slate-600 text-sm">
              Please sign in to access the recruitment dashboard and job offers.
            </p>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
            >
              Sign In
            </button>
          </div>
        ) : currentTab === 'commissions' ? (
          <CommissionTab
            currentUser={currentUser}
            candidates={applications}
            offers={offers}
            onSelectOffer={(offerId) => handleOpenCandidateView(offerId)}
          />
        ) : currentTab === 'leaderboard' ? (
          <Leaderboard 
            candidates={applications} 
            recruiters={recruiters} 
            isMonthly={true} 
          />
        ) : currentTab === 'analytics' ? (
          <ExecutiveAnalytics
            candidates={applications}
            offers={offers}
            recruiters={recruiters}
            statuses={statuses}
          />
        ) : isAdmin ? (
          <AdminDashboard
            currentUser={currentUser}
            candidates={applications}
            offers={offers}
            recruiters={recruiters}
            statuses={statuses}
            activeSubTab={adminSubTab}
            onSubTabChange={(tab) => {
              setAdminSubTab(tab);
              setCurrentTab(tab);
            }}
            onUpdateStatus={async (appId, newStatus, note, scheduledDate) => {
              await updateApplicationStatus(appId, newStatus, note, currentUser, scheduledDate);
            }}
            onUpdateCandidateDetails={async (appId, updatedFields) => {
              await updateApplicationDetails(appId, updatedFields, currentUser);
            }}
            onDeleteApplication={async (id) => await deleteApplication(id)}
            onSaveOffer={async (data) => await saveOffer(data)}
            onDeleteOffer={async (id) => await deleteOffer(id)}
            onSaveRecruiter={async (data) => await saveRecruiter(data)}
            onDeleteRecruiter={async (id) => await deleteRecruiter(id)}
            onSaveStatus={async (data) => await saveStatus(data)}
            onDeleteStatus={async (id) => await deleteStatus(id)}
            onOpenCandidateView={handleOpenCandidateView}
            strictAuthMode={strictAuthMode}
            onToggleStrictAuth={handleToggleStrictAuth}
            onUpdateAdminCredentials={handleUpdateAdminCredentials}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        ) : (
          <RecruiterDashboard
            currentUser={currentUser}
            candidates={applications}
            offers={offers}
            recruiters={recruiters}
            statuses={statuses}
            onOpenCandidateView={handleOpenCandidateView}
            onSaveOffer={currentUser.role === 'admin' ? async (data) => await saveOffer(data) : undefined}
            onUpdateStatus={async (appId, newStatus, note, scheduledDate) => {
              await updateApplicationStatus(appId, newStatus, note, currentUser, scheduledDate);
            }}
            onSaveRecruiter={['admin', 'account_manager', 'unit_manager', 'team_leader'].includes(currentUser?.role || '') ? async (data) => await saveRecruiter(data) : undefined}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 mt-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RedzLogo size="sm" variant="horizontal" showSubtitle={false} />
            <span className="text-slate-400">·</span>
            <span>Founder & CEO: <strong className="text-slate-800">Ahmed Samii</strong></span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-400">Hiring, Talent, and Careers Management</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (confirm('Reset system data to initial clean seeds?')) {
                  resetToSeedData();
                }
              }}
              className="text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors text-[11px]"
              title="Reset initial seeds"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Clean Seeds</span>
            </button>
            <span>© {new Date().getFullYear()} REDZ Recruitment Agency</span>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen || !currentUser}
        onClose={() => {
          if (currentUser) setIsLoginModalOpen(false);
        }}
        onLoginSuccess={(u) => {
          setUser(u);
          setIsLoginModalOpen(false);
          setShowWelcomeToast(true);
          setTimeout(() => setShowWelcomeToast(false), 5000);
        }}
        recruiters={recruiters}
        strictAuthMode={strictAuthMode}
      />

      {/* Real-time Welcome Feedback */}
      {showWelcomeToast && (
        <WelcomeToast 
          user={currentUser} 
          onClose={() => setShowWelcomeToast(false)} 
        />
      )}

      {/* Persistent Global Cloud Sync Toast Service */}
      <ToastContainer />
    </div>
  );
}
