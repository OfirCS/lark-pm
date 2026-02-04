'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronUp, ChevronDown, Plus, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

// Top 10 Tech Companies with real SVG logos
const companies = [
  {
    id: 'openai',
    name: 'OpenAI',
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
      </svg>
    ),
  },
  {
    id: 'stripe',
    name: 'Stripe',
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
      </svg>
    ),
  },
  {
    id: 'notion',
    name: 'Notion',
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
      </svg>
    ),
  },
  {
    id: 'figma',
    name: 'Figma',
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z"/>
      </svg>
    ),
  },
  {
    id: 'linear',
    name: 'Linear',
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M2.654 10.6a.463.463 0 0 1-.136-.454 9.99 9.99 0 0 1 6.79-6.79.463.463 0 0 1 .454.135l6.748 6.748a.463.463 0 0 1 .136.454 9.99 9.99 0 0 1-6.79 6.79.463.463 0 0 1-.454-.135L2.654 10.6zm8.512 8.257a10.043 10.043 0 0 0 4.442-2.36.462.462 0 0 0-.023-.676l-5.406-5.406a.462.462 0 0 0-.676-.023 10.043 10.043 0 0 0-2.36 4.442l4.023 4.023zm5.406-5.406a10.043 10.043 0 0 0-2.36-4.442l-4.023 4.023a10.043 10.043 0 0 0 4.442 2.36l1.941-1.941zm-7.417-7.417a.462.462 0 0 0-.676-.023 9.99 9.99 0 0 0-2.413 4.442l4.023 4.023a.462.462 0 0 0 .676.023 9.99 9.99 0 0 0 2.413-4.442l-4.023-4.023zM2.042 11.534A10.012 10.012 0 0 0 2 12c0 5.523 4.477 10 10 10a10.012 10.012 0 0 0 .466-.042l-10.424-10.424zm19.916.932A10.012 10.012 0 0 0 22 12c0-5.523-4.477-10-10-10a10.012 10.012 0 0 0-.466.042l10.424 10.424z"/>
      </svg>
    ),
  },
  {
    id: 'vercel',
    name: 'Vercel',
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M24 22.525H0l12-21.05 12 21.05z"/>
      </svg>
    ),
  },
  {
    id: 'slack',
    name: 'Slack',
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
      </svg>
    ),
  },
  {
    id: 'shopify',
    name: 'Shopify',
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.057-.121-.074l-.914 21.104h.023zm-1.278-17.125c0-.076-.025-.149-.089-.191-.061-.044-1.308-.087-1.308-.087s-1.039-1.013-1.141-1.121c-.051-.052-.078-.076-.127-.096l-.628 19.508 5.468-1.199-2.175-16.814zm-2.621-1.886c-.054-.02-.09 0-.126.02-.037.02-.735.225-.735.225s-1.632-3.601-4.453-3.601c-.088 0-.179.008-.266.016C5.528.961 5.164.5 4.745.5c-3.067 0-4.539 3.832-4.996 5.781-.801.249-1.369.425-1.438.448C1.25 6.999 0 7.377 0 7.448c0 2.318 6.135 17.793 6.135 17.793l6.907-1.563s-2.408-17.569-2.604-17.811v.001z"/>
      </svg>
    ),
  },
  {
    id: 'discord',
    name: 'Discord',
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
      </svg>
    ),
  },
  {
    id: 'github',
    name: 'GitHub',
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
    ),
  },
];

