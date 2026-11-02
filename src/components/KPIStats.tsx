import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, Briefcase, CheckCircle, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  title: string;
  value: string | number;
  trend: number;
  trendLabel: string;
  icon: React.ReactNode;
  data: { value: number }[];
  color: 'blue' | 'green' | 'amber' | 'purple' | 'red';
}

const colorConfig = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    stroke: '#2563eb',
    iconBg: 'bg-blue-100 dark:bg-blue-800/30',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400',
    stroke: '#16a34a',
    iconBg: 'bg-green-100 dark:bg-green-800/30',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    stroke: '#d97706',
    iconBg: 'bg-amber-100 dark:bg-amber-800/30',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400',
    stroke: '#9333ea',
    iconBg: 'bg-purple-100 dark:bg-purple-800/30',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    stroke: '#dc2626',
    iconBg: 'bg-red-100 dark:bg-red-800/30',
  },
};

function StatCard({ title, value, trend, trendLabel, icon, data, color }: StatCardProps) {
  const config = colorConfig[color];
  const isPositive = trend >= 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2.5 rounded-xl transition-colors", config.iconBg)}>
          {(React as any).cloneElement(icon, { className: cn("w-5 h-5", config.text) })}
        </div>
        <div className="h-10 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={config.stroke}
                strokeWidth={2}
                dot={false}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {value}
          </span>
          <div className={cn(
            "flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md",
            isPositive ? "text-green-600 bg-green-50 dark:bg-green-900/30" : "text-red-600 bg-red-50 dark:bg-red-900/30"
          )}>
            {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {Math.abs(trend)}%
          </div>
        </div>
        <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-1">
          {trendLabel}
        </p>
      </div>
    </div>
  );
}

interface KPIStatsProps {
  candidatesCount: number;
  activeOffersCount: number;
  hiredCount: number;
  avgTime?: number;
}

export function KPIStats({ candidatesCount, activeOffersCount, hiredCount, avgTime = 12 }: KPIStatsProps) {
  // Mock trend data for sparklines
  const generateMockData = (base: number) => {
    return Array.from({ length: 7 }, (_, i) => ({
      value: base + Math.floor(Math.random() * (base * 0.4)) - (base * 0.2)
    }));
  };

  return (
    <div className="relative">
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 snap-x snap-mandatory scroll-smooth no-scrollbar">
        <div className="min-w-[250px] sm:min-w-0 snap-start flex-1">
          <StatCard
            title="Total Candidates"
            value={candidatesCount}
            trend={12.5}
            trendLabel="vs. last month"
            icon={<Users />}
            data={generateMockData(20)}
            color="blue"
          />
        </div>
        <div className="min-w-[250px] sm:min-w-0 snap-start flex-1">
          <StatCard
            title="Active Job Offers"
            value={activeOffersCount}
            trend={-4.2}
            trendLabel="vs. last month"
            icon={<Briefcase />}
            data={generateMockData(15)}
            color="purple"
          />
        </div>
        <div className="min-w-[250px] sm:min-w-0 snap-start flex-1">
          <StatCard
            title="Successful Hires"
            value={hiredCount}
            trend={28.4}
            trendLabel="vs. last month"
            icon={<CheckCircle />}
            data={generateMockData(10)}
            color="green"
          />
        </div>
        <div className="min-w-[250px] sm:min-w-0 snap-start flex-1">
          <StatCard
            title="Avg. Time to Hire"
            value={`${avgTime} Days`}
            trend={-8.1}
            trendLabel="Lower is better"
            icon={<Clock />}
            data={generateMockData(12)}
            color="amber"
          />
        </div>
      </div>
      {/* Mobile Swipe Hint */}
      <div className="flex sm:hidden items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-1">
        <span>⟵ اسحب للأرقام الأخرى (Swipe) ⟶</span>
      </div>
    </div>
  );
}
