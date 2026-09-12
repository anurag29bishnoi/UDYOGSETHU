import React from 'react';
import { CheckCircle2, AlertCircle, Clock, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', showIcon = true }) => {
  const norm = status.toUpperCase();

  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = Clock;

  if (norm === 'VERIFIED' || norm === 'APPROVED' || norm === 'PASS' || norm === 'LIKELY ELIGIBLE' || norm === 'COMPLETED') {
    bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    Icon = CheckCircle2;
  } else if (norm === 'NEEDS_REVIEW' || norm === 'QUERY_RAISED' || norm === 'WARNING' || norm === 'POTENTIALLY ELIGIBLE' || norm === 'RENEWAL_DUE') {
    bg = 'bg-amber-50 text-amber-800 border-amber-200';
    Icon = AlertTriangle;
  } else if (norm === 'SLA_BREACHED' || norm === 'BREACHED' || norm === 'FAIL' || norm === 'REJECTED' || norm === 'NOT ELIGIBLE' || norm === 'OVERDUE' || norm === 'EXPIRED') {
    bg = 'bg-red-50 text-red-800 border-red-200';
    Icon = XCircle;
  } else if (norm === 'UNDER_REVIEW' || norm === 'INSPECTION_SCHEDULED' || norm === 'SUBMITTED' || norm === 'APPLIED') {
    bg = 'bg-blue-50 text-blue-800 border-blue-200';
    Icon = Clock;
  }

  const label = status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${bg} ${className}`}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1 shrink-0" />}
      {label}
    </span>
  );
};

export const SLABadge: React.FC<{
  slaStatus: string;
  remainingDays?: number;
  statutoryDays?: number;
}> = ({ slaStatus, remainingDays, statutoryDays }) => {
  if (slaStatus === 'BREACHED' || (remainingDays !== undefined && remainingDays < 0)) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
        <XCircle className="w-3 h-3 mr-1 text-red-600" />
        SLA Breached ({Math.abs(remainingDays || 0)}d overdue)
      </span>
    );
  }

  if (slaStatus === 'APPROACHING_DEADLINE' || (remainingDays !== undefined && remainingDays <= 3)) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
        <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
        Due Soon ({remainingDays}d remaining)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
      <Clock className="w-3 h-3 mr-1 text-emerald-600" />
      On Track ({remainingDays !== undefined ? `${remainingDays}d left` : `${statutoryDays || 15}d SLA`})
    </span>
  );
};