// Predictions data
const initialPredictions = [
  { id: '1', companyId: 'openai', feature: 'Real-time voice agents API', yes: 87, votes: 4521, hot: true },
  { id: '2', companyId: 'stripe', feature: 'AI-powered fraud detection dashboard', yes: 72, votes: 3156, hot: false },
  { id: '3', companyId: 'notion', feature: 'Native video conferencing', yes: 64, votes: 2847, hot: true },
  { id: '4', companyId: 'figma', feature: 'AI design-to-code export', yes: 91, votes: 5892, hot: true },
  { id: '5', companyId: 'linear', feature: 'Customer feedback portal', yes: 78, votes: 2234, hot: false },
  { id: '6', companyId: 'vercel', feature: 'Built-in analytics dashboard', yes: 69, votes: 1923, hot: false },
  { id: '7', companyId: 'slack', feature: 'AI meeting transcription', yes: 83, votes: 4102, hot: true },
  { id: '8', companyId: 'shopify', feature: 'TikTok Shop integration', yes: 76, votes: 3445, hot: false },
  { id: '9', companyId: 'discord', feature: 'Native ticketing system', yes: 58, votes: 1876, hot: false },
  { id: '10', companyId: 'github', feature: 'AI code review assistant', yes: 94, votes: 7234, hot: true },
];

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState(initialPredictions);
  const [votes, setVotes] = useState<Record<string, 'yes' | 'no'>>({});
  const [filter, setFilter] = useState<string | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [newPrediction, setNewPrediction] = useState({ company: '', feature: '' });

  const handleVote = (id: string, vote: 'yes' | 'no') => {
    if (votes[id] === vote) {
      const newVotes = { ...votes };
      delete newVotes[id];
      setVotes(newVotes);
    } else {
      setVotes({ ...votes, [id]: vote });
    }
  };

  const handleSubmit = () => {
    if (newPrediction.company && newPrediction.feature) {
      const company = companies.find(c => c.id === newPrediction.company);
      if (company) {
        setPredictions([
          {
            id: Date.now().toString(),
            companyId: newPrediction.company,
            feature: newPrediction.feature,
            yes: 50,
            votes: 1,
            hot: false,
          },
          ...predictions,
        ]);
        setNewPrediction({ company: '', feature: '' });
        setShowSubmit(false);
      }
    }
  };

  const filtered = filter
    ? predictions.filter(p => p.companyId === filter)
    : predictions;

  const getCompany = (id: string) => companies.find(c => c.id === id);

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-stone-900">
              <ArrowLeft size={18} />
            </Link>
            <Logo size="sm" />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-stone-500 hover:text-stone-900">
              Log in
            </Link>
            <Link
              href="/dashboard"
              className="text-sm bg-stone-900 text-white px-4 py-1.5 rounded-lg hover:bg-stone-800"
            >
              Try Lark
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-14 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-medium text-stone-900 mb-3">
              Feature Predictions
            </h1>
            <p className="text-lg text-stone-500">
              What will top tech companies ship next? Vote and submit your predictions.
            </p>
          </div>

          {/* Company Filter */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap">
            <button
              onClick={() => setFilter(null)}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm transition-all ${
                filter === null
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'
              }`}
            >
              All
            </button>
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => setFilter(company.id)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                  filter === company.id
                    ? 'bg-stone-900 text-white'
                    : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                <span className={filter === company.id ? 'text-white' : 'text-stone-900'}>
                  {company.logo}
                </span>
                <span className="hidden sm:inline">{company.name}</span>
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowSubmit(!showSubmit)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-600 hover:border-stone-300 transition-colors"
            >
              <Plus size={16} />
              Submit prediction
            </button>
          </div>

          {/* Submit Form */}
          {showSubmit && (
            <div className="mb-8 p-6 bg-stone-50 border border-stone-200 rounded-2xl">
              <h3 className="font-medium text-lg mb-4">Submit a new prediction</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={newPrediction.company}
                  onChange={(e) => setNewPrediction({ ...newPrediction, company: e.target.value })}
                  className="flex-1 px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400 bg-white"
                >
                  <option value="">Select company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Feature prediction..."
                  value={newPrediction.feature}
                  onChange={(e) => setNewPrediction({ ...newPrediction, feature: e.target.value })}
                  className="flex-[2] px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400 bg-white"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!newPrediction.company || !newPrediction.feature}
                  className="px-6 py-3 bg-stone-900 text-white rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-800 transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* Predictions List */}
          <div className="space-y-3">
            {filtered.map((prediction) => {
              const company = getCompany(prediction.companyId);
              const voted = votes[prediction.id];
              const adjustedYes = voted === 'yes' ? Math.min(prediction.yes + 1, 99) : voted === 'no' ? Math.max(prediction.yes - 1, 1) : prediction.yes;

              return (
                <div
                  key={prediction.id}
                  className="flex items-center gap-4 p-5 bg-white border border-stone-200 rounded-2xl hover:border-stone-300 hover:shadow-sm transition-all"
                >
                  {/* Company Logo */}
                  <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                    {company?.logo}
                  </div>

                  {/* Feature */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-stone-400 font-medium">{company?.name}</span>
                      {prediction.hot && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded font-medium">HOT</span>
                      )}
                    </div>
                    <p className="font-medium text-stone-900">{prediction.feature}</p>
                  </div>

                  {/* Progress */}
                  <div className="w-28 hidden md:block">
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-stone-900 rounded-full transition-all duration-300"
                        style={{ width: `${adjustedYes}%` }}
                      />
                    </div>
                    <p className="text-xs text-stone-400 mt-1.5 text-center">{prediction.votes.toLocaleString()} votes</p>
                  </div>

                  {/* Percentage */}
                  <div className="w-16 text-right shrink-0">
                    <span className="text-2xl font-medium text-stone-900">{adjustedYes}%</span>
                  </div>

                  {/* Vote Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleVote(prediction.id, 'yes')}
                      className={`p-2.5 rounded-xl transition-all ${
                        voted === 'yes'
                          ? 'bg-green-500 text-white'
                          : 'bg-stone-100 text-stone-400 hover:bg-green-100 hover:text-green-600'
                      }`}
                    >
                      <ChevronUp size={20} />
                    </button>
                    <button
                      onClick={() => handleVote(prediction.id, 'no')}
                      className={`p-2.5 rounded-xl transition-all ${
                        voted === 'no'
                          ? 'bg-red-500 text-white'
                          : 'bg-stone-100 text-stone-400 hover:bg-red-100 hover:text-red-600'
                      }`}
                    >
                      <ChevronDown size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="mt-12 py-8 border-t border-stone-200 flex items-center justify-center gap-12 text-center">
            <div>
              <p className="text-3xl font-medium text-stone-900">24,521</p>
              <p className="text-sm text-stone-500 mt-1">Total votes</p>
            </div>
            <div className="w-px h-12 bg-stone-200" />
            <div>
              <p className="text-3xl font-medium text-stone-900">10</p>
              <p className="text-sm text-stone-500 mt-1">Companies</p>
            </div>
            <div className="w-px h-12 bg-stone-200" />
            <div>
              <p className="text-3xl font-medium text-stone-900">78%</p>
              <p className="text-sm text-stone-500 mt-1">Accuracy</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
