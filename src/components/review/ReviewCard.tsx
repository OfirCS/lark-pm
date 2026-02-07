'use client';

import { useState } from 'react';
import {
  Check,
  X,
  Edit3,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertTriangle,
  Copy,
} from 'lucide-react';
import type { DraftedTicket } from '@/types/pipeline';
import {
  PRIORITY_COLORS,
  CATEGORY_COLORS,
  SENTIMENT_COLORS,
  SOURCE_CONFIG,
} from '@/types/pipeline';

interface ReviewCardProps {
  draft: DraftedTicket;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onApprove: (id: string, platform: 'linear' | 'jira') => void;
  onReject: (id: string, reason?: string) => void;
  onEdit: (id: string) => void;
}

export function ReviewCard({
  draft,
  isSelected,
  onSelect,
  onApprove,
  onReject,
  onEdit,
}: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const { feedbackItem, classification, draft: ticketDraft, status } = draft;
  const sourceConfig = SOURCE_CONFIG[feedbackItem.source] || SOURCE_CONFIG.reddit;
  const priorityColors = PRIORITY_COLORS[classification.priority];
  const categoryColors = CATEGORY_COLORS[classification.category] || CATEGORY_COLORS.other;
  const sentimentColors = SENTIMENT_COLORS[classification.sentiment];

  const isActionable = status === 'pending' || status === 'edited';
  const timeAgo = getTimeAgo(new Date(draft.createdAt));

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 ${
        isSelected
          ? 'border-indigo-300 bg-indigo-50/30 shadow-md'
          : status === 'approved'
          ? 'border-emerald-200 bg-emerald-50/20'
          : status === 'rejected'
          ? 'border-stone-200 bg-stone-50/50 opacity-60'
          : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-smooth'
      }`}
    >
      {/* Selection checkbox + Header */}
      <div className="flex items-start gap-4 p-5 pb-3">
        {isActionable && (
          <button
            onClick={() => onSelect(draft.id)}
            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              isSelected
                ? 'border-indigo-500 bg-indigo-500'
                : 'border-stone-300 hover:border-stone-400'
            }`}
          >
            {isSelected && <Check size={12} className="text-white" />}
          </button>
        )}

        <div className="flex-1 min-w-0">
          {/* Source + Author + Time */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium"
              style={{ backgroundColor: `${sourceConfig.color}15` }}
            >
              <span>{sourceConfig.icon}</span>
              <span style={{ color: sourceConfig.color }}>{sourceConfig.label}</span>
            </span>

            {feedbackItem.metadata.subreddit && (
              <span className="text-xs text-stone-500">
                r/{feedbackItem.metadata.subreddit}
              </span>
            )}

            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500">
              {feedbackItem.authorHandle || feedbackItem.author}
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-400">{timeAgo}</span>

            {/* External link */}
            <a
              href={feedbackItem.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-stone-400 hover:text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Original feedback content */}
          <div className="relative">
            {feedbackItem.title && (
              <p className="font-medium text-stone-900 text-sm mb-1">
                {feedbackItem.title}
              </p>
            )}
            <p
              className={`text-sm text-stone-600 leading-relaxed ${
                !isExpanded && feedbackItem.content.length > 200
                  ? 'line-clamp-2'
                  : ''
              }`}
            >
              {feedbackItem.content}
            </p>
            {feedbackItem.content.length > 200 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                {isExpanded ? (
                  <>
                    Show less <ChevronUp size={12} />
                  </>
                ) : (
                  <>
                    Show more <ChevronDown size={12} />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Classification badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${categoryColors.bg} ${categoryColors.text} ${categoryColors.border} border`}
            >
              {formatCategory(classification.category)}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${priorityColors.bg} ${priorityColors.text} ${priorityColors.border} border`}
            >
              {classification.priority}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${sentimentColors.bg} ${sentimentColors.text}`}
            >
              {classification.sentiment}
            </span>
            <span className="text-xs text-stone-400">
              {classification.confidence}% confidence
            </span>

            {classification.duplicateOf && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
                <AlertTriangle size={10} />
                Possible duplicate
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Drafted ticket preview */}
      {isActionable && (
        <div className="mx-5 mb-4 p-4 bg-stone-50 rounded-xl border border-stone-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">
              AI Draft
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${ticketDraft.title}\n\n${ticketDraft.description}`
                );
              }}
              className="text-stone-400 hover:text-stone-600 p-1"
              title="Copy to clipboard"
            >
              <Copy size={12} />
            </button>
          </div>
          <p className="font-medium text-stone-900 text-sm mb-1">
            {draft.editedDraft?.title || ticketDraft.title}
          </p>
          <p className="text-xs text-stone-500 line-clamp-2">
            {draft.editedDraft?.description || ticketDraft.description}
          </p>
          {ticketDraft.suggestedLabels.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {ticketDraft.suggestedLabels.map((label) => (
                <span
                  key={label}
                  className="px-1.5 py-0.5 text-[10px] bg-stone-200 text-stone-600 rounded"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status badge for completed items */}
      {status === 'approved' && draft.createdTicket && (
        <div className="mx-5 mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              Created in {draft.createdTicket.platform}
            </span>
          </div>
          <a
            href={draft.createdTicket.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View ticket <ExternalLink size={10} />
          </a>
        </div>
      )}

      {status === 'rejected' && (
        <div className="mx-5 mb-4 p-3 bg-stone-100 rounded-xl flex items-center gap-2">
          <X size={14} className="text-stone-500" />
          <span className="text-sm text-stone-600">
            Rejected{draft.rejectionReason ? `: ${draft.rejectionReason}` : ''}
          </span>
        </div>
      )}

      {/* Actions */}
      {isActionable && (
        <div className="flex items-center gap-2 px-5 pb-5">
          <button
            onClick={() => onEdit(draft.id)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-colors"
          >
            <Edit3 size={12} />
            Edit
          </button>

          <div className="flex-1" />

          {showRejectConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">Reject?</span>
              <button
                onClick={() => {
                  onReject(draft.id);
                  setShowRejectConfirm(false);
                }}
                className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setShowRejectConfirm(false)}
                className="px-3 py-2 text-xs font-medium text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowRejectConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={12} />
                Reject
              </button>

              <div className="flex items-center gap-1 bg-stone-900 rounded-lg overflow-hidden">
                <button
                  onClick={() => onApprove(draft.id, 'linear')}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 transition-colors"
                >
                  <Check size={12} />
                  Approve → Linear
                </button>
                <div className="w-px h-6 bg-stone-700" />
                <button
                  onClick={() => onApprove(draft.id, 'jira')}
                  className="px-3 py-2 text-xs font-medium text-white hover:bg-stone-800 transition-colors"
                >
                  Jira
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Helper functions
function formatCategory(category: string): string {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
