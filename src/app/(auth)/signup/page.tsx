'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Check, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/components/providers/AuthProvider';
import { signUp, signInWithOAuth } from '@/lib/auth/supabase-auth';

export default function SignupPage() {
  const router = useRouter();
  const { setDemoUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDemoLogin = () => {
    setIsLoading(true);
    setDemoUser();
    router.push('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { user } = await signUp(email, password, fullName);

      if (user) {
        // Check if email confirmation is required
        if (user.identities?.length === 0) {
          setSuccess(true);
        } else {
          // Email confirmed or auto-confirm enabled
          router.push('/onboarding');
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to create account';
      setError(msg.includes('not configured') ? 'Email signup not available. Try the demo account below.' : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      await signInWithOAuth('google');
    } catch (err) {
      console.error('Google signup error:', err);
      const msg = err instanceof Error ? err.message : '';
      setError(msg.includes('not configured') ? 'OAuth not available. Try the demo account below.' : 'Failed to sign up with Google');
      setIsLoading(false);
    }
  };

  const handleGitHubSignup = async () => {
    setIsLoading(true);
    try {
      await signInWithOAuth('github');
    } catch (err) {
      console.error('GitHub signup error:', err);
      const msg = err instanceof Error ? err.message : '';
      setError(msg.includes('not configured') ? 'OAuth not available. Try the demo account below.' : 'Failed to sign up with GitHub');
      setIsLoading(false);
    }
  };

  const benefits = [
    'Monitor Reddit, Twitter, LinkedIn in real-time',
    'AI analyzes calls and extracts insights',
    'Smart prioritization based on real data',
    'No credit card required for 14 days',
  ];

  // Success state - waiting for email confirmation
  if (success) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <Check size={32} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-semibold text-stone-900 mb-2">Check your email</h1>
          <p className="text-stone-500 mb-6">
            We sent a confirmation link to <strong>{email}</strong>.
            Click the link to activate your account.
          </p>
          <Link
            href="/login"
            className="text-stone-900 font-medium hover:text-indigo-600 transition-colors"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Value proposition */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-stone-50 to-stone-100 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-stone-200/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-stone-200/30 rounded-full blur-2xl" />

        <div className="relative z-10">
          <Link href="/">
            <Logo size="md" />
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-sm text-stone-600 mb-6">
            <Sparkles size={14} />
            Free 14-day trial
          </div>

          <h1 className="font-serif text-4xl text-stone-900 leading-tight mb-6">
            Stop drowning in customer feedback
          </h1>

          <p className="text-lg text-stone-500 mb-10">
            Product managers spend 10+ hours/week consolidating feedback. Lark does it in seconds.
          </p>

          <ul className="space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <div className="w-5 h-5 mt-0.5 rounded-full bg-stone-900 flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-white" />
                </div>
                <span className="text-stone-600">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-200">
            <div className="flex -space-x-2">
              {[1,2,3,4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-300 to-stone-400 border-2 border-white" />
              ))}
            </div>
            <div>
              <p className="text-sm font-medium text-stone-900">Join 500+ product teams</p>
              <p className="text-xs text-stone-500">who shipped the right features</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Logo size="md" />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="font-serif text-3xl text-stone-900 mb-2">Create your account</h2>
            <p className="text-stone-500">
              Already have an account?{' '}
              <Link href="/login" className="text-stone-900 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* OAuth buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-stone-200 rounded-xl text-stone-700 font-medium hover:bg-stone-50 hover:border-stone-300 transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <button
              onClick={handleGitHubSignup}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-stone-200 rounded-xl text-stone-700 font-medium hover:bg-stone-50 hover:border-stone-300 transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-stone-400">or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                Work email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-2">
                Create password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8+ characters"
                  required
                  minLength={8}
                  className="w-full px-4 py-3.5 pr-12 bg-white border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || password.length < 8}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Demo login */}
          <div className="mt-6">
            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl font-medium hover:bg-amber-100 transition-all disabled:opacity-50"
            >
              <Sparkles size={16} />
              Try Demo Account Instead
            </button>
          </div>

          {/* What happens next */}
          <div className="mt-6 p-4 bg-stone-50 rounded-xl">
            <p className="text-sm text-stone-600">
              <span className="font-medium">Next:</span> Quick 2-minute setup to connect your data sources
            </p>
          </div>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-stone-400">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-stone-600 hover:underline">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-stone-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
