'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Menu,
  X,
  ArrowRight,
  Check,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowUp,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const ease = [0.16, 1, 0.3, 1] as const;

// ─── Navigation ───

function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-neutral-100' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="hover:opacity-70 transition-opacity">
          <Logo size="sm" />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#how" className="text-[13px] text-neutral-400 hover:text-neutral-900 transition-colors">How it works</Link>
          <Link href="#features" className="text-[13px] text-neutral-400 hover:text-neutral-900 transition-colors">Features</Link>
          <Link href="#pricing" className="text-[13px] text-neutral-400 hover:text-neutral-900 transition-colors">Pricing</Link>
          <Link href="/login" className="text-[13px] text-neutral-400 hover:text-neutral-900 transition-colors">Log in</Link>
          <Link
            href="/signup"
            className="px-5 py-2 text-[13px] font-medium bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-colors"
          >
            Get started
          </Link>
        </div>
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-white border-b border-neutral-100"
        >
          <div className="px-6 py-4 space-y-3">
            <Link href="#how" className="block text-sm text-neutral-600 py-2" onClick={() => setIsOpen(false)}>How it works</Link>
            <Link href="#features" className="block text-sm text-neutral-600 py-2" onClick={() => setIsOpen(false)}>Features</Link>
            <Link href="#pricing" className="block text-sm text-neutral-600 py-2" onClick={() => setIsOpen(false)}>Pricing</Link>
            <Link href="/login" className="block text-sm text-neutral-600 py-2">Log in</Link>
            <Link href="/signup" className="block w-full text-center px-4 py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-full">
              Get started
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

// ─── Hero ───

