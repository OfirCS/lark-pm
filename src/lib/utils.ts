import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(date);
}

export function getSentimentColor(sentiment: 'positive' | 'negative' | 'neutral'): string {
  switch (sentiment) {
    case 'positive':
      return 'text-emerald-500';
    case 'negative':
      return 'text-rose-500';
    case 'neutral':
      return 'text-slate-500';
  }
}

export function getUrgencyColor(urgency: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (urgency) {
    case 'critical':
      return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    case 'high':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'low':
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
}

export function getPlatformIcon(platform: 'reddit' | 'twitter' | 'call' | 'ticket' | 'slack'): string {
  switch (platform) {
    case 'reddit':
      return '🔴';
    case 'twitter':
      return '𝕏';
    case 'call':
      return '📞';
    case 'ticket':
      return '🎫';
    case 'slack':
      return '💬';
  }
}

export function calculateRICEScore(
  reach: number,
  impact: number,
  confidence: number,
  effort: number
): number {
  if (effort === 0) return 0;
  return Math.round((reach * impact * confidence) / effort);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}
