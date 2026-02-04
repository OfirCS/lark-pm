'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  color: 'slate' | 'amber' | 'emerald' | 'rose';
  children: React.ReactNode;
}

const colorClasses = {
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    header: 'text-slate-700',
    badge: 'bg-slate-200 text-slate-700',
    dot: 'bg-slate-400',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    header: 'text-amber-700',
    badge: 'bg-amber-200 text-amber-700',
    dot: 'bg-amber-400',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    header: 'text-emerald-700',
    badge: 'bg-emerald-200 text-emerald-700',
    dot: 'bg-emerald-400',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    header: 'text-rose-700',
    badge: 'bg-rose-200 text-rose-700',
    dot: 'bg-rose-400',
  },
};

export function KanbanColumn({
  title,
  count,
  color,
  children,
}: KanbanColumnProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border min-w-[280px] max-w-[320px]',
        colors.bg,
        colors.border
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-inherit">
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', colors.dot)} />
          <h3 className={cn('font-semibold text-sm', colors.header)}>{title}</h3>
        </div>
        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', colors.badge)}>
          {count}
        </span>
      </div>

      {/* Cards Container */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
        {children}
      </div>
    </div>
  );
}
