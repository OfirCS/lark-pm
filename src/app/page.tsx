'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  ArrowRight, 
  Check, 
  Menu, 
  X,
  MessageSquare,
  BarChart3,
  Zap,
  Filter,
  Layout,
  GitPullRequest
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

// Navigation
function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Logo size="sm" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {['Product', 'Integrations', 'Customers', 'Pricing'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-all shadow-sm"
            >
              Start for free
            </Link>
          </div>

          <button className="md:hidden p-2 text-stone-600" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

// Hero: The Pipeline Visualization
function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="font-serif text-5xl md:text-7xl text-stone-900 tracking-tight leading-[1.1] mb-8">
            Turn customer noise into <br/>
            <span className="text-stone-900">product strategy.</span>
          </h1>
          <p className="text-xl text-stone-600 leading-relaxed max-w-2xl mx-auto mb-10">
            Lark connects your customer channels to your issue tracker. 
            No more copy-pasting feedback or guessing what to build next.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-xl text-base font-medium bg-stone-900 text-white hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start analyzing for free
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-xl text-base font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all"
            >
              View live demo
            </Link>
          </div>
        </div>

        {/* The Pipeline Visual - Concrete & Tangible */}
        <div className="relative max-w-5xl mx-auto">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone-100 -z-10 hidden md:block" />

            <div className="grid md:grid-cols-3 gap-8 md:gap-4 items-center">
                {/* Step 1: Input */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm relative group hover:-translate-y-1 transition-transform duration-300">
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-bold text-stone-500 uppercase tracking-wider">
                        1. Capture
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-100">
                            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-sm text-[#FF4500]">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z"/></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="h-2 w-16 bg-stone-200 rounded mb-1.5" />
                                <div className="h-2 w-full bg-stone-200 rounded" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-100 opacity-60">
                            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-sm text-[#4A154B]">
                                <MessageSquare size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="h-2 w-20 bg-stone-200 rounded mb-1.5" />
                                <div className="h-2 w-3/4 bg-stone-200 rounded" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 2: Process */}
                <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xl relative z-10 scale-110">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-stone-900 border border-stone-900 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                        2. Lark
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-4 relative">
                            <Logo size="md" variant="icon" />
                            <div className="absolute -right-2 -top-2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                <Check size={12} className="text-white" />
                            </div>
                        </div>
                        <h3 className="font-semibold text-stone-900 mb-1">Synthesizing</h3>
                        <p className="text-sm text-stone-500 mb-4">Finding patterns in the noise</p>
                        
                        <div className="w-full bg-stone-50 rounded-lg p-3 border border-stone-100 text-left">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-stone-900">Top Request</span>
                                <span className="text-xs font-bold text-emerald-600">High Impact</span>
                            </div>
                            <p className="text-sm font-medium text-stone-800">SSO Integration</p>
                            <p className="text-xs text-stone-500">Mentioned by 12 enterprise leads</p>
                        </div>
                    </div>
                </div>

                {/* Step 3: Output */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm relative group hover:-translate-y-1 transition-transform duration-300">
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-bold text-stone-500 uppercase tracking-wider">
                        3. Action
                    </div>
                    <div className="space-y-3">
                        <div className="p-4 bg-white border border-stone-200 rounded-lg shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-4 h-4 rounded-sm bg-[#5E6AD2]" />
                                <span className="text-xs font-medium text-stone-500">LIN-2491 created</span>
                            </div>
                            <p className="text-sm font-medium text-stone-900">Implement SAML SSO</p>
                            <div className="flex gap-2 mt-2">
                                <span className="px-2 py-0.5 bg-stone-100 rounded text-[10px] font-medium text-stone-600">P1</span>
                                <span className="px-2 py-0.5 bg-stone-100 rounded text-[10px] font-medium text-stone-600">Backend</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}

// Feature 1: The Feed (Capture)
function FeatureCapture() {
    return (
        <section className="py-24 bg-stone-50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="w-12 h-12 bg-white rounded-xl border border-stone-200 flex items-center justify-center mb-6 text-stone-900 shadow-sm">
                            <Filter size={24} strokeWidth={1.5} />
                        </div>
                        <h2 className="font-serif text-4xl text-stone-900 mb-6">
                            Stop chasing feedback across 10 tabs.
                        </h2>
                        <p className="text-lg text-stone-600 leading-relaxed mb-8">
                            Reddit, Twitter, Slack, Email, Intercom. Your users are everywhere. 
                            Lark pulls every mention into a single, searchable feed so you never miss a bug report or feature request again.
                        </p>
                        <ul className="space-y-4">
                            {['Auto-tagging by sentiment', 'Filter by enterprise customers', 'Real-time alerts for critical bugs'].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-stone-700 font-medium">
                                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                        <Check size={12} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Visual */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-stone-200 to-transparent rounded-3xl transform rotate-3" />
                        <div className="relative bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden h-[500px]">
                            <div className="p-4 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
                                <span className="font-medium text-sm text-stone-600">Live Feed</span>
                                <div className="flex gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-400" />
                                    <span className="w-2 h-2 rounded-full bg-yellow-400" />
                                    <span className="w-2 h-2 rounded-full bg-green-400" />
                                </div>
                            </div>
                            <div className="p-6 space-y-4 overflow-y-auto h-full pb-20">
                                {[
                                    { src: 'Twitter', user: '@alex_dev', text: 'Can we please get a dark mode? My eyes are burning.', tag: 'Feature' },
                                    { src: 'Reddit', user: 'u/pm_life', text: 'Just moved our team to Lark. The Jira sync is cleaner than I expected.', tag: 'Praise' },
                                    { src: 'Intercom', user: 'Sarah (Acme)', text: 'Urgent: API returning 500 errors on the new endpoint.', tag: 'Bug' },
                                    { src: 'Slack', user: 'Mike (Internal)', text: 'Sales team says everyone is asking for SSO.', tag: 'Insight' },
                                ].map((item, i) => (
                                    <div key={i} className="p-4 rounded-xl border border-stone-100 hover:border-stone-300 hover:shadow-md transition-all bg-white">
                                        <div className="flex justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs text-stone-900">{item.user}</span>
                                                <span className="text-xs text-stone-400">via {item.src}</span>
                                            </div>
                                            <span className="px-2 py-0.5 bg-stone-100 rounded text-[10px] font-bold text-stone-600 uppercase">{item.tag}</span>
                                        </div>
                                        <p className="text-sm text-stone-700">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                            {/* Fade out bottom */}
                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Feature 2: The Analysis (Brain)
function FeatureAnalyze() {
    return (
        <section className="py-24 bg-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Visual - Left on desktop */}
                    <div className="order-2 lg:order-1 relative">
                        <div className="absolute inset-0 bg-stone-100 rounded-3xl transform -rotate-2" />
                        <div className="relative bg-white rounded-2xl border border-stone-200 shadow-xl p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-semibold text-stone-900">Top Insights This Week</h3>
                                <span className="text-sm text-stone-500">Last 7 days</span>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-stone-900">Mobile App Performance</span>
                                        <span className="text-stone-500">42 mentions</span>
                                    </div>
                                    <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-stone-900 w-[85%]" />
                                    </div>
                                    <p className="text-xs text-stone-500 bg-stone-50 p-2 rounded">
                                        &quot;Users are reporting crashes on iOS 17. Seems linked to the new profile update.&quot;
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-stone-900">Pricing Confusion</span>
                                        <span className="text-stone-500">28 mentions</span>
                                    </div>
                                    <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-stone-400 w-[60%]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-stone-900">Integration Requests</span>
                                        <span className="text-stone-500">15 mentions</span>
                                    </div>
                                    <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-stone-300 w-[30%]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2">
                        <div className="w-12 h-12 bg-white rounded-xl border border-stone-200 flex items-center justify-center mb-6 text-stone-900 shadow-sm">
                            <BarChart3 size={24} strokeWidth={1.5} />
                        </div>
                        <h2 className="font-serif text-4xl text-stone-900 mb-6">
                            See the big picture <br/> instantly.
                        </h2>
                        <p className="text-lg text-stone-600 leading-relaxed mb-8">
                            Don&apos;t waste hours tagging tickets. Lark clusters similar feedback automatically, 
                            giving you a quantified list of what&apos;s burning and what&apos;s working.
                        </p>
                        <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                            <p className="text-stone-800 font-medium italic">
                                &quot;Lark found a critical billing bug 4 hours before support tickets started flooding in. It saved our weekend.&quot;
                            </p>
                            <p className="mt-2 text-sm text-stone-500">— Alex, PM at TechFlow</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Feature 3: The Action (Ship)
function FeatureAction() {
    return (
        <section className="py-24 bg-stone-900 text-white overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="w-12 h-12 bg-stone-800 rounded-xl flex items-center justify-center mb-6 text-white shadow-sm border border-stone-700">
                            <Zap size={24} strokeWidth={1.5} />
                        </div>
                        <h2 className="font-serif text-4xl mb-6">
                            Ship with confidence.
                        </h2>
                        <p className="text-lg text-stone-400 leading-relaxed mb-8">
                            Turn insights into Linear issues, Jira tickets, or Notion specs with one click. 
                            Lark pre-fills the context so your engineers have everything they need.
                        </p>
                        <Link href="/signup" className="inline-flex items-center gap-2 text-white font-medium border-b border-white pb-0.5 hover:opacity-80 transition-opacity">
                            See all integrations <ArrowRight size={16} />
                        </Link>
                    </div>
                    
                    {/* Visual */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-purple-500/20 blur-3xl" />
                        <div className="relative bg-stone-800 rounded-2xl border border-stone-700 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-stone-700 rounded flex items-center justify-center">
                                    <Layout size={16} />
                                </div>
                                <span className="font-medium text-stone-300">Sync Settings</span>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-stone-700/50 rounded-xl border border-stone-600">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#5E6AD2] rounded flex items-center justify-center">
                                            <GitPullRequest size={16} />
                                        </div>
                                        <div>
                                            <p className="font-medium">Linear</p>
                                            <p className="text-xs text-stone-400">Sync issues & status</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-6 bg-emerald-500 rounded-full flex items-center justify-end px-1">
                                        <div className="w-4 h-4 bg-white rounded-full" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-stone-700/50 rounded-xl border border-stone-600">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#0052CC] rounded flex items-center justify-center">
                                            <Layout size={16} />
                                        </div>
                                        <div>
                                            <p className="font-medium">Jira</p>
                                            <p className="text-xs text-stone-400">Create tickets</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-6 bg-emerald-500 rounded-full flex items-center justify-end px-1">
                                        <div className="w-4 h-4 bg-white rounded-full" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8 p-4 bg-stone-900 rounded-xl border border-stone-700">
                                <p className="text-xs text-stone-500 uppercase font-bold mb-2">Automated Action</p>
                                <div className="flex items-center gap-2 text-sm">
                                    <Check size={16} className="text-emerald-400" />
                                    <span>Ticket <span className="text-stone-300 font-mono">LIN-392</span> created from trending feedback</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// CTA Section
function CTA() {
  return (
    <section className="py-32 bg-stone-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-12 md:p-20 text-center border border-stone-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-stone-900 via-stone-700 to-stone-900" />
            <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6">
                Stop guessing. Start building.
            </h2>
            <p className="text-xl text-stone-600 mb-10 max-w-2xl mx-auto">
                Join 500+ product teams who use Lark to build what their customers actually want.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                href="/signup"
                className="px-8 py-4 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                Start for free
                </Link>
                <Link
                href="/dashboard"
                className="px-8 py-4 bg-white border border-stone-200 text-stone-600 rounded-xl font-medium hover:bg-stone-50 transition-all"
                >
                Book a demo
                </Link>
            </div>
            <p className="mt-8 text-sm text-stone-400">
                No credit card required · 14-day free trial · Cancel anytime
            </p>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
                <Logo size="sm" className="mb-6" />
                <p className="text-sm text-stone-500">
                    The customer intelligence platform for modern product teams.
                </p>
            </div>
            <div>
                <h4 className="font-bold text-stone-900 mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-stone-600">
                    <li><Link href="#" className="hover:text-stone-900">Features</Link></li>
                    <li><Link href="#" className="hover:text-stone-900">Integrations</Link></li>
                    <li><Link href="#" className="hover:text-stone-900">Pricing</Link></li>
                    <li><Link href="#" className="hover:text-stone-900">Changelog</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-stone-900 mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-stone-600">
                    <li><Link href="#" className="hover:text-stone-900">Manifesto</Link></li>
                    <li><Link href="#" className="hover:text-stone-900">Community</Link></li>
                    <li><Link href="#" className="hover:text-stone-900">Help Center</Link></li>
                    <li><Link href="#" className="hover:text-stone-900">API Docs</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-stone-900 mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-stone-600">
                    <li><Link href="#" className="hover:text-stone-900">About</Link></li>
                    <li><Link href="#" className="hover:text-stone-900">Careers</Link></li>
                    <li><Link href="#" className="hover:text-stone-900">Legal</Link></li>
                    <li><Link href="#" className="hover:text-stone-900">Contact</Link></li>
                </ul>
            </div>
        </div>
        <div className="border-t border-stone-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-sm text-stone-400">© 2026 Lark Inc. All rights reserved.</span>
            <div className="flex gap-6">
                <Link href="#" className="text-stone-400 hover:text-stone-900">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0 0 22 5.92a8.19 8.19 0 0 1-2.357.646 4.118 4.118 0 0 0 1.804-2.27 8.224 8.224 0 0 1-2.605.996 4.107 4.107 0 0 0-6.993 3.743 11.65 11.65 0 0 1-8.457-4.287 4.106 4.106 0 0 0 1.27 5.477A4.072 4.107 0 0 1 2.8 9.713v.052a4.105 4.105 0 0 0 3.292 4.022 4.095 4.095 0 0 1-1.853.07 4.108 4.108 0 0 0 3.834 2.85A8.233 8.233 0 0 1 2 18.407a11.616 11.616 0 0 0 6.29 1.84" /></svg>
                </Link>
                <Link href="#" className="text-stone-400 hover:text-stone-900">
                    <span className="sr-only">GitHub</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.026.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                </Link>
            </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Nav />
      <Hero />
      <FeatureCapture />
      <FeatureAnalyze />
      <FeatureAction />
      <CTA />
      <Footer />
    </main>
  );
}