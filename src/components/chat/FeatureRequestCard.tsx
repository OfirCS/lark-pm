'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Building2,
  MessageSquare,
  ArrowUpRight,
  GitBranch,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Quote {
  source: string;
  text: string;
  author?: string;
}

interface FeatureRequestData {
  title: string;
  mentionCount: number;
  score: number;
  revenueImpact: number;
  enterpriseBlockers: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  topQuotes: Quote[];
}

interface FeatureRequestCardProps {
  data: FeatureRequestData;
  rank: number;
  onCreateTicket?: () => void;
  onViewMentions?: () => void;
}

export function FeatureRequestCard({
  data,
  rank,
  onCreateTicket,
  onViewMentions,
}: FeatureRequestCardProps) {
  const priorityColors = {
    urgent: 'bg-rose-500 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-indigo-500 text-white',
    low: 'bg-stone-400 text-white',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-smooth hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start gap-4 p-4 border-b border-stone-100">
        {/* Rank & Priority */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-sm">
            {rank}
          </div>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase',
              priorityColors[data.priority]
            )}
          >
            {data.priority}
          </span>
        </div>

        {/* Title & Stats */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-stone-900 text-lg mb-1">{data.title}</h4>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-stone-500">
              <MessageSquare size={12} />
              {data.mentionCount} mentions
            </span>
            <span className="flex items-center gap-1 text-indigo-600 font-medium">
              <TrendingUp size={12} />
              Score: {data.score}
            </span>
          </div>
        </div>

        {/* Score Badge */}
        <div className="text-right">
          <div className="text-3xl font-bold text-stone-900">{data.score}</div>
          <div className="text-[10px] text-stone-500 uppercase tracking-wide">Priority</div>
        </div>
      </div>

      {/* Revenue Impact */}
      <div className="px-4 py-3 bg-stone-50/50 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <DollarSign size={16} className="text-emerald-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-emerald-700">
              ${data.revenueImpact}k
            </div>
            <div className="text-[10px] text-stone-500">Revenue at risk</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Building2 size={16} className="text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-blue-700">
              {data.enterpriseBlockers} deals
            </div>
            <div className="text-[10px] text-stone-500">Blocked</div>
          </div>
        </div>

        {data.enterpriseBlockers >= 3 && (
          <div className="ml-auto px-3 py-1.5 bg-rose-100 text-rose-700 text-xs font-medium rounded-lg">
            🚨 High Impact
          </div>
        )}
      </div>

      {/* Quotes */}
      <div className="p-4 space-y-3">
        {data.topQuotes.map((quote, index) => (
          <div key={index} className="flex gap-3 text-sm">
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wide shrink-0 w-16">
              {quote.source}
            </span>
            <div className="flex-1">
              <p className="text-stone-600 line-clamp-2">"{quote.text}"</p>
              {quote.author && (
                <p className="text-xs text-stone-400 mt-1">— {quote.author}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateTicket}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors"
        >
          <GitBranch size={16} />
          Create Linear Ticket
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onViewMentions}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-700 text-sm font-medium rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all"
        >
          <ExternalLink size={16} />
          View Mentions
        </motion.button>
      </div>
    </motion.div>
  );
}
