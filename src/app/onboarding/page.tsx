'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Sparkles, Radio, Zap, Loader2, Plus, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useCompanyStore } from '@/lib/stores/companyStore';

// Data sources to monitor
const dataSources = [
  { id: 'reddit', name: 'Reddit', desc: 'r/SaaS, r/startups, etc.', emoji: '🔴' },
  { id: 'twitter', name: 'X / Twitter', desc: 'Mentions & hashtags', emoji: '𝕏' },
  { id: 'linkedin', name: 'LinkedIn', desc: 'Posts & comments', emoji: '💼' },
  { id: 'g2', name: 'G2 Reviews', desc: 'Product reviews & ratings', emoji: '⭐' },
  { id: 'slack', name: 'Slack', desc: 'Internal feedback channels', emoji: '💬' },
  { id: 'calls', name: 'Sales Calls', desc: 'Zoom, Gong recordings', emoji: '📞' },
];

// Integrations
const integrations = [
  { id: 'slack', name: 'Slack', emoji: '💬', desc: 'Alerts & Triage' },
  { id: 'linear', name: 'Linear', emoji: '📐', desc: 'Sync Issues' },
  { id: 'jira', name: 'Jira', emoji: '📋', desc: 'Create Tickets' },
  { id: 'github', name: 'GitHub', emoji: '🐙', desc: 'Issues & PRs' },
  { id: 'notion', name: 'Notion', emoji: '📝', desc: 'Knowledge Base' },
];

// Default subreddits by industry
const defaultSubreddits = ['SaaS', 'startups', 'ProductManagement', 'Entrepreneur', 'smallbusiness'];

