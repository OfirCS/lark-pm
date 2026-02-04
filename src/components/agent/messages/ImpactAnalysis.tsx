'use client';

import { Code, Palette, Briefcase, Users, Lightbulb, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import type { ImpactAnalysis as ImpactAnalysisType, RoleImpact } from '@/types/agent';

interface ImpactAnalysisProps {
  impact?: ImpactAnalysisType;
}

const roleConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  developer: {
    icon: <Code size={16} />,
    label: 'Developers',
    color: '#3b82f6',
  },
  uiux: {
    icon: <Palette size={16} />,
    label: 'UI/UX',
    color: '#8b5cf6',
  },
  design: {
    icon: <Lightbulb size={16} />,
    label: 'Design',
    color: '#ec4899',
  },
  stakeholder: {
    icon: <Briefcase size={16} />,
    label: 'Stakeholders',
    color: '#f59e0b',
  },
  pm: {
    icon: <Users size={16} />,
    label: 'Product Managers',
    color: '#10b981',
  },
};

const recommendationConfig = {
  ship_now: { label: 'SHIP NOW', color: 'var(--success)', bgColor: 'var(--success-subtle)' },
  plan_next: { label: 'PLAN NEXT', color: 'var(--accent)', bgColor: 'var(--accent-subtle)' },
  research_more: { label: 'RESEARCH MORE', color: 'var(--warning)', bgColor: 'var(--warning-subtle)' },
  deprioritize: { label: 'DEPRIORITIZE', color: 'var(--foreground-muted)', bgColor: 'var(--background-subtle)' },
};

function SentimentBar({ score }: { score: number }) {
  // Score is -100 to 100, convert to percentage for display
  const percentage = Math.round((score + 100) / 2);
  const isPositive = score > 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-[var(--card-border)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: isPositive ? 'var(--success)' : score < 0 ? 'var(--danger)' : 'var(--foreground-muted)',
          }}
        />
      </div>
      <span className="text-xs font-medium w-12 text-right">
        {percentage}% {isPositive ? '+' : ''}
      </span>
    </div>
  );
}

function RoleCard({ role }: { role: RoleImpact }) {
  const config = roleConfig[role.role] || roleConfig.pm;

  return (
    <div className="p-3 rounded-lg border border-[var(--card-border)] hover:border-[var(--foreground-subtle)] transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: config.color }}>{config.icon}</span>
        <span className="text-sm font-medium">{config.label}</span>
        <span className="text-xs text-[var(--foreground-muted)] ml-auto">
          {role.mentionCount} mentions
        </span>
      </div>

      <SentimentBar score={role.sentimentScore} />

      {role.representativeQuote && (
        <p className="mt-2 text-xs text-[var(--foreground-muted)] italic line-clamp-2">
          &quot;{role.representativeQuote}&quot;
        </p>
      )}

      {role.keyConcerns.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {role.keyConcerns.slice(0, 2).map((concern, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded text-[10px] bg-[var(--danger-subtle)] text-[var(--danger)]"
            >
              {concern}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function ImpactAnalysis({ impact }: ImpactAnalysisProps) {
  if (!impact) {
    return null;
  }

  const recConfig = recommendationConfig[impact.recommendation];

  return (
    <div className="space-y-3 pl-1">
      {/* Header */}
      <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[var(--accent)]" />
            <span className="font-serif font-medium">Impact Analysis</span>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: recConfig.bgColor, color: recConfig.color }}
          >
            {recConfig.label}
          </span>
        </div>

        <h3 className="text-lg font-medium mb-1">{impact.feature}</h3>
        <p className="text-sm text-[var(--foreground-muted)]">
          Confidence: {impact.confidence}% based on {impact.roles.reduce((sum, r) => sum + r.mentionCount, 0)} data points
        </p>
      </div>

      {/* Role breakdown */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wide px-1">
          By Role
        </h4>
        {impact.roles.map((role) => (
          <RoleCard key={role.role} role={role} />
        ))}
      </div>

      {/* Revenue impact */}
      <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--background-subtle)]">
        <h4 className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wide mb-3">
          Business Impact
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-[var(--danger)]" />
            <div>
              <div className="text-sm font-medium">${(impact.revenueImpact.atRiskArr / 1000).toFixed(0)}K</div>
              <div className="text-[10px] text-[var(--foreground-muted)]">ARR at risk</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-[var(--success)]" />
            <div>
              <div className="text-sm font-medium">${(impact.revenueImpact.potentialExpansion / 1000).toFixed(0)}K</div>
              <div className="text-[10px] text-[var(--foreground-muted)]">Expansion potential</div>
            </div>
          </div>
        </div>

        {impact.revenueImpact.churnMentions > 0 && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-[var(--danger-subtle)] border border-[var(--danger)]/20">
            <span className="text-xs text-[var(--danger)]">
              ⚠️ {impact.revenueImpact.churnMentions} customers mentioned this as a churn risk
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 btn btn-primary text-sm py-2">
          Add to Roadmap
        </button>
        <button className="flex-1 btn btn-secondary text-sm py-2">
          Generate PRD
        </button>
      </div>
    </div>
  );
}
