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
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className={cn('p-2 rounded-full', iconBgColor)}>
            {icon}
          </div>
        </div>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold">{value}</span>
          {change && (
            <span 
              className={cn(
                'ml-2 text-sm', 
                change.isPositive ? 'text-green-500' : 'text-red-500'
              )}
            >
              {change.isPositive ? '+' : '-'}{Math.abs(change.value)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}