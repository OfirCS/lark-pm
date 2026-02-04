'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContextBar, WelcomeMessage, ChatInput, FeatureRequestCard } from '@/components/chat';
import { cn } from '@/lib/utils';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'feature_request' | 'sentiment' | 'loading';
  data?: unknown;
}

// Mock data for demonstration
const mockHighlights = [
  {
    type: 'urgent' as const,
    text: 'Enterprise SSO request blocking 3 deals',
    action: () => console.log('View urgent'),
  },
  {
    type: 'trend' as const,
    text: 'Mobile app mentions up 340% this week',
    action: () => console.log('View trend'),
  },
  {
    type: 'suggestion' as const,
    text: 'Review competitor analysis from yesterday',
    action: () => console.log('View suggestion'),
  },
];

const mockSuggestions = [
  'What features are customers requesting most?',
  'How is sentiment trending this week?',
  'What are competitors doing differently?',
  'What did customers say in recent calls?',
];

const mockFeatureRequests = [
  {
    title: 'SSO/SAML Authentication',
    mentionCount: 23,
    score: 94,
    revenueImpact: 450,
    enterpriseBlockers: 3,
    priority: 'urgent' as const,
    topQuotes: [
      {
        source: 'Reddit',
        text: 'We love the product but IT requires SSO before we can deploy to 500+ employees.',
        author: 'u/enterprise_pm',
      },
      {
        source: 'Slack',
        text: 'This is blocking our enterprise rollout. Any timeline on SAML?',
        author: 'Sarah (Acme Corp)',
      },
    ],
  },
  {
    title: 'Mobile App (iOS/Android)',
    mentionCount: 18,
    score: 87,
    revenueImpact: 180,
    enterpriseBlockers: 1,
    priority: 'high' as const,
    topQuotes: [
      {
        source: 'Twitter',
        text: 'Would be amazing to have a mobile app for checking dashboards on the go.',
        author: '@startup_foundr',
      },
      {
        source: 'Support',
        text: 'Customers asking about mobile access daily.',
        author: 'Support Team',
      },
    ],
  },
];

// Loading animation component
function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-stone-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// Message bubble component
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
          isUser
            ? 'bg-stone-200 text-stone-700'
            : 'bg-stone-900 text-white'
        )}
      >
        {isUser ? 'AR' : '🐦'}
      </div>

      {/* Content */}
      <div
        className={cn(
          'max-w-[80%]',
          isUser ? 'text-right' : 'text-left'
        )}
      >
        {message.type === 'loading' ? (
          <div className="bg-stone-100 rounded-2xl rounded-tl-sm px-4">
            <LoadingDots />
          </div>
        ) : (
          <div
            className={cn(
              'inline-block text-left px-4 py-3 rounded-2xl',
              isUser
                ? 'bg-stone-900 text-white rounded-tr-sm'
                : 'bg-white border border-stone-200 rounded-tl-sm shadow-sm'
            )}
          >
            <p className={cn('text-sm leading-relaxed', isUser && 'text-white')}>
              {message.content}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (input: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Show loading
    setIsLoading(true);
    const loadingMessage: Message = {
      id: 'loading',
      role: 'assistant',
      content: '',
      type: 'loading',
    };
    setMessages((prev) => [...prev, loadingMessage]);

    // Simulate AI response
    setTimeout(() => {
      setIsLoading(false);
      setMessages((prev) => prev.filter((m) => m.id !== 'loading'));

      // Add AI response
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'Based on 47 mentions this week, here are the top feature requests:',
        type: 'feature_request',
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 2000);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      {/* Context Awareness Bar */}
      <ContextBar
        stats={{
          conversationsAnalyzed: 1247,
          newInsights: 12,
          urgentItems: 3,
          lastUpdate: '2 minutes ago',
        }}
      />

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {/* Welcome Message (shown when no messages) */}
        {messages.length === 0 && (
          <WelcomeMessage userName="Alex" highlights={mockHighlights} />
        )}

        {/* Chat History */}
        <div className="space-y-6">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Feature Request Cards (shown after AI response) */}
          {messages.some((m) => m.type === 'feature_request') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pl-12 space-y-4"
            >
              {mockFeatureRequests.map((request, index) => (
                <FeatureRequestCard
                  key={request.title}
                  data={request}
                  rank={index + 1}
                  onCreateTicket={() => console.log('Create ticket for', request.title)}
                  onViewMentions={() => console.log('View mentions for', request.title)}
                />
              ))}
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="pt-6 mt-4 border-t border-stone-200">
        <ChatInput
          suggestions={messages.length === 0 ? mockSuggestions : []}
          onSuggestionClick={handleSend}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
