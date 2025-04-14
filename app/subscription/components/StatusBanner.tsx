import React from 'react';
import type { SubscriptionStatus } from '@/contexts/subscription-context';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface StatusBannerProps {
  status: SubscriptionStatus;
  message?: string;
}

const StatusBadge: React.FC<{ status: SubscriptionStatus }> = ({ status }) => {
  let icon = null;
  let badgeClass = 'inline-flex items-center px-3 py-1 rounded-full font-semibold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition';
  switch (status) {
    case 'active':
      icon = <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />;
      badgeClass += ' bg-green-100 text-green-800 shadow-green-200 hover:animate-pulse';
      break;
    case 'trialing':
      icon = <Clock className="h-4 w-4 mr-1 text-blue-500" />;
      badgeClass += ' bg-blue-100 text-blue-800';
      break;
    case 'canceled':
      icon = <AlertCircle className="h-4 w-4 mr-1 text-orange-500" />;
      badgeClass += ' bg-orange-100 text-orange-800';
      break;
    default:
      icon = <AlertCircle className="h-4 w-4 mr-1 text-slate-500" />;
      badgeClass += ' bg-slate-100 text-slate-700';
  }
  return (
    <span className={badgeClass} tabIndex={0} aria-label={status + ' status'}>
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const StatusBanner: React.FC<StatusBannerProps> = ({ status, message }) => {
  return (
    <div role="alert" aria-live="polite">
      <StatusBadge status={status} />
      {message && <span className="ml-2">{message}</span>}
    </div>
  );
};

export default React.memo(StatusBanner);
