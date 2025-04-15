import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Calendar } from 'lucide-react';

interface UsageCardProps {
  storiesUsed: number;
  storiesQuota: number;
  resetDate: Date;
}

/**
 * UsageCard displays the user's current story usage and quota for the month.
 * Props:
 *  - storiesUsed: number of stories generated this period
 *  - storiesQuota: max allowed stories for the plan
 *  - resetDate: when the quota resets
 */
const UsageCard: React.FC<UsageCardProps> = ({ storiesUsed, storiesQuota, resetDate }) => {
  const percent = Math.min((storiesUsed / storiesQuota) * 100, 100);
  const formattedDate = resetDate.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="mb-8">
      <div className="rounded-xl bg-white shadow-sm border p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block bg-violet-100 text-violet-700 rounded-full p-2">
            {/* Fun icon for kid-friendliness */}
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 2l2.09 6.26L20 9.27l-5 3.64L16.18 21 12 17.27 7.82 21 9 12.91l-5-3.64 5.91-.01L12 2z" fill="#a78bfa"/></svg>
          </span>
          <h2 className="text-xl font-bold text-slate-900">Usage This Month</h2>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-slate-800">{storiesUsed} / {storiesQuota} stories used</span>
        </div>
        <Progress value={percent} className="h-3 bg-violet-100" />
        <div className="flex items-center text-slate-500 mt-2">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Resets on <span className="font-medium text-slate-700">{formattedDate}</span></span>
        </div>
      </div>
    </div>
  );
};

export default UsageCard;
