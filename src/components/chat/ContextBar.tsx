'use client';

import { motion } from 'framer-motion';
import { Radio, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextBarProps {
  stats: {
    conversationsAnalyzed: number;
    newInsights: number;
    urgentItems: number;
    lastUpdate: string;
  };
}

export function ContextBar({ stats }: ContextBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="bg-white rounded-2xl border border-stone-200 shadow-smooth p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Main message */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Radio size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-stone-900">
                Analyzed <span className="font-bold">{stats.conversationsAnalyzed.toLocaleString()}</span> conversations
              </h2>
              <p className="text-xs text-stone-500">
                From Reddit, Twitter, and Slack in the last 24 hours
              </p>
            </div>
          </div>

          {/* Stats pills */}
          <div className="flex items-center gap-2">
            <StatPill
              icon={TrendingUp}
              value={`+${stats.newInsights}`}
              label="new insights"
              color="indigo"
            />
            <StatPill
              icon={AlertCircle}
              value={stats.urgentItems.toString()}
              label="urgent"
              color="rose"
            />
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-500">
              <Clock size={12} />
              <span>Updated {stats.lastUpdate}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatPill({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  color: 'indigo' | 'rose' | 'amber' | 'emerald';
}) {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium',
      colorClasses[color]
    )}>
      <Icon size={12} />
      <span className="font-bold">{value}</span>
      <span className="opacity-80">{label}</span>
    </div>
  );
}
