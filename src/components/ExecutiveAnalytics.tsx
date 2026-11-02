import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Building2,
  Users,
  Award,
  CheckCircle2,
  Clock,
  Briefcase,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { CandidateApplication, CompanyOffer, User, StatusConfig } from '../types';
import { PREFERRED_OFFER_ORDER } from '../lib/storage';

interface ExecutiveAnalyticsProps {
  candidates: CandidateApplication[];
  offers: CompanyOffer[];
  recruiters: User[];
  statuses: StatusConfig[];
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export const ExecutiveAnalytics: React.FC<ExecutiveAnalyticsProps> = ({
  candidates,
  offers,
  recruiters,
  statuses,
}) => {
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'month'>('month');

  // Filter candidates based on time
  const filteredCandidates = useMemo(() => {
    let list = candidates;
    if (timeFilter === 'month') {
      const now = new Date();
      list = list.filter((c) => {
        const d = new Date(c.createdAt || 0);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }
    if (selectedCompanyFilter !== 'all') {
      list = list.filter((c) => (c.companyName || '').toLowerCase().includes(selectedCompanyFilter.toLowerCase()));
    }
    return list;
  }, [candidates, timeFilter, selectedCompanyFilter]);

  // General KPIs
  const totalApps = filteredCandidates.length;
  const voiceAccepted = filteredCandidates.filter(
    (c) => (c.status || '').trim().toLowerCase() === 'voice note accepted'
  ).length;
  const upcomingInterviews = filteredCandidates.filter((c) =>
    (c.status || '').trim().toLowerCase().includes('interview')
  ).length;

  const overallConversionRate = totalApps > 0 ? ((voiceAccepted / totalApps) * 100).toFixed(1) : '0';

  // 1. Company Conversion Breakdown
  const companyStats = useMemo(() => {
    const statsMap: Record<
      string,
      { companyName: string; total: number; accepted: number; rate: number }
    > = {};

    // Initialize map with known companies
    PREFERRED_OFFER_ORDER.forEach((comp) => {
      statsMap[comp] = { companyName: comp, total: 0, accepted: 0, rate: 0 };
    });

    filteredCandidates.forEach((c) => {
      const compName = c.companyName || 'Other';
      let matchedKey = Object.keys(statsMap).find((k) =>
        compName.toLowerCase().includes(k.toLowerCase())
      );
      if (!matchedKey) {
        matchedKey = compName;
        if (!statsMap[matchedKey]) {
          statsMap[matchedKey] = { companyName: matchedKey, total: 0, accepted: 0, rate: 0 };
        }
      }

      statsMap[matchedKey].total += 1;
      if ((c.status || '').trim().toLowerCase() === 'voice note accepted') {
        statsMap[matchedKey].accepted += 1;
      }
    });

    return Object.values(statsMap)
      .map((item) => ({
        ...item,
        rate: item.total > 0 ? parseFloat(((item.accepted / item.total) * 100).toFixed(1)) : 0,
      }))
      .filter((item) => item.total > 0 || PREFERRED_OFFER_ORDER.slice(0, 6).includes(item.companyName))
      .sort((a, b) => b.accepted - a.accepted);
  }, [filteredCandidates]);

  // 2. Status Distribution Data for Pie Chart
  const statusPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredCandidates.forEach((c) => {
      const st = c.status || 'Pending Feedback';
      counts[st] = (counts[st] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredCandidates]);

  // 3. Team Leader Performance Hierarchy
  const teamLeaderStats = useMemo(() => {
    const tls = recruiters.filter((r) => r.role === 'team_leader');

    return tls
      .map((tl) => {
        const teamRecruiters = recruiters.filter((r) => r.teamLeaderId === tl.id || r.id === tl.id);
        const recruiterIds = teamRecruiters.map((r) => r.id);
        const recruiterUsernames = teamRecruiters.map((r) => r.username.toLowerCase());
        const recruiterCodes = teamRecruiters.map((r) => (r.referralCode || '').toLowerCase());

        const teamApps = filteredCandidates.filter(
          (c) =>
            recruiterIds.includes(c.recruiterId) ||
            recruiterUsernames.includes((c.recruiterCode || '').toLowerCase()) ||
            recruiterCodes.includes((c.recruiterCode || '').toLowerCase())
        );

        const accepted = teamApps.filter(
          (c) => (c.status || '').trim().toLowerCase() === 'voice note accepted'
        ).length;

        const rate = teamApps.length > 0 ? ((accepted / teamApps.length) * 100).toFixed(1) : '0';

        return {
          id: tl.id,
          name: tl.fullName,
          username: tl.username,
          memberCount: teamRecruiters.length,
          totalApps: teamApps.length,
          accepted,
          rate: parseFloat(rate),
        };
      })
      .sort((a, b) => b.accepted - a.accepted);
  }, [recruiters, filteredCandidates]);

  // 4. Unit Manager Hierarchy
  const unitManagerStats = useMemo(() => {
    const ums = recruiters.filter((r) => r.role === 'unit_manager');

    return ums
      .map((um) => {
        const tlsInUnit = recruiters.filter((r) => r.role === 'team_leader' && r.unitManagerId === um.id);
        const tlIds = tlsInUnit.map((tl) => tl.id);

        const recruitersInUnit = recruiters.filter(
          (r) => r.unitManagerId === um.id || (r.teamLeaderId && tlIds.includes(r.teamLeaderId)) || r.id === um.id
        );

        const recIds = recruitersInUnit.map((r) => r.id);
        const recUsernames = recruitersInUnit.map((r) => r.username.toLowerCase());

        const unitApps = filteredCandidates.filter(
          (c) =>
            recIds.includes(c.recruiterId) ||
            recUsernames.includes((c.recruiterCode || '').toLowerCase())
        );

        const accepted = unitApps.filter(
          (c) => (c.status || '').trim().toLowerCase() === 'voice note accepted'
        ).length;

        const rate = unitApps.length > 0 ? ((accepted / unitApps.length) * 100).toFixed(1) : '0';

        return {
          id: um.id,
          name: um.fullName,
          tlCount: tlsInUnit.length,
          recruiterCount: recruitersInUnit.length,
          totalApps: unitApps.length,
          accepted,
          rate: parseFloat(rate),
        };
      })
      .sort((a, b) => b.accepted - a.accepted);
  }, [recruiters, filteredCandidates]);

  return (
    <div className="space-y-6">
      {/* Top Header & Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shadow-xs">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Executive Analytics Dashboard / لوحة تحليلات الإدارة
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live conversion rates, company metrics, and team hierarchy breakdown.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeFilter === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Current Month / الشهر الحالي
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time / الكل
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pipeline</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-2">{totalApps}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Candidates submitted</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200/90 bg-emerald-50/20 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Voice Notes Accepted</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-950 font-mono mt-2">{voiceAccepted}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-600" />
            <span>Ready for interview scheduling</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Conversion Rate</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 font-mono mt-2">{overallConversionRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Accepted / Total Applications
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled Interviews</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-950 font-mono mt-2">{upcomingInterviews}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Upcoming company slots
          </div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Performance Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Company Performance & Conversion Rates</h3>
                <p className="text-[11px] text-slate-500">Total Applications vs Voice Note Accepted per Client Company</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-mono">
              {companyStats.length} Companies
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyStats.slice(0, 8)} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="companyName"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="total" name="Total Applications" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="accepted" name="Voice Accepted" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pipeline Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Pipeline Status Distribution</h3>
            </div>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            {statusPieData.length === 0 ? (
              <div className="text-xs text-slate-400 italic">No candidates available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 max-h-28 overflow-y-auto">
            {statusPieData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-slate-700 truncate max-w-[130px]">{item.name}</span>
                </div>
                <span className="font-bold font-mono text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Company Conversion Rates Detailed Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-sm">Detailed Company Conversion Rates / نسب النجاح لكل شركة</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Company Name</th>
                <th className="p-3.5 text-center">Total Applications</th>
                <th className="p-3.5 text-center">Voice Accepted</th>
                <th className="p-3.5 text-center">Conversion Rate (%)</th>
                <th className="p-3.5 text-right">Performance Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {companyStats.map((comp) => (
                <tr key={comp.companyName} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    {comp.companyName}
                  </td>
                  <td className="p-3.5 text-center font-mono font-bold text-slate-800">{comp.total}</td>
                  <td className="p-3.5 text-center font-mono font-bold text-emerald-600">{comp.accepted}</td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full font-bold font-mono text-xs ${
                        comp.rate >= 40
                          ? 'bg-emerald-100 text-emerald-800'
                          : comp.rate >= 20
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {comp.rate}%
                    </span>
                  </td>
                  <td className="p-3.5 text-right max-w-[160px]">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${Math.min(comp.rate, 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Leader & Unit Manager Hierarchy Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Leader Performance */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Team Leader Conversion Performance</h3>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {teamLeaderStats.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs italic">No team leader records yet.</div>
            ) : (
              teamLeaderStats.map((tl) => (
                <div key={tl.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{tl.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      @{tl.username} • {tl.memberCount} Team Members
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      {tl.accepted} / {tl.totalApps} Accepted
                    </div>
                    <div className="text-xs font-bold text-emerald-600 font-mono">{tl.rate}% Conversion</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Unit Manager Performance */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-sm">Unit Manager Hierarchy Breakdown</h3>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {unitManagerStats.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs italic">No unit manager records yet.</div>
            ) : (
              unitManagerStats.map((um) => (
                <div key={um.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{um.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {um.tlCount} Team Leaders • {um.recruiterCount} Total Recruiters
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      {um.accepted} / {um.totalApps} Accepted
                    </div>
                    <div className="text-xs font-bold text-purple-600 font-mono">{um.rate}% Conversion</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
