'use client';

import { motion } from 'framer-motion';

interface ContextBarProps {
  stats: {
    conversationsAnalyzed: number;
    newInsights: number;
    urgentItems: number;
    lastUpdate: string;
  };
  productName?: string;
}

export function ContextBar({ stats, productName }: ContextBarProps) {
  const hasData = stats.conversationsAnalyzed > 0;

  if (!hasData && !productName) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-4 text-xs text-stone-400 pb-4 mb-2 border-b border-stone-100"
    >
      {productName && (
        <span className="font-medium text-stone-600">{productName}</span>
      )}
      {hasData ? (
        <>
          <span>{stats.conversationsAnalyzed} items</span>
          {stats.newInsights > 0 && (
            <span>{stats.newInsights} pending</span>
          )}
          {stats.urgentItems > 0 && (
            <span className="text-red-500">{stats.urgentItems} urgent</span>
          )}
        </>
      ) : productName ? (
        <span>No data yet &mdash; scan sources to start</span>
      ) : null}
    </motion.div>
  );
}
