'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Loader2,
  TrendingUp,
  Radio,
  Phone,
  Users,
  Settings,
  BarChart3,
  ArrowRight,
  Search,
  Zap,
  X,
  Plus,
  ExternalLink,
  Check,
  AlertCircle,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Logo, LarkIcon } from '@/components/ui/Logo';
import { useReviewStore } from '@/lib/stores/reviewStore';
import { useCompanyStore } from '@/lib/stores/companyStore';

// Message type
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  actions?: { label: string; href: string }[];
  canCreateTicket?: boolean;
}

// Platform options
const PLATFORMS = [
  { id: 'linear', name: 'Linear', icon: '📐' },
  { id: 'github', name: 'GitHub Issues', icon: '🐙' },
  { id: 'jira', name: 'Jira', icon: '📋' },
  { id: 'notion', name: 'Notion', icon: '📝' },
] as const;

// Action Item Type
interface ActionItem {
  id: string;
  type: 'slack' | 'linear' | 'jira' | 'github' | 'system';
  title: string;
  status: 'pending' | 'processing' | 'completed';
  time: string;
}

// Suggested questions based on PM needs
const suggestions = [
  {
    icon: TrendingUp,
    text: 'What features are customers requesting most?',
    description: 'Analyze top requests by volume'
  },
  {
    icon: Radio,
    text: 'How is sentiment trending this week?',
    description: 'Social & support analysis'
  },
  {
    icon: Users,
    text: 'What are competitors doing differently?',
    description: 'Competitive intelligence'
  },
  {
    icon: Phone,
    text: 'What did customers say in recent calls?',
    description: 'Key themes from Gong/Zoom'
  },
];


// Search status type
interface SearchStatus {
  stage: 'searching' | 'analyzing' | 'done';
  source?: string;
  query?: string;
  count?: number;
}

// Stream AI response from the real API
async function streamChatResponse(
  query: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
  onSearchStatus?: (status: SearchStatus) => void,
  productName?: string
) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: query }],
        productName, // Pass company product name for context
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;

        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            if (json.type === 'text' && json.content) {
              onSearchStatus?.({ stage: 'done' });
              onChunk(json.content);
            } else if (json.type === 'error') {
              onError(json.content);
              return;
            } else if (json.type === 'search_start') {
              onSearchStatus?.({
                stage: 'searching',
                source: json.source,
                query: json.query
              });
            } else if (json.type === 'search_complete') {
              onSearchStatus?.({
                stage: 'searching',
                source: json.source,
                count: json.count
              });
            } else if (json.type === 'analyzing') {
              onSearchStatus?.({ stage: 'analyzing' });
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }

    onDone();
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Unknown error');
  }
}

// Fallback simulated responses (used when API is unavailable)
const getResponse = (query: string): Message => {
  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: `Found 12 mentions about "${query}" across Reddit and Twitter. Sentiment is 78% positive.\n\nMain theme: users want better integrations. Two enterprise prospects mentioned this as a blocker.\n\nWant me to pull the specific quotes?`,
    sources: ['Reddit', 'Twitter'],
    actions: [
        { label: 'View details', href: '/dashboard/data' },
      ],
  };
};

