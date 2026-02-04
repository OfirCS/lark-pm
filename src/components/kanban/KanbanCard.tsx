'use client';

import { motion } from 'framer-motion';
import {
  ExternalLink,
  MessageSquare,
  TrendingUp,
  GitBranch,
  Check,
  X,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  id: string;
  title: string;
  source: string;
  sourceIcon: string;
  category: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'negative' | 'neutral';
  engagementScore: number;
  excerpt: string;
  onApprove?: () => void;
  onReject?: () => void;
  onView?: () => void;
}

const priorityConfig = {
  urgent: { color: 'bg-rose-500', label: 'Urgent', textColor: 'text-rose-700', bgColor: 'bg-rose-50' },
  high: { color: 'bg-orange-500', label: 'High', textColor: 'text-orange-700', bgColor: 'bg-orange-50' },
  medium: { color: 'bg-indigo-500', label: 'Medium', textColor: 'text-indigo-700', bgColor: 'bg-indigo-50' },
  low: { color: 'bg-slate-400', label: 'Low', textColor: 'text-slate-700', bgColor: 'bg-slate-50' },
};

const categoryConfig: Record<string, { icon: string; label: string }> = {
  feature_request: { icon: '✨', label: 'Feature' },
  bug: { icon: '🐛', label: 'Bug' },
  complaint: { icon: '😤', label: 'Complaint' },
  praise: { icon: '🎉', label: 'Praise' },
  question: { icon: '❓', label: 'Question' },
};

export function KanbanCard({
  title,
  source,
  sourceIcon,
  category,
  priority,
  engagementScore,
  excerpt,
  onApprove,
  onReject,
  onView,
}: KanbanCardProps) {
  const priorityStyle = priorityConfig[priority];
  const categoryStyle = categoryConfig[category] || { icon: '📝', label: 'Other' };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm cursor-grab active:cursor-grabbing group"
    >
      {/* Header: Source & Category */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">{sourceIcon}</span>
          <span className="text-xs text-stone-500">{source}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs">{categoryStyle.icon}</span>
          <span className="text-xs text-stone-500">{categoryStyle.label}</span>
        </div>
      </div>

      {/* Title */}
      <h4 className="font-semibold text-stone-900 text-sm mb-2 line-clamp-2">{title}</h4>

      {/* Excerpt */}
      <p className="text-xs text-stone-500 mb-3 line-clamp-2">{excerpt}</p>

      {/* Priority & Score */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className={cn('w-2 h-2 rounded-full', priorityStyle.color)} />
          <span className={cn('text-xs font-medium', priorityStyle.textColor)}>
            {priorityStyle.label}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-stone-500">
          <TrendingUp size={12} />
          <span className="font-medium">{engagementScore}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-stone-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onApprove}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors"
        >
          <GitBranch size={12} />
          Approve
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReject}
          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <X size={14} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onView}
          className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <ExternalLink size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
}
