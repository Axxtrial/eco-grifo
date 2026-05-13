import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  className 
}: StatCardProps) {
  return (
    <div className={cn("bg-card border border-border rounded-2xl p-4", className)}>
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-primary/10 p-1.5 rounded-lg">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-xs text-muted font-medium">{title}</h3>
      </div>
      
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        {subtitle && <span className="text-xs text-muted mb-1">{subtitle}</span>}
      </div>

      {trend && trendValue && (
        <div className="mt-2 text-xs font-medium">
          <span className={cn(
            trend === 'up' ? "text-red-400" : 
            trend === 'down' ? "text-green-400" : "text-gray-400"
          )}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
          <span className="text-muted ml-1">vs anterior</span>
        </div>
      )}
    </div>
  );
}