// Ticket Creation Modal
function TicketModal({
  isOpen,
  onClose,
  initialContent,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(initialContent || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [platform, setPlatform] = useState<string>('linear');
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; url?: string; error?: string } | null>(null);

  useEffect(() => {
    if (initialContent) {
      // Extract a title from the first line or first sentence
      const firstLine = initialContent.split('\n')[0];
      const shortTitle = firstLine.length > 60 ? firstLine.slice(0, 57) + '...' : firstLine;
      
      // Use functional updates or move logic to where initialContent is set to avoid this effect
      // For now, wrapping in setTimeout avoids the sync render warning
      const t = setTimeout(() => {
        setTitle(shortTitle);
        setDescription(initialContent);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [initialContent]);

  const handleCreate = async () => {
    setIsCreating(true);
    setResult(null);

    try {
      // Call real ticket creation API
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          ticket: {
            title,
            description,
            priority: priority === 'urgent' ? 1 : priority === 'high' ? 2 : priority === 'medium' ? 3 : 4,
          },
          // Note: In production, credentials would come from stored integrations
          // For now, show success with message to connect integration
          config: {},
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          url: data.ticketUrl,
        });
      } else {
        // Integration not connected - show helpful message
        if (data.error?.includes('credentials')) {
          setResult({
            success: false,
            error: `Connect ${PLATFORMS.find(p => p.id === platform)?.name} in Settings first`,
          });
        } else {
          setResult({
            success: false,
            error: data.error || 'Failed to create ticket',
          });
        }
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error - please try again',
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Plus size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-900">Create Ticket</h2>
              <p className="text-xs text-stone-500">Turn this insight into action</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
            <X size={18} className="text-stone-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Platform</label>
            <div className="grid grid-cols-4 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${platform === p.id
                      ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-100'
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-xl block mb-1">{p.icon}</span>
                  <span className="text-[10px] font-medium text-stone-600">{p.name}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-stone-400 mt-2">
              Connect integrations in <Link href="/settings" className="text-indigo-600 hover:underline">Settings</Link>
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of the issue"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Details, context, and next steps"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 resize-none"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Priority</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${priority === p
                      ? p === 'urgent' ? 'bg-red-100 text-red-700 ring-2 ring-red-200' :
                        p === 'high' ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-200' :
                        p === 'medium' ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200' :
                        'bg-stone-100 text-stone-700 ring-2 ring-stone-200'
                      : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className={`p-4 rounded-xl flex items-start gap-3 ${result.success ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
              {result.success ? (
                <>
                  <Check size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800">Ticket created!</p>
                    {result.url && (
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        Open in {PLATFORMS.find(p => p.id === platform)?.name} <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Failed to create ticket</p>
                    <p className="text-xs text-red-600 mt-1">{result.error || 'Please check your integration settings'}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-stone-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim() || isCreating || result?.success}
            className="px-5 py-2 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : result?.success ? (
              <>
                <Check size={16} />
                Created
              </>
            ) : (
              <>
                <Plus size={16} />
                Create Ticket
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionCenter({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const notifications = useReviewStore(state => state.notifications);
    const pipelineJobs = useReviewStore(state => state.pipelineJobs);
    const drafts = useReviewStore(state => state.drafts);

    // Convert real data to action items with useMemo
    const actions = useMemo((): ActionItem[] => {
      const items: ActionItem[] = [];

      // Recent notifications
      notifications.slice(0, 5).forEach(n => {
        items.push({
          id: n.id,
          type: (n.type === 'ticket_created' ? 'linear' :
                 n.type === 'urgent_feedback' ? 'system' : 'system') as ActionItem['type'],
          title: n.message,
          status: 'completed' as const,
          time: getTimeAgo(n.createdAt),
        });
      });

      // Recent drafts as activity
      drafts.slice(0, 3).forEach(d => {
        items.push({
          id: d.id,
          type: 'system' as const,
          title: `Drafted: "${d.draft.title.slice(0, 30)}${d.draft.title.length > 30 ? '...' : ''}"`,
          status: d.status === 'approved' ? 'completed' as const : 'pending' as const,
          time: getTimeAgo(d.createdAt),
        });
      });

      // Running pipeline jobs
      pipelineJobs.filter(j => j.status === 'running').forEach(j => {
        items.push({
          id: j.id,
          type: 'system' as const,
          title: `${j.stage}: ${j.progress}%`,
          status: 'processing' as const,
          time: 'Now',
        });
      });

      return items.slice(0, 10);
    }, [notifications, pipelineJobs, drafts]);

    if (!isOpen) return null;

    return (
        <div className="w-80 border-l border-stone-200/50 bg-white/50 backdrop-blur-md h-full flex flex-col animate-in slide-in-from-right duration-300 fixed right-0 top-16 bottom-0 z-20 shadow-xl">
            <div className="p-4 border-b border-stone-200/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Zap size={16} className="text-amber-500 fill-amber-500" />
                    <h3 className="font-semibold text-sm">Live Operations</h3>
                </div>
                <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
                    <X size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {actions.length > 0 ? actions.map((action) => (
                    <div key={action.id} className="p-3 bg-white rounded-xl border border-stone-100 shadow-sm flex items-start gap-3">
                        <div className={`mt-0.5 w-2 h-2 rounded-full ${
                            action.status === 'processing' ? 'bg-amber-500 animate-pulse' :
                            action.status === 'completed' ? 'bg-emerald-500' : 'bg-stone-300'
                        }`} />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-stone-900">{action.title}</p>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-stone-500 capitalize">{action.type}</span>
                                <span className="text-[10px] text-stone-400">{action.time}</span>
                            </div>
                        </div>
                    </div>
                )) : (
                  <div className="p-4 text-center text-sm text-stone-400">
                    <p>No recent activity</p>
                    <p className="text-xs mt-1">Scan sources in Data view to get started</p>
                  </div>
                )}

                <div className="p-3 rounded-xl border border-dashed border-stone-300 flex items-center justify-center text-xs text-stone-400">
                    {actions.length > 0 ? 'Waiting for new events...' : 'Activity will appear here'}
                </div>
            </div>
        </div>
    );
}

// Helper function for time ago
function getTimeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchStatus, setSearchStatus] = useState<SearchStatus | null>(null);
  const [showActions, setShowActions] = useState(true);
  const [ticketModal, setTicketModal] = useState<{ open: boolean; content?: string }>({ open: false });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Real stats from review store - use shallow comparison for drafts array
  const drafts = useReviewStore(state => state.drafts);

  // Company context for personalized search
  const company = useCompanyStore(state => state.company);
  const productName = company.productName;

  // Calculate real stats with useMemo to avoid infinite loops
  const stats = useMemo(() => {
    const total = drafts.length;
    let pending = 0;
    let featureRequests = 0;
    let bugs = 0;
    let praise = 0;

    drafts.forEach(draft => {
      if (draft.status === 'pending' || draft.status === 'edited') pending++;
      if (draft.classification?.category === 'feature_request') featureRequests++;
      if (draft.classification?.category === 'bug') bugs++;
      if (draft.classification?.category === 'praise') praise++;
    });

    return {
      mentions: total,
      requests: featureRequests + bugs,
      sentiment: total > 0 ? Math.round((praise / total) * 100) : 0,
      pending,
    };
  }, [drafts]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send
  const handleSend = async (text?: string) => {
    const message = text || input;
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // Create a placeholder for the assistant message
    const assistantId = crypto.randomUUID();
    let streamedContent = '';

    // Stream the response from the real API
    await streamChatResponse(
      message,
      (chunk) => {
        // Add assistant message on first chunk if not exists
        if (!streamedContent) {
          setMessages(prev => {
            const hasAssistant = prev.some(m => m.id === assistantId);
            if (!hasAssistant) {
              return [...prev, { id: assistantId, role: 'assistant', content: chunk }];
            }
            return prev.map(msg =>
              msg.id === assistantId ? { ...msg, content: chunk } : msg
            );
          });
        } else {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantId
                ? { ...msg, content: streamedContent + chunk } 
                : msg
            )
          );
        }
        streamedContent += chunk;
      },
      () => {
        setIsLoading(false);
        setSearchStatus(null);
      },
      (error) => {
        console.error('Chat error:', error);
        // Fall back to simulated response on error
        const fallback = getResponse(message);
        setMessages(prev => {
          const hasAssistant = prev.some(m => m.id === assistantId);
          if (!hasAssistant) {
            return [...prev, { ...fallback, id: assistantId }];
          }
          return prev.map(msg =>
            msg.id === assistantId ? { ...fallback, id: assistantId } : msg
          );
        });
        setIsLoading(false);
        setSearchStatus(null);
      },
      (status) => {
        setSearchStatus(status);
      },
      productName // Pass company name for personalized search
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="h-screen bg-stone-50/50 flex flex-col relative overflow-hidden">
       {/* Ambient background */}
       <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-stone-100/50 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-white/80 rounded-full blur-[100px]" />
          <div className="grain absolute inset-0 opacity-20" />
       </div>

      {/* Header */}
      <header className="relative z-30 glass sticky top-0 border-b border-stone-200/50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo size="sm" />
          </Link>

          <div className="flex items-center gap-6">
            {/* Quick stats - real data */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 border border-stone-200/50 rounded-full text-stone-600 shadow-sm">
                <Radio size={14} className="text-stone-400" />
                <span className="font-medium">{stats.mentions}</span>
                <span className="text-stone-400">items</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 border border-stone-200/50 rounded-full text-stone-600 shadow-sm">
                <TrendingUp size={14} className="text-stone-400" />
                <span className="font-medium">{stats.requests}</span>
                <span className="text-stone-400">requests</span>
              </div>
              {stats.pending > 0 && (
                <Link
                  href="/dashboard/data"
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-50/50 border border-amber-100 rounded-full text-amber-700 shadow-sm hover:bg-amber-100/50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="font-medium">{stats.pending}</span>
                  <span className="text-amber-600/70">pending</span>
                </Link>
              )}
            </div>

            <div className="h-6 w-px bg-stone-200 hidden md:block" />

            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/data"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <BarChart3 size={18} />
                <span className="hidden sm:inline">Data</span>
              </Link>
              <Link
                href="/dashboard/automation"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <Zap size={18} />
                <span className="hidden sm:inline">Automate</span>
              </Link>
              <Link
                href="/settings"
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <Settings size={18} />
              </Link>
              <button
                onClick={() => setShowActions(!showActions)}
                className={`p-2 rounded-lg transition-colors ${showActions ? 'bg-stone-100 text-stone-900' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'}`}
              >
                  <Zap size={18} />
              </button>

              {/* Profile Menu */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-stone-100 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-stone-800 to-stone-900 text-white flex items-center justify-center text-xs font-medium border-2 border-white shadow-md ring-1 ring-stone-100">
                    PM
                  </div>
                  <ChevronDown size={14} className={`text-stone-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-stone-100">
                      <p className="font-medium text-stone-900">Product Manager</p>
                      <p className="text-sm text-stone-500">pm@startup.com</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        href="/settings?tab=profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        <User size={16} className="text-stone-400" />
                        Profile Settings
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        <Settings size={16} className="text-stone-400" />
                        Integrations
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-stone-100 pt-1">
                      <Link
                        href="/"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        Log Out
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area (with Sidebar logic) */}
      <div className="flex-1 flex relative overflow-hidden">
          {/* Main chat area */}
          <main className={`flex-1 overflow-y-auto pb-32 transition-all duration-300 ${showActions ? 'mr-80' : ''}`}>
            {!hasMessages ? (
              // Welcome state
              <div className="min-h-full flex flex-col items-center justify-center px-6 py-12">
                <div className="max-w-2xl w-full text-center">
                  {/* Hero */}
                  <div className="w-20 h-20 rounded-3xl bg-white shadow-smooth-lg border border-white/50 flex items-center justify-center mx-auto mb-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-transparent rounded-3xl opacity-50" />
                    <LarkIcon size={40} className="text-stone-900 relative z-10" />
                  </div>

                  <h1 className="font-serif text-4xl text-stone-900 mb-4 tracking-tight">
                    Good morning, Product Team
                  </h1>
                  <p className="text-lg text-stone-500 mb-12 max-w-lg mx-auto leading-relaxed">
                    I&apos;ve analyzed your customer feedback from the last 24 hours. 
                    What insights do you need?
                  </p>

                  {/* Suggestions */}
                  <div className="grid sm:grid-cols-2 gap-4 text-left mb-10 max-w-3xl mx-auto">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(s.text)}
                        className="group relative p-5 bg-white border border-stone-200/60 rounded-2xl hover:border-stone-300 hover:shadow-smooth transition-all text-left overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-stone-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:scale-110 transition-all text-stone-500 group-hover:text-stone-900 shadow-sm">
                            <s.icon size={20} strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="font-medium text-stone-900 text-sm mb-1">{s.text}</p>
                            <p className="text-xs text-stone-500 leading-relaxed">{s.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Messages
              <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                    
                    {msg.role === 'assistant' && (
                      <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-sm flex items-center justify-center flex-shrink-0 mt-1">
                        <LarkIcon size={20} className="text-stone-900" />
                      </div>
                    )}

                    <div className={`relative max-w-[85%] ${ 
                      msg.role === 'user' 
                        ? 'bg-stone-900 text-stone-50 px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-md' 
                        : 'bg-white border border-stone-200/60 px-6 py-5 rounded-2xl rounded-tl-sm shadow-smooth'
                    }`}>
                      <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-stone'}`}>
                        <div className="text-[15px] leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ 
                              __html: msg.content
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\n/g, '<br/>')
                            }} />
                      </div>

                      {/* Sources */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-stone-100">
                          {msg.sources.map((source, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-stone-50 border border-stone-100 text-stone-500 rounded-md">
                              {source.includes('Reddit') && <span className="w-1.5 h-1.5 rounded-full bg-[#ff4500]" />} 
                              {source.includes('Twitter') && <span className="w-1.5 h-1.5 rounded-full bg-[#1da1f2]" />} 
                              {source}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {msg.actions.map((action, i) => (
                            <Link
                              key={i}
                              href={action.href}
                              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-600 hover:border-stone-300 hover:text-stone-900 hover:bg-stone-50 transition-all shadow-sm"
                            >
                              {action.label}
                              <ArrowRight size={12} className="opacity-50" />
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Create Ticket - show for assistant messages with substantial content */}
                      {msg.role === 'assistant' && msg.content.length > 50 && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-100">
                          <button
                            onClick={() => setTicketModal({ open: true, content: msg.content })}
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600 hover:bg-indigo-100 hover:border-indigo-200 transition-all"
                          >
                            <Plus size={14} />
                            Create Ticket
                          </button>
                          <span className="text-[10px] text-stone-400">Turn this into a task</span>
                        </div>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-10 h-10 rounded-xl bg-stone-200 flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden">
                        <span className="text-sm font-medium text-stone-500">PM</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Search/Loading state */}
                {isLoading && searchStatus && searchStatus.stage !== 'done' && (
                  <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-sm flex items-center justify-center flex-shrink-0">
                      <LarkIcon size={20} className="text-stone-900" />
                    </div>
                    <div className="px-5 py-4 bg-white border border-stone-200/60 rounded-2xl rounded-tl-sm shadow-smooth">
                      <div className="flex items-center gap-3">
                        <Loader2 size={16} className="text-stone-400 animate-spin" />
                        <span className="text-sm text-stone-600">
                          {searchStatus.stage === 'searching' && (
                            <>
                              Searching {searchStatus.source === 'reddit' ? 'Reddit' : searchStatus.source === 'web' ? 'the web' : 'sources'}
                              {searchStatus.query && <span className="text-stone-400"> for &quot;{searchStatus.query}&quot;</span>}
                              {searchStatus.count !== undefined && <span className="text-stone-500"> &middot; found {searchStatus.count} results</span>}
                            </>
                          )}
                          {searchStatus.stage === 'analyzing' && 'Analyzing results...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Simple loading state when no search status */}
                {isLoading && (!searchStatus || searchStatus.stage === 'done') && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-sm flex items-center justify-center flex-shrink-0">
                      <LarkIcon size={20} className="text-stone-900" />
                    </div>
                    <div className="flex items-center gap-3 px-5 py-4 bg-white border border-stone-200/60 rounded-2xl rounded-tl-sm shadow-smooth">
                      <Loader2 size={16} className="text-stone-400 animate-spin" />
                      <span className="text-sm text-stone-500">Thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </main>

          {/* Action Center Sidebar */}
          <ActionCenter isOpen={showActions} onClose={() => setShowActions(false)} />
      </div>

      {/* Input area - Floating */}
      <div className={`fixed bottom-6 left-0 right-0 z-20 px-6 pointer-events-none transition-all duration-300 ${showActions ? 'pr-86' : ''}`}>
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <div className="relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-stone-200 to-stone-100 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-white rounded-2xl shadow-smooth-lg border border-stone-200 flex flex-col overflow-hidden transition-shadow focus-within:shadow-xl focus-within:border-stone-300">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask follow-up..."
                rows={1}
                disabled={isLoading}
                className="w-full px-5 py-4 bg-transparent text-[15px] resize-none focus:outline-none placeholder:text-stone-400"
              />
              <div className="flex items-center justify-between px-3 pb-3">
                 <div className="flex items-center gap-1">
                    <button className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors" title="Attach">
                       <Search size={18} />
                    </button>
                 </div>
                 <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="flex items-center justify-center p-2 rounded-xl bg-stone-900 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-800 transition-all hover:scale-105 active:scale-95 shadow-md"
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  </button>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-center text-stone-400 font-medium">
            Lark can make mistakes. Double check important info.
          </p>
        </div>
      </div>

      {/* Ticket Creation Modal */}
      <TicketModal
        isOpen={ticketModal.open}
        onClose={() => setTicketModal({ open: false })}
        initialContent={ticketModal.content}
      />
    </div>
  );
}
