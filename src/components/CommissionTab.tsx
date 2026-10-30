import React, { useState, useMemo } from 'react';
import {
  User,
  CandidateApplication,
  CompanyOffer,
} from '../types';
import {
  COMMISSION_GROUPS,
  INDIVIDUAL_COMPANIES_COMMISSION,
  CommissionGroup,
  CompanyCommissionDetail,
  canViewLeaderCommission,
  canViewUnitCommission,
  getUserCommissionAmount,
} from '../lib/commissionData';
import {
  Coins,
  ShieldCheck,
  Search,
  Building2,
  Clock,
  Calculator,
  Users,
  Layers,
  Sparkles,
  Eye,
  X,
  CheckCircle,
} from 'lucide-react';

interface CommissionTabProps {
  currentUser: User;
  candidates?: CandidateApplication[];
  offers?: CompanyOffer[];
  onSelectOffer?: (offerId: string) => void;
}

export const CommissionTab: React.FC<CommissionTabProps> = ({
  currentUser,
  candidates = [],
  offers = [],
  onSelectOffer,
}) => {
  const actualRole = currentUser.role;
  const isSuperUser = actualRole === 'admin' || actualRole === 'account_manager' || actualRole === 'unit_manager';
  
  // Perspective preview for admins and managers to test role visibility
  const [previewRole, setPreviewRole] = useState<string | null>(null);
  const role = isSuperUser && previewRole ? previewRole : actualRole;

  const isRecruiter = role === 'recruiter';
  const isLeader = role === 'team_leader';
  const isUnitManager = role === 'unit_manager';
  const isAdmin = role === 'admin' || role === 'account_manager';

  const showLeaderCol = canViewLeaderCommission(role);
  const showUnitCol = canViewUnitCommission(role);

  // Sub-views inside Commission Tab
  const [activeView, setActiveView] = useState<'sheet' | 'directory' | 'calculator'>('sheet');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'CS English' | 'CS Languages'>('ALL');
  const [termsFilter, setTermsFilter] = useState<'ALL' | '30 days' | '45 days'>('ALL');

  const hasActiveFilters = searchQuery.trim() !== '' || categoryFilter !== 'ALL' || termsFilter !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setTermsFilter('ALL');
  };

  // Calculator State
  const [calcCompanyId, setCalcCompanyId] = useState<string>(INDIVIDUAL_COMPANIES_COMMISSION[0].id);
  const [calcCount, setCalcCount] = useState<number>(5);

  const selectedCalcCompany = useMemo(() => {
    return INDIVIDUAL_COMPANIES_COMMISSION.find((c) => c.id === calcCompanyId) || INDIVIDUAL_COMPANIES_COMMISSION[0];
  }, [calcCompanyId]);

  // Filtered Groups
  const filteredGroups = useMemo(() => {
    return COMMISSION_GROUPS.filter((group) => {
      if (categoryFilter !== 'ALL' && group.category !== categoryFilter) return false;
      if (termsFilter !== 'ALL' && group.terms !== termsFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inCompanies = group.companiesRaw.toLowerCase().includes(q);
        const inCategory = group.category.toLowerCase().includes(q) || group.categoryLabel.toLowerCase().includes(q);
        const inList = group.companiesList.some((c) => c.toLowerCase().includes(q));
        if (!inCompanies && !inCategory && !inList) return false;
      }
      return true;
    });
  }, [categoryFilter, termsFilter, searchQuery]);

  // Filtered Individual Companies
  const filteredCompanies = useMemo(() => {
    return INDIVIDUAL_COMPANIES_COMMISSION.filter((comp) => {
      if (categoryFilter !== 'ALL' && comp.category !== categoryFilter) return false;
      if (termsFilter !== 'ALL' && comp.terms !== termsFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = comp.companyName.toLowerCase().includes(q);
        const inType = comp.accountType.toLowerCase().includes(q);
        if (!inName && !inType) return false;
      }
      return true;
    });
  }, [categoryFilter, termsFilter, searchQuery]);

  return (
    <div className="space-y-6 font-sans text-slate-900" dir="ltr">
      {/* Executive Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/20 shrink-0">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  Commission Schedule
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                  REDZ Official
                </span>
                {previewRole && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                    Previewing {previewRole.replace('_', ' ')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Official agency placement compensation schedule across corporate partners, multilingual accounts, and retention terms.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Perspective Switcher for Admins/Managers to verify staff experience */}
            {isSuperUser && (
              <div className="p-1.5 bg-slate-100 rounded-xl flex items-center gap-1 text-xs">
                <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  View As:
                </span>
                <button
                  onClick={() => setPreviewRole(null)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                    !previewRole ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Your real management role"
                >
                  My Role
                </button>
                <button
                  onClick={() => setPreviewRole('recruiter')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                    previewRole === 'recruiter' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Preview exact recruiter view (only Recruiter Rate visible)"
                >
                  Recruiter
                </button>
                <button
                  onClick={() => setPreviewRole('team_leader')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                    previewRole === 'team_leader' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Preview team leader view (Leader & Recruiter Rates visible)"
                >
                  Leader
                </button>
                {actualRole === 'admin' && (
                  <button
                    onClick={() => setPreviewRole('unit_manager')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                      previewRole === 'unit_manager' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Preview unit manager view (All 3 Rates visible)"
                  >
                    Unit Mgr
                  </button>
                )}
              </div>
            )}

            {/* Role Authorization Badge */}
            <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-xs">
              {isRecruiter && (
                <>
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Recruiter Access</span>
                    <span className="text-[11px] text-slate-500">
                      Direct recruiter placement rates only.
                    </span>
                  </div>
                </>
              )}
              {isLeader && (
                <>
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Team Leader Access</span>
                    <span className="text-[11px] text-slate-500">
                      Leader and Recruiter tier rates.
                    </span>
                  </div>
                </>
              )}
              {isUnitManager && (
                <>
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Unit Manager Access</span>
                    <span className="text-[11px] text-slate-500">
                      Recruiter, Leader & Unit tiers.
                    </span>
                  </div>
                </>
              )}
              {isAdmin && (
                <>
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Executive Administration</span>
                    <span className="text-[11px] text-slate-500">
                      Complete tier oversight.
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* View Switcher Sub-tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveView('sheet')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                activeView === 'sheet'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Master Matrix</span>
            </button>

            <button
              onClick={() => setActiveView('directory')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                activeView === 'directory'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Account Directory ({INDIVIDUAL_COMPANIES_COMMISSION.length} Roles)</span>
            </button>

            <button
              onClick={() => setActiveView('calculator')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                activeView === 'calculator'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Earnings Estimator</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Currency: <strong className="text-slate-700">Egyptian Pounds (EGP)</strong>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      {activeView !== 'calculator' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search account (TTEC, TP, Alorica, eClerx, Sutherland...)"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  categoryFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Categories
              </button>
              <button
                onClick={() => setCategoryFilter('CS English')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  categoryFilter === 'CS English' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                CS English
              </button>
              <button
                onClick={() => setCategoryFilter('CS Languages')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  categoryFilter === 'CS Languages' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                CS Languages
              </button>
            </div>

            {/* Terms Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setTermsFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  termsFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Terms
              </button>
              <button
                onClick={() => setTermsFilter('30 days')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  termsFilter === '30 days' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTermsFilter('45 days')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  termsFilter === '45 days' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                45 Days
              </button>
            </div>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-2.5 py-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg font-bold transition-colors flex items-center gap-1"
                title="Clear all search and category filters"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* VIEW 1: MASTER MATRIX (Clean Modern Table Layout) */}
      {activeView === 'sheet' && (
        <div className="space-y-6">
          {filteredGroups.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">No corporate accounts found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No accounts match your current search query or filter selection.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Section 1: CS English */}
              {(categoryFilter === 'ALL' || categoryFilter === 'CS English') && (
                <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
                  {/* Table Header Banner */}
                  <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs shadow-blue-400"></span>
                      <h2 className="font-extrabold text-sm tracking-wide">CS English Accounts</h2>
                    </div>
                    <span className="text-[11px] font-mono text-slate-300 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700">
                      {filteredGroups.filter((g) => g.category === 'CS English').length} Groups
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                          <th className="py-3.5 px-5 w-5/12">Corporate Account / Partner</th>
                          <th className="py-3.5 px-4 w-2/12 text-center">Retention Terms</th>
                          <th className="py-3.5 px-4 w-2/12 text-center bg-emerald-50/70 text-emerald-800 border-l border-emerald-100">
                            Recruiter Rate
                          </th>
                          {showLeaderCol && (
                            <th className="py-3.5 px-4 w-2/12 text-center bg-blue-50/70 text-blue-800 border-l border-blue-100">
                              Leader Rate
                            </th>
                          )}
                          {showUnitCol && (
                            <th className="py-3.5 px-4 w-2/12 text-center bg-purple-50/70 text-purple-800 border-l border-purple-100">
                              Unit Rate
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredGroups
                          .filter((g) => g.category === 'CS English')
                          .map((group) => (
                            <tr key={group.id} className="hover:bg-slate-50/75 transition-colors">
                              <td className="py-4 px-5">
                                <div className="text-slate-900 font-extrabold text-sm font-mono tracking-tight">
                                  {group.companiesRaw}
                                </div>
                                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                  {group.companiesList.map((comp, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium border border-slate-200/50"
                                    >
                                      {comp}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span
                                  className={`inline-block px-3 py-1 rounded-lg font-mono font-bold text-[11px] border ${
                                    group.termsDays === 30
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-purple-50 text-purple-700 border-purple-200'
                                  }`}
                                >
                                  {group.terms}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center font-extrabold text-emerald-600 text-base font-mono bg-emerald-50/20 border-l border-emerald-50">
                                {group.recruiterCommission.toLocaleString()}{' '}
                                <span className="text-[11px] font-sans font-medium text-slate-500">EGP</span>
                              </td>
                              {showLeaderCol && (
                                <td className="py-4 px-4 text-center font-extrabold text-blue-600 text-base font-mono bg-blue-50/20 border-l border-blue-50">
                                  {group.leaderCommission.toLocaleString()}{' '}
                                  <span className="text-[11px] font-sans font-medium text-slate-500">EGP</span>
                                </td>
                              )}
                              {showUnitCol && (
                                <td className="py-4 px-4 text-center font-extrabold text-purple-700 text-base font-mono bg-purple-50/20 border-l border-purple-50">
                                  {group.unitCommission.toLocaleString()}{' '}
                                  <span className="text-[11px] font-sans font-medium text-slate-500">EGP</span>
                                </td>
                              )}
                            </tr>
                          ))}
                        {filteredGroups.filter((g) => g.category === 'CS English').length === 0 && (
                          <tr>
                            <td
                              colSpan={showUnitCol ? 5 : showLeaderCol ? 4 : 3}
                              className="py-8 text-center text-slate-400 text-xs"
                            >
                              No CS English accounts match the search criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Section 2: CS Languages */}
              {(categoryFilter === 'ALL' || categoryFilter === 'CS Languages') && (
                <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
                  {/* Table Header Banner */}
                  <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400"></span>
                      <h2 className="font-extrabold text-sm tracking-wide">CS Languages (Multilingual Accounts)</h2>
                    </div>
                    <span className="text-[11px] font-mono text-slate-300 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700">
                      {filteredGroups.filter((g) => g.category === 'CS Languages').length} Groups
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                          <th className="py-3.5 px-5 w-5/12">Corporate Account / Partner</th>
                          <th className="py-3.5 px-4 w-2/12 text-center">Retention Terms</th>
                          <th className="py-3.5 px-4 w-2/12 text-center bg-emerald-50/70 text-emerald-800 border-l border-emerald-100">
                            Recruiter Rate
                          </th>
                          {showLeaderCol && (
                            <th className="py-3.5 px-4 w-2/12 text-center bg-blue-50/70 text-blue-800 border-l border-blue-100">
                              Leader Rate
                            </th>
                          )}
                          {showUnitCol && (
                            <th className="py-3.5 px-4 w-2/12 text-center bg-purple-50/70 text-purple-800 border-l border-purple-100">
                              Unit Rate
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredGroups
                          .filter((g) => g.category === 'CS Languages')
                          .map((group) => (
                            <tr key={group.id} className="hover:bg-slate-50/75 transition-colors">
                              <td className="py-4 px-5">
                                <div className="text-slate-900 font-extrabold text-sm font-mono tracking-tight">
                                  {group.companiesRaw}
                                </div>
                                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                  {group.companiesList.map((comp, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium border border-slate-200/50"
                                    >
                                      {comp}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span
                                  className={`inline-block px-3 py-1 rounded-lg font-mono font-bold text-[11px] border ${
                                    group.termsDays === 30
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-purple-50 text-purple-700 border-purple-200'
                                  }`}
                                >
                                  {group.terms}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center font-extrabold text-emerald-600 text-base font-mono bg-emerald-50/20 border-l border-emerald-50">
                                {group.recruiterCommission.toLocaleString()}{' '}
                                <span className="text-[11px] font-sans font-medium text-slate-500">EGP</span>
                              </td>
                              {showLeaderCol && (
                                <td className="py-4 px-4 text-center font-extrabold text-blue-600 text-base font-mono bg-blue-50/20 border-l border-blue-50">
                                  {group.leaderCommission.toLocaleString()}{' '}
                                  <span className="text-[11px] font-sans font-medium text-slate-500">EGP</span>
                                </td>
                              )}
                              {showUnitCol && (
                                <td className="py-4 px-4 text-center font-extrabold text-purple-700 text-base font-mono bg-purple-50/20 border-l border-purple-50">
                                  {group.unitCommission.toLocaleString()}{' '}
                                  <span className="text-[11px] font-sans font-medium text-slate-500">EGP</span>
                                </td>
                              )}
                            </tr>
                          ))}
                        {filteredGroups.filter((g) => g.category === 'CS Languages').length === 0 && (
                          <tr>
                            <td
                              colSpan={showUnitCol ? 5 : showLeaderCol ? 4 : 3}
                              className="py-8 text-center text-slate-400 text-xs"
                            >
                              No CS Languages accounts match the search criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* VIEW 2: ACCOUNT DIRECTORY (Granular cards for every single company) */}
      {activeView === 'directory' && (
        <>
          {filteredCompanies.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">No company accounts match your query</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try searching for a different company name or clearing the category and terms filters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanies.map((comp) => {
                const userComm = getUserCommissionAmount(role, comp);
                return (
                  <div
                    key={comp.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-extrabold text-slate-900 text-sm">{comp.companyName}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase shrink-0 ${
                            comp.category === 'CS English'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {comp.category}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl font-medium border border-slate-100">
                        {comp.accountType}
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Terms:
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-[10px] ${
                            comp.termsDays === 30
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {comp.terms}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                      {/* Primary Rate for current user role */}
                      <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-xl p-3 text-center">
                        <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
                          {userComm.label}
                        </span>
                        <span className="text-xl font-black text-emerald-700 font-mono mt-0.5 block">
                          {userComm.amount.toLocaleString()} <span className="text-xs font-sans font-medium text-emerald-600">EGP</span>
                        </span>
                      </div>

                      {/* Multi-tier details for Leaders and Unit Managers */}
                      {(showLeaderCol || showUnitCol) && (
                        <div className="grid grid-cols-2 gap-2 mt-2.5 text-[10px]">
                          <div className="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                            <span className="text-slate-400 block font-medium">Recruiter</span>
                            <span className="font-bold text-slate-800 font-mono text-xs">
                              {comp.recruiterCommission.toLocaleString()} EGP
                            </span>
                          </div>
                          {showLeaderCol && (
                            <div className="bg-blue-50/60 p-2 rounded-lg text-center border border-blue-100">
                              <span className="text-blue-600 block font-medium">Leader</span>
                              <span className="font-bold text-blue-800 font-mono text-xs">
                                {comp.leaderCommission.toLocaleString()} EGP
                              </span>
                            </div>
                          )}
                          {showUnitCol && (
                            <div className="col-span-2 bg-purple-50/60 p-2 rounded-lg text-center border border-purple-100">
                              <span className="text-purple-600 block font-medium">Unit Manager</span>
                              <span className="font-bold text-purple-800 font-mono text-xs">
                                {comp.unitCommission.toLocaleString()} EGP
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* VIEW 3: EARNINGS ESTIMATOR (Interactive Calculator) */}
      {activeView === 'calculator' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm max-w-2xl mx-auto">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Placement Earnings Estimator</h2>
              <p className="text-xs text-slate-500">Calculate estimated compensation based on placement volume</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Select Corporate Account:</label>
              <select
                value={calcCompanyId}
                onChange={(e) => setCalcCompanyId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 bg-white"
              >
                {INDIVIDUAL_COMPANIES_COMMISSION.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.companyName} — {comp.category} ({comp.terms})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Number of Hires (Placements):</label>
              <input
                type="number"
                min="1"
                max="500"
                value={calcCount}
                onChange={(e) => setCalcCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 bg-white font-mono font-bold"
              />
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[11px] text-slate-400 font-medium">Quick presets:</span>
            {[1, 3, 5, 10, 20, 50].map((num) => (
              <button
                key={num}
                onClick={() => setCalcCount(num)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                  calcCount === num ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Results Display */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-300 font-medium block">
                  {getUserCommissionAmount(role, selectedCalcCompany).label}
                </span>
                <span className="text-xs text-slate-400 mt-0.5 block">
                  {calcCount} Placements × {getUserCommissionAmount(role, selectedCalcCompany).amount.toLocaleString()} EGP
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {(getUserCommissionAmount(role, selectedCalcCompany).amount * calcCount).toLocaleString()}{' '}
                  <span className="text-xs font-sans text-slate-300">EGP</span>
                </span>
              </div>
            </div>

            {/* Managerial Tier Breakdown */}
            {(showLeaderCol || showUnitCol) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Total Recruiter Payout:</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {(selectedCalcCompany.recruiterCommission * calcCount).toLocaleString()} EGP
                  </span>
                </div>
                {showLeaderCol && (
                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200">
                    <span className="text-blue-600 block text-[11px]">Total Leader Payout:</span>
                    <span className="text-base font-bold text-blue-900 font-mono">
                      {(selectedCalcCompany.leaderCommission * calcCount).toLocaleString()} EGP
                    </span>
                  </div>
                )}
                {showUnitCol && (
                  <div className="sm:col-span-2 p-3.5 bg-purple-50/60 rounded-xl border border-purple-200">
                    <span className="text-purple-600 block text-[11px]">Total Unit Manager Payout:</span>
                    <span className="text-base font-bold text-purple-900 font-mono">
                      {(selectedCalcCompany.unitCommission * calcCount).toLocaleString()} EGP
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
