import React from 'react';
import { StatusConfig } from '../types';

interface StatusBadgeProps {
  status: string;
  statuses?: StatusConfig[];
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, statuses = [], size = 'md' }) => {
  const config = statuses.find((s) => s.key === status || s.labelAr === status || s.labelEn === status);
  let color = config?.color || '#64748B';
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('reject') || lowerStatus.includes('no show')) {
    color = '#DC2626'; // Strong Red
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-medium',
  };

  const displayText = config ? (config.labelEn || config.labelAr) : status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-semibold border transition-colors whitespace-nowrap ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${color}15`,
        borderColor: `${color}40`,
        color: color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span>{displayText}</span>
    </span>
  );
};
