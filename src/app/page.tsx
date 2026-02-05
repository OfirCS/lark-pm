'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Menu,
  X,
  ArrowRight,
  Check,
  Plus,
  Minus,
  Sparkles,
  Zap,
  BarChart3,
  MessageSquare,
  Globe,
  Shield,
  Clock,
  TrendingUp,
  Users,
  Star,
  ChevronRight,
  Play,
  Search,
  Bot,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

// --- Navigation ---

function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="hover:opacity-70 transition-opacity">
          <Logo size="sm" />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">How it works</Link>
          <Link href="#features" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Features</Link>
          <Link href="#pricing" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Pricing</Link>
          <div className="h-4 w-px bg-neutral-200" />
          <Link href="/login" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Log in</Link>
          <Link
            href="/signup"
            className="group px-5 py-2 text-sm font-medium bg-neutral-900 text-white rounded-full hover:bg-neutral-700 transition-all hover:shadow-lg hover:shadow-neutral-900/20"
          >
            <span className="flex items-center gap-2">
              Get Started Free
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-b border-neutral-200"
          >
            <div className="px-6 py-4 space-y-3">
              <Link href="#how-it-works" className="block text-sm text-neutral-600 py-2" onClick={() => setIsOpen(false)}>How it works</Link>
              <Link href="#features" className="block text-sm text-neutral-600 py-2" onClick={() => setIsOpen(false)}>Features</Link>
              <Link href="#pricing" className="block text-sm text-neutral-600 py-2" onClick={() => setIsOpen(false)}>Pricing</Link>
              <Link href="/login" className="block text-sm text-neutral-600 py-2">Log in</Link>
              <Link href="/signup" className="block w-full text-center px-4 py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-full">
                Get Started Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// --- Animated Counter ---

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// --- Live Demo ---

function LiveDemo() {
  const [messages, setMessages] = useState<Array<{ id: number; text: string; source: string; sourceColor: string }>>([]);
  const [phase, setPhase] = useState<'feed' | 'analyzing' | 'done'>('feed');

  const feedbackItems = [
    { text: "We need SSO for our enterprise rollout", source: "Reddit", sourceColor: "bg-orange-500" },
    { text: "Would love a mobile app to check on things", source: "X/Twitter", sourceColor: "bg-neutral-900" },
    { text: "SSO is blocking us from deploying to 500 users", source: "LinkedIn", sourceColor: "bg-blue-600" },
    { text: "Any plans for SAML authentication?", source: "G2 Forum", sourceColor: "bg-emerald-600" },
    { text: "iOS app would be a game changer", source: "Slack", sourceColor: "bg-purple-600" },
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < feedbackItems.length) {
        setMessages(prev => [...prev, { id: Date.now(), ...feedbackItems[index] }]);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setPhase('analyzing');
          setTimeout(() => setPhase('done'), 1500);
        }, 600);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-neutral-200/50 via-neutral-100/30 to-neutral-200/50 rounded-3xl blur-2xl" />

      <div className="relative bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-2xl shadow-neutral-900/10">
        {/* Browser chrome */}
        <div className="h-10 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between px-4">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-md border border-neutral-200">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-neutral-500">app.lark.pm</span>
          </div>
          <div className="w-12" />
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide">AI Scanning</span>
            </div>
            <span className="text-[11px] text-neutral-400">{messages.length} sources</span>
          </div>

          <div className="space-y-1.5 min-h-[200px]">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 hover:bg-neutral-100/80 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-700 truncate">&ldquo;{msg.text}&rdquo;</p>
                  </div>
                  <span className={`text-[10px] text-white px-2 py-0.5 rounded-full ml-3 ${msg.sourceColor}`}>
                    {msg.source}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'analyzing' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 p-4 rounded-xl bg-neutral-900 text-white"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
                  <div>
                    <span className="text-sm font-medium">AI analyzing patterns...</span>
                    <p className="text-xs text-neutral-400 mt-0.5">Clustering, scoring, prioritizing</p>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'done' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-4 rounded-xl bg-neutral-900 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles size={14} className="text-amber-400" />
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Top Priority</p>
                    </div>
                    <p className="font-semibold">SSO / SAML Authentication</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-neutral-400">3 mentions</span>
                      <span className="text-xs text-rose-400 font-medium">$340k at risk</span>
                      <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">Urgent</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-light text-white">94</span>
                    <p className="text-[10px] text-neutral-500">score</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --- Hero ---

