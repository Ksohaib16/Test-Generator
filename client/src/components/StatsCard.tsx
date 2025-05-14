import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: ReactNode;
  iconBgColor: string;
}

export default function StatsCard({ title, value, change, icon, iconBgColor }: StatsCardProps) {
  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">{title}</span>
          <div className={cn('p-2.5 rounded-full', iconBgColor, 'shadow-sm')}>
            {icon}
          </div>
        </div>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">{value}</span>
          {change && (
            <span 
              className={cn(
                'ml-2 text-sm flex items-center', 
                change.isPositive ? 'text-green-500' : 'text-red-500'
              )}
            >
              <span className="mr-1 text-lg">
                {change.isPositive ? '↑' : '↓'}
              </span>
              {Math.abs(change.value)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}