function Hero() {
  return (
    <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-emerald-200 bg-emerald-50 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[12px] font-medium text-emerald-700 tracking-wide">Now in public beta</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-neutral-900 mb-6">
              Know what
              <br />
              your customers
              <br />
              <span className="text-emerald-600">actually want</span>
            </h1>

            <p className="text-lg sm:text-xl text-neutral-400 max-w-md mb-10 leading-relaxed">
              Lark scans every channel where users talk — Reddit, X, LinkedIn, support, sales calls — and turns noise into your next roadmap.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2.5 px-8 py-4 bg-neutral-900 text-white rounded-full text-[15px] font-medium hover:bg-neutral-800 transition-all"
              >
                Start for free
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                href="#how"
                className="inline-flex items-center gap-2 px-6 py-4 text-neutral-400 text-[15px] font-medium hover:text-neutral-900 transition-colors"
              >
                How it works
              </Link>
            </div>

            <div className="flex items-center gap-6 text-[13px] text-neutral-400">
              <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" />Free forever tier</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" />60s setup</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" />No credit card</span>
            </div>
          </motion.div>

          {/* Right — live chat demo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
          >
            <HeroChatDemo />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Hero Chat Demo (interactive, mirrors real app) ───

const chatResponses: Record<string, string> = {
  'What are people saying about Lark?':
    'Based on 47 mentions across Reddit and X this week: Users love the one-click classification (23 positive mentions). The top complaint is missing Jira integration (8 mentions, 3 from enterprise accounts). Sentiment is 72% positive, up from 64% last week.',
  'Summarize urgent items':
    'You have 3 urgent items:\n\n1. SSO/SAML blocking enterprise rollout — mentioned by 5 accounts ($340K ARR at risk)\n2. Payment flow crashes on Safari — 12 support tickets in 48h\n3. API rate limits too aggressive — 3 developer complaints on Reddit',
  'Most requested features':
    'Top 5 feature requests by mention volume:\n\n1. SSO / SAML (14 mentions, $340K ARR)\n2. Mobile app (9 mentions, $180K ARR)\n3. API v2 with webhooks (7 mentions)\n4. Dark mode (6 mentions)\n5. Slack notifications (4 mentions)',
  'Help me prioritize my roadmap':
    'Based on revenue impact and mention frequency, I recommend this order:\n\n1. SSO/SAML — highest ARR at risk, enterprise blocker\n2. Safari payment fix — active bug, growing ticket volume\n3. Mobile app — strong demand, competitive gap\n4. API v2 — developer retention signal',
};

const chatSuggestions = [
  'What are people saying about Lark?',
  'Summarize urgent items',
  'Most requested features',
  'Help me prioritize my roadmap',
];

function HeroChatDemo() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [availableSuggestions, setAvailableSuggestions] = useState(chatSuggestions);
  const scrollRef = useRef<HTMLDivElement>(null);

  const streamResponse = useCallback((userText: string) => {
    const response = chatResponses[userText] || 'I can help you analyze feedback, prioritize features, and track sentiment across all your channels.';
    setIsStreaming(true);
    setStreamedText('');

    let i = 0;
    const interval = setInterval(() => {
      if (i < response.length) {
        setStreamedText(response.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        setStreamedText('');
        setIsStreaming(false);
      }
    }, 12);

    return () => clearInterval(interval);
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    if (isStreaming) return;
    setMessages(prev => [...prev, { role: 'user', content: suggestion }]);
    setAvailableSuggestions(prev => prev.filter(s => s !== suggestion));

    // Small delay before assistant starts responding
    setTimeout(() => streamResponse(suggestion), 600);
  }, [isStreaming, streamResponse]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamedText]);

  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-gradient-to-br from-emerald-100/30 via-transparent to-neutral-100/30 rounded-3xl blur-2xl pointer-events-none" />

      <div className="relative bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.12)]">
        {/* Browser bar */}
        <div className="h-10 bg-neutral-50/80 border-b border-neutral-100 flex items-center px-4">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 px-4 py-1 bg-white rounded-md border border-neutral-100 text-[11px] text-neutral-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              app.lark.pm
            </div>
          </div>
          <div className="w-12" />
        </div>

        {/* Chat area */}
        <div ref={scrollRef} className="h-[320px] overflow-y-auto p-5">
          {/* Welcome message — mirrors real WelcomeMessage component */}
          {messages.length === 0 && !isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease }}
              className="py-4"
            >
              <h3 className="text-lg font-medium text-neutral-900 mb-1">Good morning, Sarah</h3>
              <p className="text-neutral-400 text-sm mb-4">
                Here&apos;s what&apos;s happening with <strong className="text-neutral-700">Lark</strong>
              </p>

              {/* Highlights — mirrors real app */}
              <div className="space-y-0.5 mb-5">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span className="flex-1 text-neutral-600">3 urgent items need attention</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" />
                  <span className="flex-1 text-neutral-600">47 feedback items from 4 sources</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="flex-1 text-neutral-600">12 tickets pending review</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-full ${msg.role === 'user' ? 'ml-auto justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-md bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-semibold">
                    L
                  </div>
                )}
                <div className={msg.role === 'user' ? 'text-right' : 'flex-1 min-w-0'}>
                  <div
                    className={
                      msg.role === 'user'
                        ? 'inline-block text-left bg-neutral-900 text-white px-4 py-2.5 rounded-2xl rounded-tr-md text-[13px] leading-relaxed'
                        : 'text-[13px] text-neutral-700 leading-relaxed whitespace-pre-wrap'
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Loading dots — matches real LoadingDots */}
            {isStreaming && streamedText === '' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-6 h-6 rounded-md bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-semibold">
                  L
                </div>
                <div className="flex items-center gap-1 py-2">
                  {[0, 1, 2].map((j) => (
                    <motion.div
                      key={j}
                      className="w-1.5 h-1.5 bg-neutral-300 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: j * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Streaming text */}
            {isStreaming && streamedText !== '' && (
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-md bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-semibold">
                  L
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-neutral-700 leading-relaxed whitespace-pre-wrap">
                    {streamedText}
                    <span className="animate-pulse text-emerald-500">|</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input area — mirrors real ChatInput */}
        <div className="border-t border-neutral-100 p-3">
          {/* Suggestion chips */}
          <AnimatePresence>
            {availableSuggestions.length > 0 && messages.length < 3 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex flex-wrap gap-1.5 mb-2"
              >
                {availableSuggestions.slice(0, 3).map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleSuggestionClick(s)}
                    disabled={isStreaming}
                    className="px-2.5 py-1 text-[11px] text-neutral-500 bg-neutral-50 hover:bg-neutral-100 border border-neutral-150 hover:border-neutral-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {s}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input bar */}
          <div className="relative bg-white rounded-xl border border-neutral-200">
            <div className="flex items-end gap-2 p-1.5 pl-3">
              <span className="flex-1 py-1.5 text-[12px] text-neutral-400">Ask Lark anything...</span>
              <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-300">
                <ArrowUp size={14} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Social Proof Strip ───

function SocialProof() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  const stats = [
    { value: '500+', label: 'Product teams' },
    { value: '2M+', label: 'Feedback processed' },
    { value: '47%', label: 'Faster decisions' },
    { value: '$340K', label: 'Revenue saved' },
  ];

  return (
    <section ref={ref} className="py-20 border-y border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-wrap justify-between gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1, ease }}
            className="text-center flex-1 min-w-[140px]"
          >
            <p className="text-4xl sm:text-5xl font-display text-neutral-900 tracking-tight">{s.value}</p>
            <p className="text-sm text-neutral-400 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── How It Works — alternating sides ───

function HowItWorks() {
  return (
    <section id="how" className="py-28 sm:py-36">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mb-24"
        >
          <span className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider mb-3 block">How it works</span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-neutral-900 tracking-tight max-w-2xl">
            Three steps to a smarter roadmap
          </h2>
        </motion.div>

        {/* Step 1 — text left, onboarding demo right */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-28 sm:mb-36">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease }}
          >
            <span className="text-[12px] font-mono text-emerald-600 tracking-wider">01</span>
            <h3 className="font-display text-3xl sm:text-4xl text-neutral-900 tracking-tight mt-3 mb-4">
              Tell us what
              <br />you build
            </h3>
            <p className="text-lg text-neutral-400 leading-relaxed max-w-md">
              Type your product name. Lark auto-finds subreddits, keywords, forums, and competitor mentions. No manual setup.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.15, ease }}
          >
            <OnboardingDemo />
          </motion.div>
        </div>

        {/* Step 2 — demo left, text right */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-28 sm:mb-36">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.15, ease }}
            className="order-2 lg:order-1"
          >
            <SourcesDemo />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease }}
            className="order-1 lg:order-2"
          >
            <span className="text-[12px] font-mono text-emerald-600 tracking-wider">02</span>
            <h3 className="font-display text-3xl sm:text-4xl text-neutral-900 tracking-tight mt-3 mb-4">
              We listen
              <br />everywhere
            </h3>
            <p className="text-lg text-neutral-400 leading-relaxed max-w-md">
              Reddit, X, LinkedIn, G2, support tickets, Slack, and sales calls. Every channel, monitored around the clock.
            </p>
          </motion.div>
        </div>

        {/* Step 3 — text left, kanban demo right */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease }}
          >
            <span className="text-[12px] font-mono text-emerald-600 tracking-wider">03</span>
            <h3 className="font-display text-3xl sm:text-4xl text-neutral-900 tracking-tight mt-3 mb-4">
              Ship what
              <br />actually matters
            </h3>
            <p className="text-lg text-neutral-400 leading-relaxed max-w-md">
              Clustered requests, revenue impact scores, and auto-drafted tickets. Push to Linear or Jira in one click.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.15, ease }}
          >
            <KanbanDemo />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Step 1: Interactive Onboarding Demo ───

const competitorMap: Record<string, string[]> = {
  notion: ['Asana', 'ClickUp', 'Monday'],
  linear: ['Jira', 'Asana', 'Shortcut'],
  figma: ['Sketch', 'Framer', 'Canva'],
  slack: ['Teams', 'Discord', 'Zoom'],
  stripe: ['Square', 'Adyen', 'PayPal'],
  vercel: ['Netlify', 'Cloudflare', 'AWS'],
};

function OnboardingDemo() {
  const [productName, setProductName] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [showCompetitors, setShowCompetitors] = useState(false);

  useEffect(() => {
    if (productName.length >= 3) {
      const t1 = setTimeout(() => setShowDescription(true), 300);
      const t2 = setTimeout(() => setShowCompetitors(true), 600);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setShowDescription(false);
      setShowCompetitors(false);
    }
  }, [productName]);

  const detectedCompetitors = competitorMap[productName.toLowerCase()] || (productName.length >= 3 ? ['Competitor A', 'Competitor B', 'Competitor C'] : []);

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-[0_20px_60px_-20px_rgba(0,0,0,0.08)]">
      {/* Amber accent line — matches real onboarding */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />

      <div className="p-7">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-neutral-900">Quick setup</p>
            <p className="text-[11px] text-neutral-400">Try it — type your product name</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Product Name Input */}
          <div>
            <label className="text-[12px] font-medium text-neutral-500 mb-1.5 block">Product name</label>
            <div className="relative">
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Notion, Linear, Figma"
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 focus:ring-4 focus:ring-neutral-100 transition-all"
              />
              {productName.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <Check size={16} className="text-emerald-500" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Auto-detected banner — matches real onboarding */}
          <AnimatePresence>
            {productName.length > 2 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease }}
                className="flex items-start gap-2.5 p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/50"
              >
                <Sparkles size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-[12px] text-neutral-600 leading-snug">
                  Lark will track mentions of <strong className="text-neutral-900">{productName}</strong> across Reddit, X, LinkedIn &amp; forums. Auto-detected <strong>4 subreddits</strong>, <strong>12 keywords</strong>.
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Description field */}
          <AnimatePresence>
            {showDescription && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease }}
              >
                <label className="text-[12px] font-medium text-neutral-500 mb-1.5 block">
                  What does it do? <span className="text-neutral-300 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Project management for engineering teams"
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-[13px] placeholder:text-neutral-300 focus:outline-none focus:border-neutral-400 transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Competitors */}
          <AnimatePresence>
            {showCompetitors && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease }}
              >
                <label className="text-[12px] font-medium text-neutral-500 mb-2 block">Competitors to track</label>
                <div className="flex flex-wrap gap-2">
                  {detectedCompetitors.map((c, i) => (
                    <motion.span
                      key={c}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1, ease }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-full text-[12px] text-neutral-600 font-medium"
                    >
                      {c}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Interactive Sources Demo ───

const demoSources = [
  { id: 'reddit', name: 'Reddit', desc: 'r/SaaS, r/startups', emoji: '\uD83D\uDD34' },
  { id: 'twitter', name: 'X / Twitter', desc: 'Mentions & hashtags', emoji: '\uD835\uDD4F' },
  { id: 'linkedin', name: 'LinkedIn', desc: 'Posts & comments', emoji: '\uD83D\uDCBC' },
  { id: 'g2', name: 'G2 Reviews', desc: 'Product reviews', emoji: '\u2B50' },
  { id: 'slack', name: 'Slack', desc: 'Internal channels', emoji: '\uD83D\uDCAC' },
  { id: 'calls', name: 'Sales Calls', desc: 'Zoom, Gong recordings', emoji: '\uD83D\uDCDE' },
];

function SourcesDemo() {
  const [selected, setSelected] = useState(['reddit', 'twitter', 'linkedin']);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-[0_20px_60px_-20px_rgba(0,0,0,0.08)]">
      <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
      <div className="p-7">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[13px] font-medium text-neutral-900">Where do users talk?</p>
          <span className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2.5 py-0.5 rounded-full">{selected.length} selected</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {demoSources.map((source) => {
            const isSelected = selected.includes(source.id);
            return (
              <button
                key={source.id}
                onClick={() => toggle(source.id)}
                className={`group flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                  isSelected
                    ? 'border-neutral-900 bg-white shadow-md'
                    : 'border-neutral-200 bg-white/50 hover:bg-white hover:border-neutral-300'
                }`}
              >
                <span className="text-base group-hover:scale-110 transition-transform">{source.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 text-[12px]">{source.name}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{source.desc}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                  isSelected ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300'
                }`}>
                  {isSelected && <Check size={10} className="text-white" />}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-neutral-400 mt-4 text-center">
          Click to toggle &middot; You can add more later
        </p>
      </div>
    </div>
  );
}

// ─── Step 3: Interactive Kanban Demo ───

interface KanbanTicket {
  id: string;
  title: string;
  source: string;
  sourceEmoji: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: string;
  categoryEmoji: string;
  column: 'inbox' | 'reviewing' | 'approved';
}

const initialTickets: KanbanTicket[] = [
  { id: '1', title: 'SSO / SAML for enterprise', source: 'Reddit', sourceEmoji: '\uD83D\uDD34', priority: 'urgent', category: 'Feature', categoryEmoji: '\u2728', column: 'inbox' },
  { id: '2', title: 'Payment crashes on Safari', source: 'Support', sourceEmoji: '\uD83C\uDFAB', priority: 'urgent', category: 'Bug', categoryEmoji: '\uD83D\uDC1B', column: 'inbox' },
  { id: '3', title: 'Mobile app for quick checks', source: 'Twitter', sourceEmoji: '\uD835\uDD4F', priority: 'high', category: 'Feature', categoryEmoji: '\u2728', column: 'inbox' },
  { id: '4', title: 'API rate limits too strict', source: 'Reddit', sourceEmoji: '\uD83D\uDD34', priority: 'medium', category: 'Bug', categoryEmoji: '\uD83D\uDC1B', column: 'reviewing' },
  { id: '5', title: 'Slack notification alerts', source: 'LinkedIn', sourceEmoji: '\uD83D\uDCBC', priority: 'medium', category: 'Feature', categoryEmoji: '\u2728', column: 'reviewing' },
];

const priorityColors: Record<string, string> = {
  urgent: 'bg-rose-100 text-rose-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-indigo-100 text-indigo-700',
  low: 'bg-slate-100 text-slate-700',
};

const columnConfig = {
  inbox: { title: 'Inbox', color: 'bg-slate-500', bgColor: 'bg-slate-50' },
  reviewing: { title: 'Reviewing', color: 'bg-amber-500', bgColor: 'bg-amber-50' },
  approved: { title: 'Approved', color: 'bg-emerald-500', bgColor: 'bg-emerald-50' },
};

function KanbanDemo() {
  const [tickets, setTickets] = useState(initialTickets);

  const moveTicket = (id: string, to: KanbanTicket['column']) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, column: to } : t));
  };

  const columns: KanbanTicket['column'][] = ['inbox', 'reviewing', 'approved'];

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-[0_20px_60px_-20px_rgba(0,0,0,0.08)]">
      <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-medium text-neutral-900">Review Queue</p>
          <p className="text-[11px] text-neutral-400">Click approve/reject to move cards</p>
        </div>

        <LayoutGroup>
          <div className="flex gap-2.5 overflow-x-auto">
            {columns.map(col => {
              const config = columnConfig[col];
              const colTickets = tickets.filter(t => t.column === col);

              return (
                <div key={col} className={`flex-1 min-w-[160px] rounded-xl ${config.bgColor} p-2.5`}>
                  <div className="flex items-center gap-2 mb-2.5 px-1">
                    <div className={`w-2 h-2 rounded-full ${config.color}`} />
                    <span className="text-[11px] font-semibold text-neutral-700">{config.title}</span>
                    <span className="text-[10px] text-neutral-400 bg-white px-1.5 py-0.5 rounded">{colTickets.length}</span>
                  </div>

                  <div className="space-y-2 min-h-[80px]">
                    <AnimatePresence mode="popLayout">
                      {colTickets.map(ticket => (
                        <motion.div
                          key={ticket.id}
                          layout
                          layoutId={ticket.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, ease }}
                          className="bg-white rounded-lg border border-neutral-100 p-2.5 shadow-sm"
                        >
                          <p className="text-[11px] font-medium text-neutral-900 mb-1.5 leading-snug">{ticket.title}</p>
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-[9px]">{ticket.sourceEmoji}</span>
                            <span className="text-[9px] text-neutral-400">{ticket.source}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${priorityColors[ticket.priority]}`}>
                              {ticket.priority}
                            </span>
                          </div>

                          {/* Actions */}
                          {col !== 'approved' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => moveTicket(ticket.id, col === 'inbox' ? 'reviewing' : 'approved')}
                                className="flex items-center gap-1 px-2 py-1 bg-neutral-900 text-white rounded-md text-[9px] font-medium hover:bg-neutral-800 transition-colors"
                              >
                                <CheckCircle2 size={10} />
                                {col === 'inbox' ? 'Review' : 'Approve'}
                              </button>
                              {col === 'reviewing' && (
                                <button
                                  onClick={() => moveTicket(ticket.id, 'inbox')}
                                  className="flex items-center gap-1 px-2 py-1 text-neutral-400 hover:text-rose-500 rounded-md text-[9px] font-medium transition-colors"
                                >
                                  <XCircle size={10} />
                                </button>
                              )}
                            </div>
                          )}
                          {col === 'approved' && (
                            <div className="flex items-center gap-1 text-[9px] text-emerald-600">
                              <Check size={10} />
                              <span>Done</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </LayoutGroup>
      </div>
    </div>
  );
}

// ─── Features — interactive demos ───

function Features() {
  return (
    <section id="features" className="py-28 sm:py-36 bg-neutral-50/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Feature 1 — Omnichannel Listening */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-28 sm:mb-36">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease }}
          >
            <h3 className="font-display text-3xl sm:text-4xl text-neutral-900 tracking-tight mb-4">Omnichannel listening</h3>
            <p className="text-lg text-neutral-400 leading-relaxed max-w-md mb-8">
              Reddit, X, LinkedIn, G2, ProductHunt, Slack, Intercom, Zendesk, sales calls. All funneled into one calm feed. No tab switching, no missed signals.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
          >
            <LiveFeedDemo />
          </motion.div>
        </div>

        {/* Feature 2 — Smart Classification */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-28 sm:mb-36">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="order-2 lg:order-1"
          >
            <ClassificationDemo />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease }}
            className="order-1 lg:order-2"
          >
            <h3 className="font-display text-3xl sm:text-4xl text-neutral-900 tracking-tight mb-4">Smart classification</h3>
            <p className="text-lg text-neutral-400 leading-relaxed max-w-md mb-8">
              Every piece of feedback is auto-categorized into bugs, feature requests, praise, or complaints — with sentiment, priority, and source attribution.
            </p>
          </motion.div>
        </div>

        {/* Feature 3 — Revenue Impact */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease }}
          >
            <h3 className="font-display text-3xl sm:text-4xl text-neutral-900 tracking-tight mb-4">Revenue impact scoring</h3>
            <p className="text-lg text-neutral-400 leading-relaxed max-w-md mb-8">
              Not all requests are equal. Lark scores each one by revenue at risk, mention frequency, and customer tier — so enterprise blockers surface first.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
          >
            <RevenueDemo />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Live Feed Demo (feature 1) ───