export default function OnboardingPage() {
  const router = useRouter();
  const { setProductName, setCompany, setEnabledSources, setSelectedIntegrations, setSubreddits, setCompetitors, completeOnboarding } = useCompanyStore();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [competitorInput, setCompetitorInput] = useState('');
  const [data, setData] = useState({
    productName: '',
    productDescription: '',
    targetAudience: '',
    currentFocus: '',
    competitors: [] as string[],
    sources: ['reddit', 'twitter', 'linkedin'] as string[],
    integrations: [] as string[],
  });

  const totalSteps = 3;

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setIsLoading(true);

      // Auto-generate search terms from product name
      const searchTerms = data.productName
        ? [data.productName, `${data.productName} feedback`, `${data.productName} review`, `${data.productName} alternative`]
        : [];

      // Auto-generate Twitter keywords
      const twitterKeywords = data.productName
        ? [data.productName, `#${data.productName.replace(/\s+/g, '')}`]
        : [];

      // Save to Supabase first
      try {
        const response = await fetch('/api/company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productName: data.productName,
            productDescription: data.productDescription,
            targetAudience: data.targetAudience,
            currentFocus: data.currentFocus,
            competitors: data.competitors,
            searchTerms,
            subreddits: defaultSubreddits,
            twitterKeywords,
            enabledSources: data.sources,
            selectedIntegrations: data.integrations,
            onboardingCompleted: true,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          console.error('Failed to save to Supabase:', result.error);
        } else {
          console.log('Saved company settings to Supabase:', result.data);
        }
      } catch (err) {
        console.error('Error saving to Supabase:', err);
      }

      // Also save to local store as backup
      setProductName(data.productName);
      setCompany({
        productDescription: data.productDescription,
        targetAudience: data.targetAudience,
        currentFocus: data.currentFocus,
      });
      setEnabledSources(data.sources);
      setSelectedIntegrations(data.integrations);
      setCompetitors(data.competitors);
      setSubreddits(defaultSubreddits);
      completeOnboarding();

      router.push('/dashboard');
    }
  };

  const addCompetitor = () => {
    if (competitorInput.trim() && !data.competitors.includes(competitorInput.trim())) {
      setData(prev => ({
        ...prev,
        competitors: [...prev.competitors, competitorInput.trim()]
      }));
      setCompetitorInput('');
    }
  };

  const removeCompetitor = (comp: string) => {
    setData(prev => ({
      ...prev,
      competitors: prev.competitors.filter(c => c !== comp)
    }));
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleSource = (id: string) => {
    setData(prev => ({
      ...prev,
      sources: prev.sources.includes(id)
        ? prev.sources.filter(s => s !== id)
        : [...prev.sources, id]
    }));
  };

  const toggleIntegration = (id: string) => {
    setData(prev => ({
      ...prev,
      integrations: prev.integrations.includes(id)
        ? prev.integrations.filter(i => i !== id)
        : [...prev.integrations, id]
    }));
  };

  const canProceed = () => {
    if (step === 1) return data.productName.length > 0;
    if (step === 2) return data.sources.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-stone-50 relative overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-stone-200/40 rounded-full blur-[120px] mix-blend-multiply" />
          <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-stone-100/60 rounded-full blur-[120px] mix-blend-multiply" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-200/50">
            <span className="text-xs font-medium text-stone-500">Step {step} of {totalSteps}</span>
            <div className="flex gap-1">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    s <= step ? 'bg-stone-900 w-8' : 'bg-stone-200 w-6'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 relative z-10 pt-20 pb-32">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-8 md:p-10 rounded-3xl shadow-smooth-lg backdrop-blur-xl bg-white/70 border border-white/50"
            >
              {/* Step 1: What's your product? */}
              {step === 1 && (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-stone-900 flex items-center justify-center mb-6 shadow-lg shadow-stone-900/20">
                    <Sparkles size={28} className="text-white" />
                  </div>

                  <h1 className="font-serif text-3xl md:text-4xl text-stone-900 mb-3 leading-tight">
                    What are we building?
                  </h1>
                  <p className="text-stone-500 text-lg mb-8 leading-relaxed">
                    Tell us about your product. Lark will auto-configure AI search across all channels.
                  </p>

                  <div className="space-y-5">
                    {/* Product Name */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-stone-700 mb-1.5">Product name</label>
                        <input
                            type="text"
                            value={data.productName}
                            onChange={(e) => setData({ ...data, productName: e.target.value })}
                            placeholder="e.g. Notion, Linear, Figma"
                            autoFocus
                            className="w-full px-5 py-4 bg-white border border-stone-200 rounded-xl text-lg placeholder:text-stone-300 focus:outline-none focus:border-stone-900 focus:ring-4 focus:ring-stone-100 transition-all shadow-sm"
                        />
                        <div className="absolute right-4 bottom-4">
                            {data.productName.length > 0 && <Check size={20} className="text-emerald-500" />}
                        </div>
                    </div>

                    {/* Auto-detected label */}
                    {data.productName.length > 2 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-100"
                      >
                        <Sparkles size={14} className="text-amber-500" />
                        <span className="text-sm text-stone-600">
                          Lark will auto-search for <strong className="text-stone-900">{data.productName}</strong> across Reddit, X, LinkedIn &amp; forums
                        </span>
                      </motion.div>
                    )}

                    {/* Product Description */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">
                        What does it do? <span className="text-stone-400 font-normal">(1-2 sentences)</span>
                      </label>
                      <input
                        type="text"
                        value={data.productDescription}
                        onChange={(e) => setData({ ...data, productDescription: e.target.value })}
                        placeholder="e.g. Project management tool for engineering teams"
                        className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm placeholder:text-stone-300 focus:outline-none focus:border-stone-400 transition-all"
                      />
                    </div>

                    {/* Target Audience */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">
                        Who are your customers? <span className="text-stone-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={data.targetAudience}
                        onChange={(e) => setData({ ...data, targetAudience: e.target.value })}
                        placeholder="e.g. B2B SaaS, mid-market engineering teams"
                        className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm placeholder:text-stone-300 focus:outline-none focus:border-stone-400 transition-all"
                      />
                    </div>

                    {/* Current Focus */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">
                        What are you focused on right now? <span className="text-stone-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={data.currentFocus}
                        onChange={(e) => setData({ ...data, currentFocus: e.target.value })}
                        placeholder="e.g. Reducing churn, improving onboarding, enterprise readiness"
                        className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm placeholder:text-stone-300 focus:outline-none focus:border-stone-400 transition-all"
                      />
                    </div>

                    {/* Competitors */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">
                        Competitors to track <span className="text-stone-400 font-normal">(optional)</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={competitorInput}
                          onChange={(e) => setCompetitorInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetitor())}
                          placeholder="Add a competitor"
                          className="flex-1 px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm placeholder:text-stone-300 focus:outline-none focus:border-stone-400 transition-all"
                        />
                        <button
                          type="button"
                          onClick={addCompetitor}
                          className="px-4 py-3 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                        >
                          <Plus size={18} className="text-stone-600" />
                        </button>
                      </div>
                      {data.competitors.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {data.competitors.map(comp => (
                            <span key={comp} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 rounded-full text-sm font-medium">
                              {comp}
                              <button onClick={() => removeCompetitor(comp)} className="hover:text-red-500 transition-colors">
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Where to listen? */}
              {step === 2 && (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-stone-900 flex items-center justify-center mb-6 shadow-lg shadow-stone-900/20">
                    <Radio size={28} className="text-white" />
                  </div>

                  <h1 className="font-serif text-3xl md:text-4xl text-stone-900 mb-3 leading-tight">
                    Where do users talk?
                  </h1>
                  <p className="text-stone-500 text-lg mb-8 leading-relaxed">
                    Select the channels where your customers are active. We&apos;ll scan them automatically.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {dataSources.map(source => (
                      <button
                        key={source.id}
                        onClick={() => toggleSource(source.id)}
                        className={`group flex items-center gap-3 p-4 rounded-xl border transition-all ${
                          data.sources.includes(source.id)
                            ? 'border-stone-900 bg-white shadow-md'
                            : 'border-stone-200 bg-white/50 hover:bg-white hover:border-stone-300'
                        }`}
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform">{source.emoji}</span>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-semibold text-stone-900 text-sm">{source.name}</p>
                          <p className="text-xs text-stone-500 truncate">{source.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                          data.sources.includes(source.id)
                            ? 'border-stone-900 bg-stone-900'
                            : 'border-stone-300'
                        }`}>
                          {data.sources.includes(source.id) && <Check size={12} className="text-white" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  <p className="text-xs text-stone-400 mt-4 text-center">
                    {data.sources.length} sources selected &middot; You can add more later
                  </p>
                </>
              )}

              {/* Step 3: Connect integrations */}
              {step === 3 && (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-stone-900 flex items-center justify-center mb-6 shadow-lg shadow-stone-900/20">
                    <Zap size={28} className="text-white" />
                  </div>

                  <h1 className="font-serif text-3xl md:text-4xl text-stone-900 mb-3 leading-tight">
                    Connect your stack
                  </h1>
                  <p className="text-stone-500 text-lg mb-8 leading-relaxed">
                    Enable two-way sync. Lark creates tickets, updates roadmaps, and alerts your team.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {integrations.map(int => (
                      <button
                        key={int.id}
                        onClick={() => toggleIntegration(int.id)}
                        className={`flex flex-col items-start gap-3 p-5 rounded-2xl border transition-all h-full ${
                          data.integrations.includes(int.id)
                            ? 'border-stone-900 bg-white shadow-md'
                            : 'border-stone-200 bg-white/50 hover:bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="flex w-full justify-between items-start">
                            <span className="text-2xl">{int.emoji}</span>
                            {data.integrations.includes(int.id) && (
                              <div className="bg-stone-900 rounded-full p-0.5">
                                  <Check size={12} className="text-white" />
                              </div>
                            )}
                        </div>
                        <div className="text-left">
                          <span className="font-bold text-stone-900 block">{int.name}</span>
                          <span className="text-xs text-stone-500">{int.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-center">
                    <p className="text-xs text-stone-500">
                      No integrations needed to start &middot; You can connect them anytime
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between bg-white/80 backdrop-blur-xl border border-stone-200 p-4 rounded-2xl shadow-2xl">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-stone-500 hover:text-stone-900 transition-colors font-medium text-sm"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-4">
             {step === 3 && (
                 <button onClick={handleNext} className="text-sm font-medium text-stone-400 hover:text-stone-600 transition-colors">
                     Skip for now
                 </button>
             )}
            <button
                onClick={handleNext}
                disabled={!canProceed() || isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-stone-900/20 active:scale-[0.98]"
            >
                {isLoading ? (
                <>
                    <Loader2 size={18} className="animate-spin" />
                    Setting up AI...
                </>
                ) : step === totalSteps ? (
                <>
                    Launch Lark
                    <Sparkles size={18} />
                </>
                ) : (
                <>
                    Continue
                    <ArrowRight size={18} />
                </>
                )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
