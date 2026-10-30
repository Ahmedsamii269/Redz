import React from 'react';
import { Trophy, Medal, Award, Crown, Calendar, Users, Building2, TrendingUp } from 'lucide-react';
import { CandidateApplication, User } from '../types';
import { isDateInCurrentMonth } from '../lib/storage';

interface LeaderboardProps {
  candidates: CandidateApplication[];
  recruiters: User[];
  isMonthly?: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ candidates, recruiters, isMonthly = true }) => {
  // Filter candidates based on monthly requirement
  const relevantCandidates = isMonthly 
    ? candidates.filter(c => isDateInCurrentMonth(c.createdAt))
    : candidates;

  const recruiterStats = React.useMemo(() => {
    const rawStats: Record<string, number> = {};
    relevantCandidates.forEach((c) => {
      const s = (c.status || '').trim().toLowerCase();
      if (s === 'voice note accepted') {
        const recKey = c.recruiterId || c.recruiterCode || 'unknown';
        rawStats[recKey] = (rawStats[recKey] || 0) + 1;
      }
    });

    // Map any stats using username or referralCode to the recruiter's canonical ID
    const canonicalStats: Record<string, number> = {};
    Object.entries(rawStats).forEach(([key, count]) => {
      const rec = recruiters.find(
        (r) => r.id === key || r.username.toLowerCase() === key.toLowerCase() || r.referralCode?.toLowerCase() === key.toLowerCase()
      );
      const canonicalId = rec ? rec.id : key;
      canonicalStats[canonicalId] = (canonicalStats[canonicalId] || 0) + count;
    });

    return Object.entries(canonicalStats)
      .map(([id, count]) => {
        const rec = recruiters.find(
          (r) => r.id === id || r.username.toLowerCase() === id.toLowerCase() || r.referralCode?.toLowerCase() === id.toLowerCase()
        );
        return {
          id,
          name: rec?.fullName || 'Recruiter',
          username: rec?.username || id,
          count,
          avatar: rec?.fullName?.charAt(0) || '?',
          role: rec?.role || 'recruiter',
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [relevantCandidates, recruiters]);

  const leaderStats = React.useMemo(() => {
    const leaderMap: Record<string, number> = {};
    const teamLeaders = recruiters.filter((r) => r.role === 'team_leader');

    recruiters.forEach((r) => {
      const recPerformance = recruiterStats.find((s) => s.id === r.id || s.username.toLowerCase() === r.username.toLowerCase())?.count || 0;
      if (r.teamLeaderId) {
        leaderMap[r.teamLeaderId] = (leaderMap[r.teamLeaderId] || 0) + recPerformance;
      }
    });

    return teamLeaders
      .map((l) => {
        const teamScore = (leaderMap[l.id] || 0) + (leaderMap[l.username] || 0);
        const leaderOwnScore = recruiterStats.find((s) => s.id === l.id || s.username.toLowerCase() === l.username.toLowerCase())?.count || 0;
        return {
          id: l.id,
          name: l.fullName,
          count: teamScore + leaderOwnScore,
          avatar: l.fullName.charAt(0),
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [recruiters, recruiterStats]);

  const unitManagerStats = React.useMemo(() => {
    const unitMap: Record<string, number> = {};
    const unitManagers = recruiters.filter((r) => r.role === 'unit_manager');

    // Map team leaders belonging to unit managers
    const tlUnderUnit: Record<string, string[]> = {};
    recruiters.forEach((r) => {
      if (r.role === 'team_leader' && r.unitManagerId) {
        tlUnderUnit[r.unitManagerId] = tlUnderUnit[r.unitManagerId] || [];
        tlUnderUnit[r.unitManagerId].push(r.id, r.username);
      }
    });

    recruiters.forEach((r) => {
      const recPerformance = recruiterStats.find((s) => s.id === r.id || s.username.toLowerCase() === r.username.toLowerCase())?.count || 0;
      if (r.unitManagerId) {
        unitMap[r.unitManagerId] = (unitMap[r.unitManagerId] || 0) + recPerformance;
      } else if (r.teamLeaderId) {
        Object.entries(tlUnderUnit).forEach(([umId, tlList]) => {
          if (tlList.includes(r.teamLeaderId!)) {
            unitMap[umId] = (unitMap[umId] || 0) + recPerformance;
          }
        });
      }
    });

    return unitManagers
      .map((u) => {
        const unitScore = (unitMap[u.id] || 0) + (unitMap[u.username] || 0);
        const umOwnScore = recruiterStats.find((s) => s.id === u.id || s.username.toLowerCase() === u.username.toLowerCase())?.count || 0;
        return {
          id: u.id,
          name: u.fullName,
          count: unitScore + umOwnScore,
          avatar: u.fullName.charAt(0),
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [recruiters, recruiterStats]);

  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">Performance Leaderboard</h2>
              <p className="text-xs text-slate-500">
                Live rankings based on <span className="font-bold text-emerald-600">Voice Note Accepted</span> status.
              </p>
            </div>
          </div>
          <div className="px-4 py-2 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2 text-sm font-bold">
            <Calendar className="w-4 h-4" />
            <span>Cycle: {currentMonthName}</span>
            <span className="ml-1 text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">Monthly Reset</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recruiters Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Medal className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-slate-900 text-sm">Top Recruiters</h3>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[500px]">
            {recruiterStats.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs italic">No data this month yet.</div>
            ) : (
              recruiterStats.map((stat, idx) => (
                <LeaderboardItem key={stat.id} stat={stat} rank={idx + 1} colorClass="bg-amber-500" label="Accepted" />
              ))
            )}
          </div>
        </div>

        {/* Team Leaders Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Top Team Leaders</h3>
            </div>
            <Users className="w-4 h-4 text-slate-400" />
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[500px]">
            {leaderStats.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs italic">No team data this month.</div>
            ) : (
              leaderStats.map((stat, idx) => (
                <LeaderboardItem key={stat.id} stat={stat} rank={idx + 1} colorClass="bg-blue-600" label="Team Total" />
              ))
            )}
          </div>
        </div>

        {/* Unit Managers Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-sm">Top Unit Managers</h3>
            </div>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[500px]">
            {unitManagerStats.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs italic">No unit data this month.</div>
            ) : (
              unitManagerStats.map((stat, idx) => (
                <LeaderboardItem key={stat.id} stat={stat} rank={idx + 1} colorClass="bg-purple-600" label="Unit Total" />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LeaderboardItem: React.FC<{ stat: any; rank: number; colorClass: string; label: string }> = ({ stat, rank, colorClass, label }) => {
  const isTop3 = rank <= 3;
  
  return (
    <div className={`p-4 flex items-center justify-between transition-colors hover:bg-slate-50/50 ${rank === 1 ? 'bg-slate-50/30' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-xs ${
            isTop3 ? `${colorClass} ring-4 ring-offset-1 ring-slate-100` : 'bg-slate-200 text-slate-500'
          }`}>
            {stat.avatar}
          </div>
          {rank === 1 && <Crown className="w-4 h-4 text-amber-500 absolute -top-2 -right-1 rotate-12 fill-amber-500" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">{stat.name}</span>
            {stat.username && <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">@{stat.username}</span>}
          </div>
          <div className="text-[10px] text-slate-500">Rank #{rank}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xl font-black font-mono text-slate-900">{stat.count}</div>
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{label}</div>
      </div>
    </div>
  );
};
