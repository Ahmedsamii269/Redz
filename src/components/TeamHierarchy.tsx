import React, { useState } from 'react';
import { User, CandidateApplication } from '../types';
import { ChevronRight, ChevronDown, Users, TrendingUp, Shield, User as UserIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TeamNodeProps {
  user: User;
  candidates: CandidateApplication[];
  allUsers: User[];
  depth: number;
}

function TeamNode({ user, candidates, allUsers, depth }: TeamNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  
  // Find direct reports
  const directReports = allUsers.filter(u => {
    if (user.role === 'account_manager') return u.accountManagerId === user.id && u.role === 'unit_manager';
    if (user.role === 'unit_manager') return u.unitManagerId === user.id && u.role === 'team_leader';
    if (user.role === 'team_leader') return u.teamLeaderId === user.id && u.role === 'recruiter';
    return false;
  });

  // Calculate performance metrics
  const userCandidates = candidates.filter(c => c.recruiterId === user.id);
  const hiredCount = userCandidates.filter(c => c.status === 'accepted' || c.status === 'hired').length;
  
  // Recursive calculation for team performance
  const getTeamMetrics = (u: User): { candidates: number, hired: number } => {
    const reports = allUsers.filter(report => {
      if (u.role === 'account_manager') return report.accountManagerId === u.id;
      if (u.role === 'unit_manager') return report.unitManagerId === u.id;
      if (u.role === 'team_leader') return report.teamLeaderId === u.id;
      return false;
    });

    let totalCands = candidates.filter(c => c.recruiterId === u.id).length;
    let totalHired = candidates.filter(c => c.recruiterId === u.id && (c.status === 'accepted' || c.status === 'hired')).length;

    reports.forEach(report => {
      const reportMetrics = getTeamMetrics(report);
      totalCands += reportMetrics.candidates;
      totalHired += reportMetrics.hired;
    });

    return { candidates: totalCands, hired: totalHired };
  };

  const teamMetrics = getTeamMetrics(user);

  return (
    <div className="mb-2">
      <div 
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer",
          "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-sm",
          depth === 0 && "border-l-4 border-l-red-500"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 flex-1">
          {directReports.length > 0 ? (
            <div className="text-slate-400">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          ) : (
            <div className="w-4" />
          )}
          
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
            user.role === 'account_manager' ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
            user.role === 'unit_manager' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
            user.role === 'team_leader' ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" :
            "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          )}>
            {user.fullName.charAt(0)}
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                {user.fullName}
              </h4>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                {user.role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Code: <span className="font-mono">{user.referralCode}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">Activity</p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Users className="w-3 h-3 text-slate-400" />
              {teamMetrics.candidates}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">Success</p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400">
              <TrendingUp className="w-3 h-3" />
              {teamMetrics.hired}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && directReports.length > 0 && (
        <div className="ml-6 mt-2 border-l-2 border-slate-100 dark:border-slate-800/50 pl-4 space-y-2">
          {directReports.map(report => (
            <TeamNode 
              key={report.id} 
              user={report} 
              candidates={candidates} 
              allUsers={allUsers} 
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TeamHierarchyProps {
  users: User[];
  candidates: CandidateApplication[];
}

export function TeamHierarchy({ users, candidates }: TeamHierarchyProps) {
  // Find top level managers (Admin doesn't count for chart usually, or start from Account Managers)
  const accountManagers = users.filter(u => u.role === 'account_manager');
  const independentUnits = users.filter(u => u.role === 'unit_manager' && !u.accountManagerId);
  const independentTLs = users.filter(u => u.role === 'team_leader' && !u.unitManagerId && !u.accountManagerId);
  
  const rootUsers = [...accountManagers, ...independentUnits, ...independentTLs];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Organization Structure</h2>
          <p className="text-sm text-slate-500">Visual hierarchy and real-time performance tracking</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-[10px] font-bold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
            <Shield className="w-3 h-3" />
            AM
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
            <Shield className="w-3 h-3" />
            UM
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
            <Shield className="w-3 h-3" />
            TL
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <UserIcon className="w-3 h-3" />
            REC
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        {rootUsers.map(user => (
          <TeamNode 
            key={user.id} 
            user={user} 
            candidates={candidates} 
            allUsers={users} 
            depth={0} 
          />
        ))}
        {rootUsers.length === 0 && (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No hierarchy defined yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
