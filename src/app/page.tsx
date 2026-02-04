'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  ArrowRight, 
  Menu, 
  X,
  MessageSquare,
  BarChart3,
  Zap,
  Check,
  TrendingUp,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

// --- Shared UI Components for Demos ---

function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: 'gray' | 'red' | 'orange' | 'blue' | 'green' }) {
  const styles = {
    gray: 'bg-stone-100 text-stone-600 border-stone-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${styles[color]}`}>
      {children}
    </span>
  );
}

// --- Sections ---

function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-100">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Logo size="sm" />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-stone-600 hover:text-stone-900">Features</Link>
          <Link href="#pricing" className="text-sm font-medium text-stone-600 hover:text-stone-900">Pricing</Link>
          <Link href="/login" className="text-sm font-medium text-stone-600 hover:text-stone-900">Log in</Link>
          <Link href="/signup" className="px-4 py-2 text-sm font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-all">
            Get Started
          </Link>
        </div>
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 bg-white overflow-hidden">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="font-serif text-5xl md:text-7xl text-stone-900 mb-6 tracking-tight leading-[1.1]">
          The AI Product Manager.
        </h1>
        <p className="text-xl text-stone-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Lark connects to your customer channels, identifies feature requests, and drafts tickets for your engineering team.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup" className="px-8 py-3.5 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
            Start for free <ArrowRight size={16} />
          </Link>
          <Link href="/dashboard" className="px-8 py-3.5 bg-stone-100 text-stone-600 rounded-xl font-medium hover:bg-stone-200 transition-all">
            View Demo
          </Link>
        </div>
      </div>

      {/* Hero Visual: The "App" itself */}
      <div className="max-w-6xl mx-auto relative perspective-1000">
        <div className="relative rounded-xl border border-stone-200 bg-white shadow-2xl overflow-hidden transform rotate-x-6 scale-95 hover:scale-100 hover:rotate-x-0 transition-all duration-700">
          {/* Fake Browser Header */}
          <div className="h-10 bg-stone-50 border-b border-stone-200 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            </div>
            <div className="flex-1 text-center text-[10px] font-medium text-stone-400">Lark Dashboard</div>
          </div>

          {/* App UI Snapshot */}
          <div className="flex h-[600px] bg-stone-50/50">
            {/* Sidebar */}
            <div className="w-64 border-r border-stone-200 bg-white hidden md:block p-4 space-y-1">
              <div className="px-3 py-2 text-sm font-medium bg-stone-100 rounded-md text-stone-900 flex items-center gap-3">
                <TrendingUp size={16} /> Feature Requests
              </div>
              <div className="px-3 py-2 text-sm font-medium text-stone-500 flex items-center gap-3">
                <MessageSquare size={16} /> Social Feed
              </div>
              <div className="px-3 py-2 text-sm font-medium text-stone-500 flex items-center gap-3">
                <BarChart3 size={16} /> Analytics
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-stone-900">Feature Requests</h2>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-medium border border-stone-200 rounded-lg bg-white">Filter</button>
                  <button className="px-3 py-1.5 text-xs font-medium bg-stone-900 text-white rounded-lg">+ Add</button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-stone-200 bg-stone-50 text-xs font-medium text-stone-500">
                  <div className="col-span-5">Title</div>
                  <div className="col-span-2">Score</div>
                  <div className="col-span-2">Revenue</div>
                  <div className="col-span-3 text-right">Status</div>
                </div>
                {[
                  { title: "SSO / SAML Support", score: 287, rev: "$450k", status: "Critical", color: "red" },
                  { title: "Salesforce Integration", score: 245, rev: "$320k", status: "High", color: "orange" },
                  { title: "Mobile App (iOS)", score: 198, rev: "$180k", status: "Medium", color: "blue" },
                  { title: "Dark Mode", score: 142, rev: "$50k", status: "Planned", color: "gray" },
                  { title: "API Rate Limiting", score: 120, rev: "$28k", status: "Low", color: "gray" },
                ].map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-stone-100 last:border-0 items-center hover:bg-stone-50/50 transition-colors">
                    <div className="col-span-5 font-medium text-stone-900 text-sm">{item.title}</div>
                    <div className="col-span-2 text-stone-600 text-sm font-semibold">{item.score}</div>
                    <div className="col-span-2 text-stone-500 text-sm">{item.rev}</div>
                    <div className="col-span-3 text-right">
                      {/* @ts-expect-error Badge color prop type is strictly checked elsewhere but here we map dynamic string */}
                      <Badge color={item.color}>{item.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature1() {
  return (
    <section className="py-24 bg-white border-t border-stone-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="font-serif text-4xl text-stone-900 mb-6">Aggregate feedback.</h2>
            <p className="text-lg text-stone-600 mb-8 leading-relaxed">
              Lark monitors Slack, Intercom, Reddit, and Twitter. It identifies bugs and feature requests, then clusters them into actionable insights.
            </p>
            <ul className="space-y-3">
              {['Real-time sentiment analysis', 'Auto-detection of bugs vs requests', 'Revenue impact estimation'].map(i => (
                <li key={i} className="flex items-center gap-3 text-stone-700 text-sm font-medium">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Check size={12} /></div>
                  {i}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Visual: The Feed Card */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl p-2 rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="bg-stone-50 rounded-xl border border-stone-100 p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-400 uppercase">Live Feed</span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              {[
                { user: "@alex_pm", text: "We need an iOS app ASAP.", source: "Twitter" },
                { user: "Sarah (Acme)", text: "The new dashboard is confusing.", source: "Intercom" },
                { user: "u/dev_guy", text: "Love the Linear sync!", source: "Reddit" },
              ].map((msg, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-xs text-stone-900">{msg.user}</span>
                    <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">{msg.source}</span>
                  </div>
                  <p className="text-sm text-stone-600">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature2() {
  return (
    <section className="py-24 bg-stone-50 border-t border-stone-200">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Visual: The Ticket Card */}
          <div className="order-2 lg:order-1 bg-white rounded-2xl border border-stone-200 shadow-xl p-8 -rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <Zap size={20} className="text-stone-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">Create Ticket</h3>
                <p className="text-xs text-stone-500">Linear Integration</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">Title</label>
                <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 font-medium">
                  Implement SSO for Enterprise
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">Description</label>
                <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-600 h-20">
                  Requested by 12 customers including Acme Corp. Revenue risk: $450k...
                </div>
              </div>
              <div className="flex justify-end">
                <div className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg shadow-sm">
                  Create Issue
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="font-serif text-4xl text-stone-900 mb-6">Act on insights.</h2>
            <p className="text-lg text-stone-600 mb-8 leading-relaxed">
              Don&apos;t let feedback gather dust. Lark drafts tickets for Linear, Jira, and GitHub automatically, complete with context and revenue data.
            </p>
            <ul className="space-y-3">
              {['One-click export to issue trackers', 'Two-way status sync', 'Automatic stakeholder updates'].map(i => (
                <li key={i} className="flex items-center gap-3 text-stone-700 text-sm font-medium">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Check size={12} /></div>
                  {i}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      description: 'For teams exploring AI-powered PM',
      price: { monthly: 0, annual: 0 },
      features: [
        '1 data source (Reddit)',
        '50 feedback items/month',
        'Basic classification',
        'Manual ticket creation',
        'Email support',
      ],
      cta: 'Start Free',
      popular: false,
    },
    {
      name: 'Growth',
      description: 'For growing product teams',
      price: { monthly: 249, annual: 199 },
      features: [
        '3 data sources',
        '500 feedback items/month',
        'AI classification + drafting',
        'Linear & Jira integration',
        'Priority support',
        'Weekly digest reports',
      ],
      cta: 'Start Trial',
      popular: true,
    },
    {
      name: 'Business',
      description: 'For scaling organizations',
      price: { monthly: 599, annual: 499 },
      features: [
        'Unlimited data sources',
        '2,000 feedback items/month',
        'Advanced AI workflows',
        'All integrations',
        'Custom classification rules',
        'API access',
        'Dedicated success manager',
      ],
      cta: 'Start Trial',
      popular: false,
    },
    {
      name: 'Enterprise',
      description: 'For large teams with custom needs',
      price: { monthly: null, annual: null },
      features: [
        'Unlimited everything',
        'Custom integrations',
        'SSO / SAML',
        'SLA guarantees',
        'On-premise option',
        'Custom AI training',
        'Dedicated support team',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-white border-t border-stone-100">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl text-stone-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-lg text-stone-500 mb-8">Start free, scale as you grow</p>

          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-stone-900' : 'text-stone-400'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${isAnnual ? 'bg-stone-900' : 'bg-stone-300'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${isAnnual ? 'left-8' : 'left-1'}`} />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-stone-900' : 'text-stone-400'}`}>
              Annual <span className="text-emerald-600 text-xs font-semibold ml-1">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                plan.popular
                  ? 'border-stone-900 shadow-xl scale-105 bg-white'
                  : 'border-stone-200 bg-white hover:border-stone-300 transition-colors'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-stone-900 text-white text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-stone-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-stone-500">{plan.description}</p>
              </div>

              <div className="mb-6">
                {plan.price.monthly === null ? (
                  <div className="text-3xl font-bold text-stone-900">Custom</div>
                ) : plan.price.monthly === 0 ? (
                  <div className="text-3xl font-bold text-stone-900">$0</div>
                ) : (
                  <div>
                    <span className="text-3xl font-bold text-stone-900">
                      ${isAnnual ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span className="text-stone-500 text-sm">/month</span>
                  </div>
                )}
                {plan.price.monthly !== null && plan.price.monthly > 0 && isAnnual && (
                  <p className="text-xs text-stone-400 mt-1">Billed annually</p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-stone-600">
                    <Check size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                className={`block text-center py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                  plan.popular
                    ? 'bg-stone-900 text-white hover:bg-stone-800'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-stone-400 mt-8">
          All plans include 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-32 bg-white border-t border-stone-200">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6">
          Ready to hire your new teammate?
        </h2>
        <p className="text-lg text-stone-500 mb-10">
          Join 500+ product teams building better software with Lark.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup" className="px-8 py-4 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-all shadow-xl hover:-translate-y-1">
            Start for free
          </Link>
        </div>
        <p className="mt-8 text-xs text-stone-400">No credit card required.</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 border-t border-stone-100 bg-stone-50">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <Logo size="sm" />
        <p className="text-sm text-stone-400">© 2026 Lark Inc.</p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Nav />
      <Hero />
      <Feature1 />
      <Feature2 />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
