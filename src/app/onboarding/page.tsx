'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Check, Sparkles, Radio, Zap, Loader2 } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

// Data sources to monitor
const dataSources = [
  { id: 'reddit', name: 'Reddit', desc: 'r/SaaS, r/startups, etc.', emoji: '🔴' },
  { id: 'twitter', name: 'Twitter/X', desc: 'Mentions & hashtags', emoji: '🐦' },
  { id: 'linkedin', name: 'LinkedIn', desc: 'Posts & comments', emoji: '💼' },
  { id: 'calls', name: 'Call recordings', desc: 'Zoom, Gong, etc.', emoji: '📞' },
];

// Integrations
const integrations = [
  { id: 'slack', name: 'Slack', emoji: '💬', desc: 'Alerts & Triage' },
  { id: 'linear', name: 'Linear', emoji: '📐', desc: 'Sync Issues' },
  { id: 'jira', name: 'Jira', emoji: '📋', desc: 'Create Tickets' },
  { id: 'notion', name: 'Notion', emoji: '📝', desc: 'Knowledge Base' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    productName: '',
    sources: ['reddit', 'twitter'] as string[],
    integrations: [] as string[],
  });

  const totalSteps = 3;

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/dashboard');
    }
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
          <div className="grain absolute inset-0 opacity-40" />
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
                  className={`w-6 h-1 rounded-full transition-all duration-500 ${
                    s <= step ? 'bg-stone-900' : 'bg-stone-200'
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
          <div className="glass-panel p-8 md:p-10 rounded-3xl shadow-smooth-lg backdrop-blur-xl bg-white/60 transition-all duration-500">
            
            {/* Step 1: What's your product? */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-14 h-14 rounded-2xl bg-stone-900 flex items-center justify-center mb-6 shadow-lg shadow-stone-900/20">
                  <Sparkles size={28} className="text-white" />
                </div>

                <h1 className="font-serif text-3xl md:text-4xl text-stone-900 mb-4 leading-tight">
                  What are we building?
                </h1>
                <p className="text-stone-500 text-lg mb-8 leading-relaxed">
                  Tell us your product&apos;s name. Lark will start listening for customer feedback immediately.
                </p>

                <div className="relative">
                    <input
                        type="text"
                        value={data.productName}
                        onChange={(e) => setData({ ...data, productName: e.target.value })}
                        placeholder="e.g. Acme Corp"
                        autoFocus
                        className="w-full px-6 py-5 bg-white border border-stone-200 rounded-2xl text-xl placeholder:text-stone-300 focus:outline-none focus:border-stone-900 focus:ring-4 focus:ring-stone-100 transition-all shadow-sm"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {data.productName.length > 0 && <Check size={20} className="text-emerald-500 animate-in fade-in zoom-in" />}
                    </div>
                </div>
              </div>
            )}

            {/* Step 2: Where to listen? */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-14 h-14 rounded-2xl bg-stone-900 flex items-center justify-center mb-6 shadow-lg shadow-stone-900/20">
                  <Radio size={28} className="text-white" />
                </div>

                <h1 className="font-serif text-3xl md:text-4xl text-stone-900 mb-4 leading-tight">
                  Where do users talk?
                </h1>
                <p className="text-stone-500 text-lg mb-8 leading-relaxed">
                  Select the channels where your customers are most active. We&apos;ll monitor them 24/7.
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {dataSources.map(source => (
                    <button
                      key={source.id}
                      onClick={() => toggleSource(source.id)}
                      className={`group flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        data.sources.includes(source.id)
                          ? 'border-stone-900 bg-white shadow-md'
                          : 'border-stone-200 bg-white/50 hover:bg-white hover:border-stone-300'
                      }`}
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">{source.emoji}</span>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-stone-900">{source.name}</p>
                        <p className="text-sm text-stone-500">{source.desc}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        data.sources.includes(source.id)
                          ? 'border-stone-900 bg-stone-900'
                          : 'border-stone-300'
                      }`}>
                        {data.sources.includes(source.id) && <Check size={14} className="text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Connect integrations */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-14 h-14 rounded-2xl bg-stone-900 flex items-center justify-center mb-6 shadow-lg shadow-stone-900/20">
                  <Zap size={28} className="text-white" />
                </div>

                <h1 className="font-serif text-3xl md:text-4xl text-stone-900 mb-4 leading-tight">
                  Connect your stack
                </h1>
                <p className="text-stone-500 text-lg mb-8 leading-relaxed">
                  Enable two-way sync. Lark can create tickets, update roadmaps, and alert your team.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
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
              </div>
            )}
          </div>
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
                     Skip setup
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
                    Finishing up...
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