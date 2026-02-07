'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Code2,
  TrendingUp,
  Users,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Inbox,
} from 'lucide-react';
import { useReviewStore } from '@/lib/stores/reviewStore';
import { useCompanyStore, getCompanyContextForAI } from '@/lib/stores/companyStore';
import { cn } from '@/lib/utils';

type Audience = 'engineering' | 'leadership' | 'sales';

interface AudienceTemplate {
  id: Audience;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const templates: AudienceTemplate[] = [
  {
    id: 'engineering',
    label: 'Engineering',
    description: 'Bugs first, acceptance criteria, technical context',
    icon: Code2,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200 hover:border-blue-300',
  },
  {
    id: 'leadership',
    label: 'Leadership',
    description: 'Revenue impact, business metrics, strategic alignment',
    icon: TrendingUp,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200 hover:border-amber-300',
  },
  {
    id: 'sales',
    label: 'Sales / CS',
    description: 'Customer quotes, churn risk, competitive mentions',
    icon: Users,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200 hover:border-emerald-300',
  },
];

export default function DigestPage() {
  const [selectedAudience, setSelectedAudience] = useState<Audience | null>(null);
  const [digest, setDigest] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const drafts = useReviewStore((state) => state.drafts);
  const { company } = useCompanyStore();

  const stats = useMemo(() => {
    const result = {
      total: drafts.length,
      pending: 0,
      byCategory: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
    };
    drafts.forEach((d) => {
      if (d.status === 'pending' || d.status === 'edited') result.pending++;
      const cat = d.classification?.category || 'other';
      result.byCategory[cat] = (result.byCategory[cat] || 0) + 1;
      const pri = d.classification?.priority || 'medium';
      result.byPriority[pri] = (result.byPriority[pri] || 0) + 1;
      const src = d.feedbackItem?.source || 'unknown';
      result.bySource[src] = (result.bySource[src] || 0) + 1;
    });
    return result;
  }, [drafts]);

  const handleGenerate = async (audience: Audience) => {
    setSelectedAudience(audience);
    setIsGenerating(true);
    setDigest(null);

    const items = drafts.slice(0, 20).map((d) => ({
      title: d.draft.title,
      content: d.feedbackItem.content,
      source: d.feedbackItem.source,
      category: d.classification.category,
      priority: d.classification.priority,
      sentiment: d.classification.sentiment,
    }));

    try {
      const response = await fetch('/api/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audience,
          productName: company.productName || '',
          productContext: getCompanyContextForAI() || undefined,
          data: { ...stats, items },
        }),
      });

      if (!response.ok) throw new Error('Failed to generate digest');
      const result = await response.json();
      setDigest(result.content);
    } catch {
      setDigest('Failed to generate digest. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!digest) return;
    await navigator.clipboard.writeText(digest);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isEmpty = drafts.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display tracking-tight text-stone-900">Stakeholder Digest</h1>
        <p className="text-sm text-stone-500 mt-1">
          Generate audience-specific reports from your collected feedback
        </p>
      </div>

      {/* Empty State */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-6">
            <Inbox className="w-8 h-8 text-stone-400" />
          </div>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">No data to digest</h2>
          <p className="text-stone-500 text-center max-w-sm mb-6">
            Collect feedback first by scanning sources from the Intelligence Hub or running the Magic Pipeline.
          </p>
        </div>
      ) : (
        <>
          {/* Audience Templates */}
          <div className="grid md:grid-cols-3 gap-4">
            {templates.map((template) => {
              const Icon = template.icon;
              const isSelected = selectedAudience === template.id;

              return (
                <button
                  key={template.id}
                  onClick={() => handleGenerate(template.id)}
                  disabled={isGenerating}
                  className={cn(
                    'p-5 rounded-xl border text-left transition-all hover-lift disabled:opacity-60',
                    isSelected && !isGenerating
                      ? 'ring-2 ring-amber-500 border-amber-300'
                      : template.bgColor
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn('w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center', template.color)}>
                      <Icon size={20} />
                    </div>
                    <h3 className="font-semibold text-stone-900">{template.label}</h3>
                  </div>
                  <p className="text-sm text-stone-600">{template.description}</p>
                </button>
              );
            })}
          </div>

          {/* Generated Digest */}
          <AnimatePresence mode="wait">
            {(isGenerating || digest) && (
              <motion.div
                key={selectedAudience}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden"
              >
                {/* Digest Header */}
                <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-amber-600" />
                    <h3 className="font-semibold text-stone-900">
                      {templates.find((t) => t.id === selectedAudience)?.label} Digest
                    </h3>
                  </div>
                  {digest && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-lg transition-colors"
                      >
                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy as Markdown'}
                      </button>
                      <button
                        onClick={() => selectedAudience && handleGenerate(selectedAudience)}
                        className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg transition-colors"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Digest Content */}
                <div className="p-6">
                  {isGenerating ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex items-center gap-3 text-stone-500">
                        <Loader2 size={20} className="animate-spin" />
                        <span className="text-sm">Generating {selectedAudience} digest...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-stone prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm text-stone-700 leading-relaxed">
                        {digest}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
