import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, change, className }: StatsCardProps) {
  return (
    <div className={cn('bg-white rounded-xl p-6 border border-brand-grey-200', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-brand-grey-500 mb-1">{title}</p>
          <p className="text-2xl font-display font-bold text-brand-black">{value}</p>
          {change && (
            <p
              className={cn(
                'text-sm mt-2',
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              )}
            >
              {change.type === 'increase' ? '↑' : '↓'} {Math.abs(change.value)}%{' '}
              <span className="text-brand-grey-400">vs last month</span>
            </p>
          )}
        </div>
        <div className="p-3 bg-brand-grey-100 rounded-lg">
          <Icon className="w-6 h-6 text-brand-grey-600" />
        </div>
      </div>
    </div>
  );
}
