'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Search,
  Home,
  BarChart3,
  Inbox,
  Workflow,
  Sparkles,
  Settings,
  FileText,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useReviewStore } from '@/lib/stores/reviewStore';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  section: 'actions' | 'navigate' | 'recent';
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const drafts = useReviewStore((state) => state.drafts);

  const navigate = useCallback(
    (path: string) => {
      onClose();
      router.push(path);
    },
    [onClose, router]
  );

  const items: CommandItem[] = [
    // Quick Actions
    {
      id: 'magic-pipeline',
      label: 'Run Magic Pipeline',
      description: 'One-click fetch, classify, and draft',
      icon: Sparkles,
      section: 'actions',
      action: () => navigate('/dashboard/insights'),
      keywords: ['scan', 'pipeline', 'magic', 'analyze'],
    },
    {
      id: 'scan-sources',
      label: 'Scan Sources',
      description: 'Fetch feedback from Reddit & Twitter',
      icon: Zap,
      section: 'actions',
      action: () => navigate('/dashboard/data'),
      keywords: ['scan', 'fetch', 'reddit', 'twitter'],
    },
    {
      id: 'generate-digest',
      label: 'Generate Stakeholder Digest',
      description: 'Create a digest for any audience',
      icon: FileText,
      section: 'actions',
      action: () => navigate('/dashboard/digest'),
      keywords: ['digest', 'report', 'stakeholder', 'summary'],
    },

    // Navigate
    {
      id: 'nav-home',
      label: 'Home',
      description: 'AI Assistant & Overview',
      icon: Home,
      section: 'navigate',
      action: () => navigate('/dashboard'),
      keywords: ['home', 'dashboard', 'chat'],
    },
    {
      id: 'nav-intelligence',
      label: 'Intelligence Hub',
      description: 'Feedback & Insights',
      icon: BarChart3,
      section: 'navigate',
      action: () => navigate('/dashboard/data'),
      keywords: ['data', 'intelligence', 'insights'],
    },
    {
      id: 'nav-review',
      label: 'Review Queue',
      description: 'Approve & Create Tickets',
      icon: Inbox,
      section: 'navigate',
      action: () => navigate('/dashboard/review'),
      keywords: ['review', 'queue', 'tickets', 'approve'],
    },
    {
      id: 'nav-digest',
      label: 'Stakeholder Digest',
      description: 'Generate audience-specific reports',
      icon: FileText,
      section: 'navigate',
      action: () => navigate('/dashboard/digest'),
      keywords: ['digest', 'report'],
    },
    {
      id: 'nav-automation',
      label: 'Automation',
      description: 'Upload & Analyze Files',
      icon: Workflow,
      section: 'navigate',
      action: () => navigate('/dashboard/automation'),
      keywords: ['automation', 'upload', 'files'],
    },
    {
      id: 'nav-settings',
      label: 'Settings',
      icon: Settings,
      section: 'navigate',
      action: () => navigate('/settings'),
      keywords: ['settings', 'config'],
    },

    // Recent drafts
    ...drafts.slice(0, 5).map((draft) => ({
      id: `recent-${draft.id}`,
      label: draft.draft.title,
      description: `${draft.feedbackItem.source} - ${draft.classification.category}`,
      icon: FileText,
      section: 'recent' as const,
      action: () => navigate('/dashboard/review'),
      keywords: [draft.draft.title.toLowerCase()],
    })),
  ];

  const filtered = query.trim()
    ? items.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.keywords?.some((k) => k.includes(q))
        );
      })
    : items;

  const sections = [
    { key: 'actions', label: 'Quick Actions', items: filtered.filter((i) => i.section === 'actions') },
    { key: 'navigate', label: 'Navigate', items: filtered.filter((i) => i.section === 'navigate') },
    { key: 'recent', label: 'Recent Drafts', items: filtered.filter((i) => i.section === 'recent') },
  ].filter((s) => s.items.length > 0);

  const flatItems = sections.flatMap((s) => s.items);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === 'Enter' && flatItems[selectedIndex]) {
      e.preventDefault();
      flatItems[selectedIndex].action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
          >
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl shadow-stone-900/20 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100">
                <Search size={18} className="text-stone-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 text-sm bg-transparent outline-none placeholder:text-stone-400 text-stone-900"
                />
                <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-mono bg-stone-100 text-stone-500 rounded border border-stone-200">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {sections.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-stone-400">
                    No results found
                  </div>
                ) : (
                  sections.map((section) => (
                    <div key={section.key}>
                      <div className="px-4 py-1.5">
                        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                          {section.label}
                        </p>
                      </div>
                      {section.items.map((item) => {
                        const globalIndex = flatItems.indexOf(item);
                        const isSelected = globalIndex === selectedIndex;
                        const Icon = item.icon;

                        return (
                          <button
                            key={item.id}
                            onClick={item.action}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                              isSelected
                                ? 'bg-amber-50 text-amber-900'
                                : 'text-stone-700 hover:bg-stone-50'
                            )}
                          >
                            <div
                              className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                                isSelected
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-stone-100 text-stone-500'
                              )}
                            >
                              <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.label}</p>
                              {item.description && (
                                <p className="text-xs text-stone-400 truncate">{item.description}</p>
                              )}
                            </div>
                            {isSelected && (
                              <ArrowRight size={14} className="text-amber-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-stone-400">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-stone-100 rounded border border-stone-200 font-mono">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-stone-100 rounded border border-stone-200 font-mono">↵</kbd>
                    Select
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