const feedData = [
  { text: 'SSO is blocking our enterprise rollout', source: 'Reddit', emoji: '\uD83D\uDD34', time: '2m' },
  { text: 'Love the new dashboard redesign!', source: 'Twitter', emoji: '\uD835\uDD4F', time: '5m' },
  { text: 'SAML needed for SOC 2 compliance', source: 'LinkedIn', emoji: '\uD83D\uDCBC', time: '8m' },
  { text: 'Payment flow crashes on Safari 17', source: 'Support', emoji: '\uD83C\uDFAB', time: '12m' },
  { text: 'Would pay for a mobile app', source: 'G2', emoji: '\u2B50', time: '15m' },
  { text: 'API rate limits need to be higher', source: 'Slack', emoji: '\uD83D\uDCAC', time: '18m' },
  { text: 'Integration with Notion would be key', source: 'Reddit', emoji: '\uD83D\uDD34', time: '22m' },
  { text: 'Dark mode when?', source: 'Twitter', emoji: '\uD835\uDD4F', time: '25m' },
];

function LiveFeedDemo() {
  const [visibleItems, setVisibleItems] = useState(4);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const timer = setInterval(() => {
      setVisibleItems(prev => {
        if (prev >= feedData.length) {
          // Reset to create a loop effect
          return 4;
        }
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [inView]);

  return (
    <div ref={ref} className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Live feed</span>
        <span className="text-[11px] text-neutral-300 ml-auto">Monitoring 6 sources</span>
      </div>

      <div className="space-y-1.5 overflow-hidden max-h-[280px]">
        <AnimatePresence mode="popLayout">
          {feedData.slice(0, visibleItems).map((item, i) => (
            <motion.div
              key={`${item.text}-${i}`}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.35, ease }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors group"
            >
              <span className="text-xs shrink-0">{item.emoji}</span>
              <span className="flex-1 text-[13px] text-neutral-700 truncate">{item.text}</span>
              <span className="text-[10px] text-neutral-300 shrink-0">{item.time}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Classification Demo (feature 2) ───

function ClassificationDemo() {
  const [stage, setStage] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const timers = [
      setTimeout(() => setStage(1), 500),
      setTimeout(() => setStage(2), 1200),
      setTimeout(() => setStage(3), 1800),
      setTimeout(() => setStage(4), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <div ref={ref} className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.08)]">
      <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-4">AI Classification</p>

      {/* Source feedback */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 mb-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs">{'\uD83D\uDD34'}</span>
          <span className="text-[11px] text-neutral-400">Reddit &middot; r/SaaS &middot; 2h ago</span>
        </div>
        <p className="text-sm text-neutral-700 leading-relaxed">
          &ldquo;We can&apos;t roll out to our enterprise customers without SSO/SAML. This has been blocking us for months and several accounts are threatening to churn.&rdquo;
        </p>
      </motion.div>

      {/* Classification badges appear one by one */}
      <div className="flex flex-wrap gap-2 mb-4">
        <AnimatePresence>
          {stage >= 1 && (
            <motion.span
              key="category"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[12px] font-medium border border-indigo-100"
            >
              {'\u2728'} Feature Request
            </motion.span>
          )}
          {stage >= 2 && (
            <motion.span
              key="priority"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full text-[12px] font-medium border border-rose-100"
            >
              Urgent
            </motion.span>
          )}
          {stage >= 3 && (
            <motion.span
              key="sentiment"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-[12px] font-medium border border-red-100"
            >
              Negative
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Generated ticket */}
      <AnimatePresence>
        {stage >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease }}
            className="p-4 bg-neutral-900 rounded-xl text-white"
          >
            <p className="text-[10px] font-medium text-emerald-400 mb-1.5">Auto-drafted ticket</p>
            <p className="text-[13px] font-medium mb-1">Add SSO/SAML Authentication Support</p>
            <p className="text-[11px] text-neutral-400">Enterprise customers blocked from rollout. Multiple churn signals detected. $340K ARR at risk.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Revenue Impact Demo (feature 3) ───

const revenueItems = [
  { name: 'SSO / SAML', mentions: 14, arr: '$340K', score: 94, enterprise: true },
  { name: 'Mobile App', mentions: 9, arr: '$180K', score: 82, enterprise: false },
  { name: 'API v2', mentions: 7, arr: '$95K', score: 71, enterprise: true },
  { name: 'Dark Mode', mentions: 6, arr: '$45K', score: 58, enterprise: false },
];

function RevenueDemo() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.08)]">
      <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-5">Revenue Impact Ranking</p>

      <div className="space-y-3">
        {revenueItems.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.4, ease }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`p-4 rounded-xl border transition-all cursor-default ${
              i === 0 ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white border-neutral-100 hover:border-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className={`text-[12px] font-mono tabular-nums w-6 ${i === 0 ? 'text-neutral-500' : 'text-neutral-300'}`}>
                  #{i + 1}
                </span>
                <div>
                  <p className={`text-[14px] font-medium ${i === 0 ? 'text-white' : 'text-neutral-900'}`}>{item.name}</p>

                  {/* Expanded details on hover */}
                  <AnimatePresence>
                    {hoveredIdx === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3 mt-1"
                      >
                        <span className={`text-[10px] ${i === 0 ? 'text-neutral-400' : 'text-neutral-400'}`}>
                          {item.mentions} mentions
                        </span>
                        <span className={`text-[10px] ${i === 0 ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          {item.arr} ARR
                        </span>
                        {item.enterprise && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${i === 0 ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                            Enterprise
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <span className={`text-xl font-display ${i === 0 ? 'text-white' : 'text-neutral-300'}`}>{item.score}</span>
            </div>

            <div className={`h-1 rounded-full ${i === 0 ? 'bg-neutral-700' : 'bg-neutral-100'}`}>
              <motion.div
                className={`h-full rounded-full ${i === 0 ? 'bg-emerald-500' : 'bg-neutral-300'}`}
                initial={{ width: 0 }}
                animate={inView ? { width: `${item.score}%` } : {}}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-[10px] text-neutral-400 text-center mt-3">Hover to see revenue breakdown</p>
    </div>
  );
}

// ─── Testimonials ───

function Testimonials() {
  const testimonials = [
    {
      quote: 'Lark replaced 3 tools and 10 hours of weekly manual work. We found a $200k churn risk from a Reddit thread we never would have seen.',
      author: 'Sarah Chen',
      role: 'Head of Product, ScaleAI',
    },
    {
      quote: 'The classification is scary accurate. It caught a critical bug from a support ticket that our team missed entirely.',
      author: 'Marcus Johnson',
      role: 'VP Product, CloudStack',
    },
    {
      quote: 'We went from scattered feedback to a prioritized roadmap in one click. Changed how we make decisions.',
      author: 'Emily Rodriguez',
      role: 'PM Lead, FinFlow',
    },
  ];

  return (
    <section className="py-28 sm:py-36">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="lg:sticky lg:top-32"
          >
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-neutral-900 tracking-tight mb-4">
              Teams that
              <br />ship faster
            </h2>
            <p className="text-lg text-neutral-400 leading-relaxed max-w-sm">
              Product teams use Lark to cut through the noise and focus on what actually moves the needle.
            </p>
          </motion.div>

          <div className="space-y-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease }}
                className="p-7 rounded-2xl border border-neutral-100 bg-white"
              >
                <p className="text-[17px] text-neutral-600 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white text-[12px] font-medium">
                    {t.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-neutral-900">{t.author}</p>
                    <p className="text-[12px] text-neutral-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ───

function Pricing() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      desc: 'For solo founders getting started',
      features: ['500 feedback items/mo', '3 source integrations', 'AI classification', 'Basic clustering', 'Email support'],
      cta: 'Start free',
    },
    {
      name: 'Pro',
      price: annual ? '$79' : '$99',
      period: '/mo',
      desc: 'For growing product teams',
      features: ['Unlimited feedback', 'All integrations', 'Revenue scoring', 'Linear/Jira sync', 'Chat assistant', 'Competitor tracking', 'Priority support'],
      cta: 'Start 14-day trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      desc: 'For large organizations',
      features: ['Everything in Pro', 'SSO / SAML', 'Custom integrations', 'Dedicated CSM', 'SLA guarantee', 'SOC 2 Type II'],
      cta: 'Contact sales',
    },
  ];

  return (
    <section id="pricing" className="py-28 sm:py-36 bg-neutral-50/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-neutral-900 tracking-tight">
              Simple,
              <br />honest pricing
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="flex flex-col gap-4 lg:pt-4"
          >
            <p className="text-lg text-neutral-400 leading-relaxed">Start free. Upgrade when you need more. No surprises.</p>
            <div className="inline-flex items-center p-1 bg-neutral-100 rounded-full self-start">
              <button
                onClick={() => setAnnual(false)}
                className={`px-4 py-1.5 text-sm rounded-full transition-all ${!annual ? 'bg-white shadow-sm text-neutral-900 font-medium' : 'text-neutral-400'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-4 py-1.5 text-sm rounded-full transition-all flex items-center gap-1.5 ${annual ? 'bg-white shadow-sm text-neutral-900 font-medium' : 'text-neutral-400'}`}
              >
                Annual
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full">-20%</span>
              </button>
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease }}
              className={`relative p-7 rounded-2xl border transition-all ${
                plan.popular
                  ? 'bg-neutral-900 text-white border-neutral-800 shadow-xl shadow-neutral-900/20'
                  : 'bg-white border-neutral-100 hover:border-neutral-200'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-6 text-[10px] font-semibold bg-emerald-500 text-white px-3 py-1 rounded-full uppercase tracking-wide">
                  Most Popular
                </span>
              )}
              <h3 className={`font-medium text-lg mb-1 ${plan.popular ? 'text-white' : 'text-neutral-900'}`}>{plan.name}</h3>
              <div className="mb-3">
                <span className={`text-4xl font-display ${plan.popular ? 'text-white' : 'text-neutral-900'}`}>{plan.price}</span>
                {plan.period && <span className="text-neutral-400">{plan.period}</span>}
              </div>
              <p className={`text-sm mb-6 ${plan.popular ? 'text-neutral-400' : 'text-neutral-400'}`}>{plan.desc}</p>
              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <Check size={14} className={plan.popular ? 'text-emerald-400' : 'text-emerald-500'} />
                    <span className={plan.popular ? 'text-neutral-300' : 'text-neutral-600'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`block w-full text-center py-3 rounded-full text-sm font-medium transition-all ${
                  plan.popular
                    ? 'bg-white text-neutral-900 hover:bg-neutral-100'
                    : 'border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ───

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    { q: 'How does Lark find feedback?', a: 'Lark connects to Reddit, Twitter/X, LinkedIn, G2, support tools, Slack, and sales call transcripts. It searches for mentions of your product and competitors automatically.' },
    { q: 'Do I need to configure anything?', a: 'Just enter your product name. Lark auto-generates search terms, finds relevant subreddits, and configures monitoring across all channels.' },
    { q: 'How accurate is the classification?', a: 'Our AI correctly classifies feedback into bugs, features, praise, and complaints with over 90% accuracy. You can always correct and retrain.' },
    { q: 'Can I export to my project management tool?', a: 'Yes. Lark integrates with Linear, Jira, GitHub Issues, and Notion. One-click export with full context.' },
  ];

  return (
    <section className="py-28 sm:py-36">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-neutral-900 tracking-tight">
              Common
              <br />questions
            </h2>
          </motion.div>

          <div className="divide-y divide-neutral-100">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left group"
                >
                  <span className="text-[16px] font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors pr-4">{faq.q}</span>
                  <div className="shrink-0">
                    {open === i ? <Minus size={18} className="text-neutral-400" /> : <Plus size={18} className="text-neutral-400" />}
                  </div>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: open === i ? 'auto' : 0, opacity: open === i ? 1 : 0 }}
                  transition={{ duration: 0.3, ease }}
                  className="overflow-hidden"
                >
                  <p className="text-[15px] text-neutral-400 leading-relaxed pb-5">{faq.a}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ───

function CTA() {
  return (
    <section className="py-20 sm:py-28 px-6 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease }}
        className="max-w-7xl mx-auto relative bg-neutral-900 rounded-3xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative grid lg:grid-cols-2 gap-8 p-12 sm:p-16 items-center">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl text-white tracking-tight mb-4">
              Stop guessing.
              <br />Start shipping.
            </h2>
            <p className="text-neutral-400 text-lg max-w-md leading-relaxed">
              Your customers are already telling you what to build. Lark makes sure you hear every word.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row lg:justify-end items-start sm:items-center gap-4">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2.5 px-8 py-4 bg-white text-neutral-900 rounded-full text-[15px] font-medium hover:bg-neutral-100 transition-colors"
            >
              Get started free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              href="#how"
              className="inline-flex items-center gap-2 text-neutral-400 hover:text-white text-[15px] font-medium transition-colors px-4 py-4"
            >
              Learn more
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Footer ───

function Footer() {
  return (
    <footer className="py-14 border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div>
            <Logo size="sm" />
            <p className="text-sm text-neutral-400 mt-3 leading-relaxed max-w-xs">
              Turns scattered customer feedback into a prioritized roadmap.
            </p>
          </div>
          <div>
            <h4 className="text-[13px] font-medium text-neutral-900 mb-3">Product</h4>
            <div className="space-y-2.5">
              <Link href="#features" className="block text-sm text-neutral-400 hover:text-neutral-900 transition-colors">Features</Link>
              <Link href="#pricing" className="block text-sm text-neutral-400 hover:text-neutral-900 transition-colors">Pricing</Link>
              <Link href="#how" className="block text-sm text-neutral-400 hover:text-neutral-900 transition-colors">How it works</Link>
              <Link href="/login" className="block text-sm text-neutral-400 hover:text-neutral-900 transition-colors">Log in</Link>
            </div>
          </div>
          <div>
            <h4 className="text-[13px] font-medium text-neutral-900 mb-3">Integrations</h4>
            <div className="space-y-2.5">
              <span className="block text-sm text-neutral-400">Linear</span>
              <span className="block text-sm text-neutral-400">Jira</span>
              <span className="block text-sm text-neutral-400">GitHub</span>
              <span className="block text-sm text-neutral-400">Slack</span>
            </div>
          </div>
          <div>
            <h4 className="text-[13px] font-medium text-neutral-900 mb-3">Legal</h4>
            <div className="space-y-2.5">
              <Link href="/privacy" className="block text-sm text-neutral-400 hover:text-neutral-900 transition-colors">Privacy</Link>
              <Link href="/terms" className="block text-sm text-neutral-400 hover:text-neutral-900 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-300">&copy; {new Date().getFullYear()} Lark</p>
          <div className="flex items-center gap-5">
            <Link href="https://twitter.com/lark" className="text-sm text-neutral-300 hover:text-neutral-600 transition-colors">X/Twitter</Link>
            <Link href="https://linkedin.com/company/lark" className="text-sm text-neutral-300 hover:text-neutral-600 transition-colors">LinkedIn</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ───

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Nav />
      <Hero />
      <SocialProof />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
