'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface Highlight {
  type: 'urgent' | 'trend' | 'suggestion';
  text: string;
  action: () => void;
}

interface WelcomeMessageProps {
  userName: string;
  greetingTime?: 'morning' | 'afternoon' | 'evening';
  highlights: Highlight[];
  productName?: string;
}

export function WelcomeMessage({ userName, greetingTime, highlights, productName }: WelcomeMessageProps) {
  const greeting = greetingTime ? `Good ${greetingTime}` : 'Hello';

  const getSubheading = () => {
    const hasData = highlights.length > 0;
    if (hasData && productName) {
      return <>Here&apos;s what&apos;s happening with <strong className="text-stone-700">{productName}</strong></>;
    }
    if (hasData) {
      return <>{highlights.length} item{highlights.length !== 1 ? 's' : ''} need your attention</>;
    }
    if (productName) {
      return <>Ready to track feedback for <strong className="text-stone-700">{productName}</strong></>;
    }
    return <>Set up your product to get started</>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="py-8"
    >
      <h1 className="text-2xl font-medium text-stone-900 mb-1">
        {greeting}, {userName}
      </h1>
      <p className="text-stone-400 text-sm">
        {getSubheading()}
      </p>

      {highlights.length > 0 && (
        <div className="mt-6 space-y-1">
          {highlights.map((highlight, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              onClick={highlight.action}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors group hover:bg-stone-50"
            >
              <span className={
                highlight.type === 'urgent'
                  ? 'w-1.5 h-1.5 rounded-full bg-red-500 shrink-0'
                  : highlight.type === 'trend'
                  ? 'w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0'
                  : 'w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0'
              } />
              <span className="flex-1 text-stone-600">{highlight.text}</span>
              <ArrowRight
                size={14}
                className="text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5 transition-all"
              />
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