function Hero() {
  return (
    <section className="relative pt-28 pb-20 px-6 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-amber-100/60 via-orange-50/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-20 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-sky-100/40 via-indigo-50/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-t from-rose-50/30 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Announcement banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <Link
            href="#how-it-works"
            className="group inline-flex items-center gap-2 px-4 py-1.5 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200/50 rounded-full transition-all"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-600">
              <Zap size={12} className="text-amber-500" />
              Your AI Product Manager is here
            </span>
            <ChevronRight size={14} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] text-neutral-900 mb-6 leading-[1.1] tracking-tight">
              Your AI Product Manager. One click, all the research.
            </h1>
            <p className="text-lg text-neutral-500 mb-8 leading-relaxed max-w-lg">
              Lark scans Reddit, X, LinkedIn, forums and every customer channel &mdash; then turns noise into a prioritized roadmap backed by real revenue data.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-700 transition-all shadow-lg shadow-neutral-900/20 hover:shadow-xl hover:shadow-neutral-900/25"
              >
                <Sparkles size={16} />
                Start for free
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="#how-it-works"
                className="group inline-flex items-center gap-2 px-6 py-3.5 border border-neutral-200 text-neutral-700 rounded-full text-sm font-medium hover:bg-neutral-50 hover:border-neutral-300 transition-all"
              >
                <Play size={14} />
                Watch it work
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-6 text-sm text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-500" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-500" />
                Setup in 60 seconds
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-500" />
                Free tier forever
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <LiveDemo />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// --- Social Proof Bar ---

function SocialProof() {
  const metrics = [
    { value: 500, suffix: '+', label: 'Product teams' },
    { value: 2, suffix: 'M+', label: 'Feedback analyzed' },
    { value: 47, suffix: '%', label: 'Faster decisions' },
    { value: 340, suffix: 'K', label: 'Revenue saved' },
  ];

  return (
    <section className="py-16 border-y border-neutral-100 bg-neutral-50/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {metrics.map((m) => (
            <div key={m.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-display text-neutral-900">
                <AnimatedNumber value={m.value} suffix={m.suffix} />
              </p>
              <p className="text-sm text-neutral-500 mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- How It Works ---

function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Tell Lark about your product',
      description: 'Type your product name and competitors. That\'s it. Lark auto-configures everything else.',
      icon: Bot,
      demo: <OnboardingMiniDemo />,
    },
    {
      number: '02',
      title: 'AI scans everywhere',
      description: 'Reddit, X/Twitter, LinkedIn, G2, forums, support tickets, Slack, sales calls &mdash; all monitored 24/7.',
      icon: Globe,
      demo: <SourcesDemo />,
    },
    {
      number: '03',
      title: 'Get a prioritized roadmap',
      description: 'Clustered requests, revenue impact scores, auto-drafted tickets ready to push to Linear or Jira.',
      icon: TrendingUp,
      demo: <ScoreDemo />,
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-emerald-50/50 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-violet-50/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 rounded-full text-xs font-medium text-neutral-600 mb-4"
          >
            <Clock size={12} />
            60-second setup
          </motion.span>
          <h2 className="font-display text-3xl sm:text-4xl text-neutral-900 mb-4">
            Three clicks to your AI PM
          </h2>
          <p className="text-lg text-neutral-500 max-w-lg mx-auto">
            No complex setup. No manual configuration. Just tell Lark what you build and watch it work.
          </p>
        </div>

        <div className="space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}
            >
              <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center">
                    <step.icon size={20} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-neutral-300">{step.number}</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl text-neutral-900 mb-4">{step.title}</h3>
                <p className="text-neutral-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: step.description }} />
              </div>
              <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                {step.demo}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Mini Demos ---

function OnboardingMiniDemo() {
  const [typed, setTyped] = useState('');
  const fullText = 'Notion';

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullText.length) {
        setTyped(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 150);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-lg">
      <p className="text-[11px] text-neutral-400 uppercase tracking-wide mb-4 font-medium">Quick Setup</p>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-neutral-600 mb-1.5 block font-medium">Product name</label>
          <div className="px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 flex items-center justify-between">
            <span>{typed}<span className="animate-pulse">|</span></span>
            {typed === fullText && <Check size={16} className="text-emerald-500" />}
          </div>
        </div>
        <div>
          <label className="text-sm text-neutral-600 mb-1.5 block font-medium">Competitors</label>
          <div className="flex flex-wrap gap-2">
            {['Asana', 'ClickUp', 'Monday'].map(c => (
              <span key={c} className="px-3 py-1.5 bg-neutral-100 rounded-full text-sm text-neutral-700">{c}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-neutral-500">Lark auto-detects</p>
            <p className="text-sm font-medium text-neutral-900">4 subreddits, 12 keywords, 3 forums</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourcesDemo() {
  const [active, setActive] = useState<string[]>(['reddit', 'twitter', 'linkedin']);
  const sources = [
    { id: 'reddit', name: 'Reddit', emoji: '🔴', mentions: '2.3k' },
    { id: 'twitter', name: 'X / Twitter', emoji: '𝕏', mentions: '1.8k' },
    { id: 'linkedin', name: 'LinkedIn', emoji: '💼', mentions: '950' },
    { id: 'g2', name: 'G2 Reviews', emoji: '⭐', mentions: '340' },
    { id: 'slack', name: 'Slack', emoji: '💬', mentions: '780' },
    { id: 'support', name: 'Support', emoji: '🎫', mentions: '1.2k' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] text-neutral-400 uppercase tracking-wide font-medium">Connected Sources</p>
        <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
          {active.length} active
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {sources.map((source) => (
          <button
            key={source.id}
            onClick={() => setActive(prev =>
              prev.includes(source.id) ? prev.filter(s => s !== source.id) : [...prev, source.id]
            )}
            className={`flex items-center gap-3 p-3 rounded-xl border text-sm transition-all ${
              active.includes(source.id)
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <span className="text-base">{source.emoji}</span>
            <div className="flex-1 text-left">
              <span className="block text-sm font-medium">{source.name}</span>
              <span className={`text-[10px] ${active.includes(source.id) ? 'text-neutral-400' : 'text-neutral-400'}`}>
                {source.mentions} mentions
              </span>
            </div>
            {active.includes(source.id) && <Check size={14} />}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScoreDemo() {
  const [threshold, setThreshold] = useState(65);
  const items = [
    { name: 'SSO / SAML', revenue: '$340k ARR', score: 94, mentions: 23 },
    { name: 'Mobile App', revenue: '$180k ARR', score: 82, mentions: 18 },
    { name: 'API v2', revenue: '$95k ARR', score: 71, mentions: 12 },
    { name: 'Dark Mode', revenue: '$45k ARR', score: 58, mentions: 8 },
    { name: 'Webhooks', revenue: '$30k ARR', score: 42, mentions: 5 },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] text-neutral-400 uppercase tracking-wide font-medium">Priority Threshold</p>
        <span className="text-sm font-semibold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-md">{threshold}</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={threshold}
        onChange={(e) => setThreshold(Number(e.target.value))}
        className="w-full h-1.5 bg-neutral-200 rounded-full appearance-none cursor-pointer mb-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-neutral-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
      />
      <div className="space-y-2">
        {items.map((item) => (
          <motion.div
            key={item.name}
            layout
            className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
              item.score >= threshold
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white border-neutral-200 opacity-40'
            }`}
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <div className="flex items-center gap-2">
                <p className={`text-xs ${item.score >= threshold ? 'text-neutral-400' : 'text-neutral-400'}`}>{item.revenue}</p>
                <span className={`text-[10px] ${item.score >= threshold ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  {item.mentions} mentions
                </span>
              </div>
            </div>
            <span className="text-lg font-semibold">{item.score}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Features Grid ---

function Features() {
  const features = [
    {
      icon: Globe,
      title: 'Omnichannel Listening',
      description: 'Reddit, X, LinkedIn, G2, ProductHunt, Slack, Intercom, Zendesk, sales calls &mdash; all in one feed.',
    },
    {
      icon: Bot,
      title: 'AI Classification',
      description: 'Auto-categorize into bugs, features, praise, and complaints with sentiment and priority scores.',
    },
    {
      icon: BarChart3,
      title: 'Revenue Impact Scoring',
      description: 'See which requests have the most revenue at risk. Enterprise blockers rise to the top.',
    },
    {
      icon: Zap,
      title: 'One-Click Tickets',
      description: 'AI drafts tickets with full context. Push to Linear, Jira, GitHub, or Notion in one click.',
    },
    {
      icon: MessageSquare,
      title: 'AI Chat Assistant',
      description: 'Ask your AI PM anything. "What features did enterprise customers request this week?"',
    },
    {
      icon: Shield,
      title: 'Competitor Intelligence',
      description: 'Track what customers say about your competitors. Know their pain points before they do.',
    },
  ];

  return (
    <section id="features" className="py-24 bg-neutral-50/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl text-neutral-900 mb-4">
            Everything a PM needs, automated
          </h2>
          <p className="text-lg text-neutral-500 max-w-lg mx-auto">
            Stop spending hours reading Reddit threads. Let AI do the research while you make decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-lg transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-neutral-900 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <feature.icon size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: feature.description }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Testimonials ---

function Testimonials() {
  const testimonials = [
    {
      quote: "Lark replaced 3 tools and 10 hours of weekly manual work. We found a $200k churn risk from a Reddit thread we never would have seen.",
      author: 'Sarah Chen',
      role: 'Head of Product, ScaleAI',
      avatar: 'SC',
    },
    {
      quote: "The AI classification is scary accurate. It caught a critical bug from a support ticket that our team missed. We fixed it before it became a PR crisis.",
      author: 'Marcus Johnson',
      role: 'VP Product, CloudStack',
      avatar: 'MJ',
    },
    {
      quote: "We went from idea to prioritized roadmap in literally one click. The revenue impact scoring changed how we make product decisions.",
      author: 'Emily Rodriguez',
      role: 'PM Lead, FinFlow',
      avatar: 'ER',
    },
  ];

  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} size={20} className="text-amber-400 fill-amber-400" />
            ))}
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-neutral-900 mb-4">
            Loved by product teams
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 bg-white rounded-2xl border border-neutral-200 hover:shadow-lg transition-all"
            >
              <p className="text-neutral-700 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white text-sm font-medium">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-medium text-neutral-900 text-sm">{t.author}</p>
                  <p className="text-xs text-neutral-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Pricing ---

function Pricing() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'For solo founders and small teams getting started',
      features: ['500 feedback items/mo', '3 source integrations', 'AI classification', 'Basic clustering', 'Email support'],
      cta: 'Start free',
    },
    {
      name: 'Pro',
      price: annual ? '$79' : '$99',
      period: '/mo',
      description: 'For growing product teams who need the full picture',
      features: ['Unlimited feedback items', 'All source integrations', 'Revenue impact scoring', 'Linear/Jira/GitHub sync', 'AI chat assistant', 'Competitor tracking', 'Priority support'],
      cta: 'Start 14-day trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large orgs with advanced security needs',
      features: ['Everything in Pro', 'SSO / SAML', 'Custom integrations', 'Dedicated CSM', 'SLA guarantee', 'SOC 2 Type II'],
      cta: 'Contact sales',
    },
  ];

  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-orange-50/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl text-neutral-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-neutral-500 mb-6">Start free. Upgrade when you need more.</p>

          <div className="inline-flex items-center p-1 bg-neutral-100 rounded-full">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 text-sm rounded-full transition-all ${!annual ? 'bg-white shadow-sm text-neutral-900 font-medium' : 'text-neutral-500'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 text-sm rounded-full transition-all flex items-center gap-1.5 ${annual ? 'bg-white shadow-sm text-neutral-900 font-medium' : 'text-neutral-500'}`}
            >
              Annual
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`relative p-6 rounded-2xl border transition-all ${
                plan.popular
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-xl shadow-neutral-900/20'
                  : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-lg'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold bg-white text-neutral-900 px-3 py-1 rounded-full uppercase tracking-wide shadow-sm border border-neutral-200">
                  Most Popular
                </span>
              )}
              <h3 className={`font-semibold mb-1 ${plan.popular ? 'text-white' : 'text-neutral-900'}`}>{plan.name}</h3>
              <div className="mb-3">
                <span className={`text-3xl font-display ${plan.popular ? 'text-white' : 'text-neutral-900'}`}>{plan.price}</span>
                {plan.period && <span className={plan.popular ? 'text-neutral-400' : 'text-neutral-400'}>{plan.period}</span>}
              </div>
              <p className={`text-sm mb-5 ${plan.popular ? 'text-neutral-400' : 'text-neutral-500'}`}>{plan.description}</p>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check size={14} className={plan.popular ? 'text-emerald-400' : 'text-emerald-500'} />
                    <span className={plan.popular ? 'text-neutral-300' : 'text-neutral-600'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`block w-full text-center py-2.5 rounded-full text-sm font-medium transition-all ${
                  plan.popular
                    ? 'bg-white text-neutral-900 hover:bg-neutral-100 shadow-lg'
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

// --- Final CTA ---

function CTA() {
  return (
    <section className="py-24 bg-neutral-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neutral-800/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-neutral-800/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto px-6 text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-neutral-300 mb-6">
          <Sparkles size={12} className="text-amber-400" />
          Join 500+ product teams
        </div>
        <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
          Stop guessing. Start knowing.
        </h2>
        <p className="text-neutral-400 mb-8 text-lg">
          Your customers are already telling you what to build. Lark makes sure you hear every word.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white text-neutral-900 rounded-full text-sm font-medium hover:bg-neutral-100 transition-all shadow-lg"
          >
            <Sparkles size={16} />
            Start for free
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-6 py-3.5 border border-neutral-700 text-neutral-300 rounded-full text-sm font-medium hover:border-neutral-500 hover:text-white transition-all"
          >
            See how it works
          </Link>
        </div>
      </div>
    </section>
  );
}

// --- Footer ---

function Footer() {
  return (
    <footer className="py-12 bg-white border-t border-neutral-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <Logo size="sm" />
            <p className="text-sm text-neutral-500 mt-3 leading-relaxed">
              Your AI Product Manager. Turns scattered feedback into a prioritized roadmap.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Product</h4>
            <div className="space-y-2">
              <Link href="#features" className="block text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Features</Link>
              <Link href="#pricing" className="block text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Pricing</Link>
              <Link href="#how-it-works" className="block text-sm text-neutral-500 hover:text-neutral-900 transition-colors">How it works</Link>
              <Link href="/login" className="block text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Log in</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Integrations</h4>
            <div className="space-y-2">
              <span className="block text-sm text-neutral-500">Linear</span>
              <span className="block text-sm text-neutral-500">Jira</span>
              <span className="block text-sm text-neutral-500">GitHub</span>
              <span className="block text-sm text-neutral-500">Slack</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Legal</h4>
            <div className="space-y-2">
              <Link href="/privacy" className="block text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="block text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-400">&copy; 2025 Lark. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="https://twitter.com/lark" className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors">X/Twitter</Link>
            <Link href="https://linkedin.com/company/lark" className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors">LinkedIn</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- Page ---

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
      <CTA />
      <Footer />
    </main>
  );
}
