'use client';

import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, TrendingUp, Lightbulb, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Highlight {
  type: 'urgent' | 'trend' | 'suggestion';
  text: string;
  action: () => void;
}

interface WelcomeMessageProps {
  userName: string;
  highlights: Highlight[];
}

const highlightConfig = {
  urgent: {
    icon: AlertCircle,
    color: 'rose',
    label: 'Urgent',
  },
  trend: {
    icon: TrendingUp,
    color: 'indigo',
    label: 'Trend',
  },
  suggestion: {
    icon: Lightbulb,
    color: 'amber',
    label: 'Suggestion',
  },
};

export function WelcomeMessage({ userName, highlights }: WelcomeMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-8"
    >
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-6 text-white shadow-xl shadow-stone-900/20">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
            <Sparkles size={24} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-1">
              Good morning, {userName}
            </h2>
            <p className="text-stone-400">
              I found {highlights.length} new insights that need your attention.
            </p>
          </div>
        </div>

        {/* Highlights */}
        <div className="space-y-2">
          {highlights.map((highlight, index) => {
            const config = highlightConfig[highlight.type];
            const Icon = config.icon;

            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={highlight.action}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group',
                  'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  highlight.type === 'urgent' && 'bg-rose-500/20 text-rose-400',
                  highlight.type === 'trend' && 'bg-indigo-500/20 text-indigo-400',
                  highlight.type === 'suggestion' && 'bg-amber-500/20 text-amber-400'
                )}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{highlight.text}</p>
                </div>
                <ArrowRight
                  size={16}
                  className="text-stone-500 group-hover:text-white group-hover:translate-x-1 transition-all"
                />
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
