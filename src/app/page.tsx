'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Check, Plus, Minus } from 'lucide-react';
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? 'bg-white/90 backdrop-blur-sm border-b border-neutral-200' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="hover:opacity-70 transition-opacity">
          <Logo size="sm" />
        </Link>
        <div className="hidden md:flex items-center gap-10">
          <Link href="#features" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Features</Link>
          <Link href="#pricing" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Pricing</Link>
          <Link href="/login" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Log in</Link>
          <Link
            href="/signup"
            className="px-5 py-2 text-sm font-medium bg-neutral-900 text-white rounded-full hover:bg-neutral-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200">
          <div className="px-6 py-4 space-y-3">
            <Link href="#features" className="block text-sm text-neutral-600">Features</Link>
            <Link href="#pricing" className="block text-sm text-neutral-600">Pricing</Link>
            <Link href="/login" className="block text-sm text-neutral-600">Log in</Link>
            <Link href="/signup" className="block w-full text-center px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-full">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// --- Interactive Demo ---

function InteractiveDemo() {
  const [messages, setMessages] = useState<Array<{ id: number; text: string; source: string }>>([]);
  const [phase, setPhase] = useState<'feed' | 'analyzing' | 'done'>('feed');
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const feedbackItems = [
    { text: "We really need SSO for our enterprise rollout", source: "Slack" },
    { text: "Would love a mobile app to check on things", source: "Twitter" },
    { text: "SSO is blocking us from deploying to 500 users", source: "Intercom" },
    { text: "Any plans for SAML authentication?", source: "Reddit" },
    { text: "iOS app would be a game changer", source: "Slack" },
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
          setTimeout(() => setPhase('done'), 1200);
        }, 400);
      }
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xl">
      <div className="h-10 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between px-4">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
        </div>
        <span className="text-[11px] text-neutral-400">app.lark.ai</span>
        <div className="w-12" />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 animate-pulse" />
            <span className="text-[11px] text-neutral-500 uppercase tracking-wide">Live</span>
          </div>
          <span className="text-[11px] text-neutral-400">{messages.length} items</span>
        </div>

        <div className="space-y-1.5 min-h-[180px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer"
              onMouseEnter={() => setHoveredItem(msg.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-700 truncate">{msg.text}</p>
              </div>
              <span className="text-[10px] text-neutral-400 ml-3">{msg.source}</span>
            </div>
          ))}
        </div>

        {phase === 'analyzing' && (
          <div className="mt-3 p-3 rounded-lg bg-neutral-900 text-white">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
              <span className="text-sm">Analyzing...</span>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="mt-3 p-4 rounded-lg bg-neutral-900 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-0.5">Top Request</p>
                <p className="font-medium">SSO / SAML Authentication</p>
                <p className="text-sm text-neutral-400 mt-1">3 mentions · $340k at risk</p>
              </div>
              <span className="text-3xl font-light">94</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Hero ---

function Hero() {
  return (
    <section className="relative pt-28 pb-24 px-6 overflow-hidden">
      {/* Subtle color washes in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl" />
        <div className="absolute top-40 -left-32 w-80 h-80 bg-sky-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-rose-100/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm text-neutral-400 mb-5 tracking-wide">
              Product Intelligence
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] text-neutral-900 mb-6 leading-[1.15] tracking-tight">
              Know what your customers want, before they churn
            </h1>
            <p className="text-lg text-neutral-500 mb-8 leading-relaxed max-w-md">
              Lark aggregates feedback from everywhere and surfaces what matters most to your revenue.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-700 transition-colors"
              >
                Start free trial
                <ArrowRight size={15} />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-200 text-neutral-700 rounded-full text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                See how it works
              </Link>
            </div>
            <p className="mt-5 text-sm text-neutral-400">
              Free 14-day trial · No credit card
            </p>
          </div>

          <InteractiveDemo />
        </div>
      </div>
    </section>
  );
}

// --- Partners ---

function Partners() {
  const partners = ['Notion', 'Linear', 'Figma', 'Stripe', 'Vercel'];

  return (
    <section className="py-14 border-y border-neutral-100">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-xs text-neutral-400 mb-6 uppercase tracking-widest">
          Trusted by product teams at
        </p>
        <div className="flex justify-center items-center gap-10 md:gap-16 flex-wrap">
          {partners.map((name) => (
            <span key={name} className="text-neutral-300 font-medium text-lg hover:text-neutral-500 transition-colors">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Feature Components ---

function SourceSelector() {
  const [selected, setSelected] = useState<string[]>(['Slack', 'Reddit']);
  const sources = ['Slack', 'Reddit', 'Twitter', 'Intercom', 'Zendesk', 'Email'];

  return (
    <div className="bg-white rounded-xl p-5 border border-neutral-200">
      <p className="text-[11px] text-neutral-400 uppercase tracking-wide mb-4">Select sources</p>
      <div className="grid grid-cols-2 gap-2">
        {sources.map((source) => (
          <button
            key={source}
            onClick={() => setSelected(prev => prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source])}
            className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-all ${
              selected.includes(source)
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
            }`}
          >
            {source}
            {selected.includes(source) ? <Check size={14} /> : <Plus size={14} className="text-neutral-400" />}
          </button>
        ))}
      </div>
      <p className="text-sm text-neutral-500 mt-4 pt-4 border-t border-neutral-100">
        <span className="font-medium text-neutral-900">{selected.length}</span> connected
      </p>
    </div>
  );
}

function ClusteringDemo() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const clusters = [
    { id: 1, name: 'Mobile App', count: 47 },
    { id: 2, name: 'SSO Authentication', count: 34 },
    { id: 3, name: 'API Improvements', count: 28 },
  ];
  const items = ["Need mobile app for iOS", "Would love to use this on my phone", "Android app please!", "Mobile support when?"];

  return (
    <div className="bg-white rounded-xl p-5 border border-neutral-200">
      <p className="text-[11px] text-neutral-400 uppercase tracking-wide mb-4">Clustered requests</p>
      <div className="space-y-2">
        {clusters.map((c) => (
          <div key={c.id}>
            <button
              onClick={() => setExpanded(expanded === c.id ? null : c.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border text-sm transition-all ${
                expanded === c.id
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {expanded === c.id ? <Minus size={14} /> : <Plus size={14} className={expanded === c.id ? '' : 'text-neutral-400'} />}
                {c.name}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${expanded === c.id ? 'bg-white/20' : 'bg-neutral-100'}`}>
                {c.count}
              </span>
            </button>
            {expanded === c.id && c.id === 1 && (
              <div className="mt-2 ml-5 space-y-1">
                {items.map((item, i) => (
                  <div key={i} className="text-sm text-neutral-500 p-2 bg-neutral-50 rounded">"{item}"</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreDemo() {
  const [threshold, setThreshold] = useState(70);
  const items = [
    { name: 'SSO / SAML', revenue: '$340k', score: 94 },
    { name: 'Mobile App', revenue: '$180k', score: 82 },
    { name: 'API v2', revenue: '$95k', score: 71 },
    { name: 'Dark Mode', revenue: '$45k', score: 58 },
    { name: 'Webhooks', revenue: '$30k', score: 42 },
  ];

  return (
    <div className="bg-white rounded-xl p-5 border border-neutral-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] text-neutral-400 uppercase tracking-wide">Priority threshold</p>
        <span className="text-sm font-medium">{threshold}</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={threshold}
        onChange={(e) => setThreshold(Number(e.target.value))}
        className="w-full h-1.5 bg-neutral-200 rounded-full appearance-none cursor-pointer mb-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-neutral-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
      />
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.name}
            className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-all ${
              item.score >= threshold
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white border-neutral-200 opacity-40'
            }`}
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className={`text-xs ${item.score >= threshold ? 'text-neutral-400' : 'text-neutral-400'}`}>{item.revenue}</p>
            </div>
            <span className="text-lg">{item.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Features Section ---

function Features() {
  return (
    <section id="features" className="relative py-24 overflow-hidden">
      {/* Background color accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-emerald-50/50 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-violet-50/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="text-center mb-20">
          <h2 className="font-display text-3xl sm:text-4xl text-neutral-900 mb-4">How it works</h2>
          <p className="text-lg text-neutral-500 max-w-lg mx-auto">
            From scattered feedback to prioritized roadmap.
          </p>
        </div>

        <div className="space-y-28">
          {/* Feature 1 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm text-neutral-300 mb-2 block">01</span>
              <h3 className="font-display text-2xl sm:text-3xl text-neutral-900 mb-4">Connect your sources</h3>
              <p className="text-neutral-500 leading-relaxed">
                Pull feedback from Slack, Intercom, Reddit, Twitter, and support tickets. Click to toggle.
              </p>
            </div>
            <SourceSelector />
          </div>

          {/* Feature 2 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2">
              <span className="text-sm text-neutral-300 mb-2 block">02</span>
              <h3 className="font-display text-2xl sm:text-3xl text-neutral-900 mb-4">AI clusters similar requests</h3>
              <p className="text-neutral-500 leading-relaxed">
                Stop reading the same request 50 times. Click a cluster to expand.
              </p>
            </div>
            <ClusteringDemo />
          </div>

          {/* Feature 3 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm text-neutral-300 mb-2 block">03</span>
              <h3 className="font-display text-2xl sm:text-3xl text-neutral-900 mb-4">Prioritize by impact</h3>
              <p className="text-neutral-500 leading-relaxed">
                Drag the slider to filter by priority score.
              </p>
            </div>
            <ScoreDemo />
          </div>
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
      description: 'For small teams',
      features: ['500 feedback items/mo', '3 integrations', 'Basic clustering'],
      cta: 'Start free',
    },
    {
      name: 'Pro',
      price: annual ? '$79' : '$99',
      period: '/mo',
      description: 'For growing teams',
      features: ['Unlimited items', 'All integrations', 'Revenue scoring', 'Linear/Jira sync'],
      cta: 'Start trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large orgs',
      features: ['Everything in Pro', 'SSO / SAML', 'Dedicated support'],
      cta: 'Contact sales',
    },
  ];

  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-orange-50/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl text-neutral-900 mb-4">Pricing</h2>
          <p className="text-neutral-500 mb-6">Start free. Upgrade when you need more.</p>

          <div className="inline-flex items-center p-1 bg-neutral-100 rounded-full">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 text-sm rounded-full transition-all ${!annual ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 text-sm rounded-full transition-all ${annual ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'}`}
            >
              Annual
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-6 rounded-xl border transition-all ${
                plan.popular
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {plan.popular && (
                <span className="inline-block text-[10px] font-medium bg-white text-neutral-900 px-2 py-0.5 rounded-full mb-3 uppercase tracking-wide">
                  Popular
                </span>
              )}
              <h3 className={`font-medium mb-1 ${plan.popular ? 'text-white' : 'text-neutral-900'}`}>{plan.name}</h3>
              <div className="mb-3">
                <span className={`text-3xl font-display ${plan.popular ? 'text-white' : 'text-neutral-900'}`}>{plan.price}</span>
                {plan.period && <span className={plan.popular ? 'text-neutral-400' : 'text-neutral-400'}>{plan.period}</span>}
              </div>
              <p className={`text-sm mb-5 ${plan.popular ? 'text-neutral-400' : 'text-neutral-500'}`}>{plan.description}</p>
              <ul className="space-y-2 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check size={14} className={plan.popular ? 'text-neutral-500' : 'text-neutral-400'} />
                    <span className={plan.popular ? 'text-neutral-300' : 'text-neutral-600'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`block w-full text-center py-2.5 rounded-full text-sm font-medium transition-all ${
                  plan.popular
                    ? 'bg-white text-neutral-900 hover:bg-neutral-100'
                    : 'border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- CTA ---

function CTA() {
  return (
    <section className="py-20 bg-neutral-900">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="font-display text-3xl text-white mb-4">
          Stop guessing what to build
        </h2>
        <p className="text-neutral-400 mb-8">
          Join 500+ product teams using Lark.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-900 rounded-full text-sm font-medium hover:bg-neutral-100 transition-colors"
        >
          Start free trial
          <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}

// --- Footer ---

function Footer() {
  return (
    <footer className="py-10 bg-white border-t border-neutral-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-neutral-400 hover:text-neutral-600">Privacy</Link>
            <Link href="/terms" className="text-sm text-neutral-400 hover:text-neutral-600">Terms</Link>
            <Link href="https://twitter.com/lark" className="text-sm text-neutral-400 hover:text-neutral-600">Twitter</Link>
          </div>
          <p className="text-sm text-neutral-300">2024 Lark</p>
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
      <Partners />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
