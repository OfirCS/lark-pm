'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    router.push('/dashboard');
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-stone-50">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-stone-200/40 rounded-full blur-[120px] mix-blend-multiply" />
          <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-stone-100/60 rounded-full blur-[120px] mix-blend-multiply" />
          <div className="grain absolute inset-0 opacity-40" />
      </div>

      {/* Left side - Branding (Glassmorphic) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 z-10">
        <div className="absolute inset-0 bg-stone-900/95 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-stone-800/50 to-transparent" />
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <Logo size="md" className="[&>span]:text-white [&>div]:bg-white [&_svg]:text-stone-900" />
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="font-serif text-5xl text-white leading-[1.1] mb-8">
            Turn customer noise into <span className="italic text-stone-400">product signal</span>
          </h1>
          <p className="text-stone-400 text-lg leading-relaxed max-w-md">
            Join 500+ product teams using Lark to listen, analyze, and build what truly matters.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-8 text-sm font-medium text-stone-500">
          <div className="flex -space-x-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-stone-800 border-2 border-stone-900 flex items-center justify-center text-[10px] text-white">
                {i === 4 ? '+' : ''}
              </div>
            ))}
          </div>
          <div className="h-4 w-px bg-stone-800" />
          <span>Used by product teams at Stripe, Linear, and Vercel</span>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 lg:px-24 z-10 relative">
        <div className="w-full max-w-[420px] mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden mb-12 flex justify-center">
            <Logo size="md" />
          </div>

          <div className="glass-panel p-10 rounded-3xl shadow-smooth-lg backdrop-blur-xl bg-white/60">
            {/* Header */}
            <div className="mb-10 text-center">
              <h2 className="font-serif text-3xl text-stone-900 mb-3">Welcome back</h2>
              <p className="text-stone-500 text-sm">
                New to Lark?{' '}
                <Link href="/signup" className="text-stone-900 font-medium hover:underline decoration-stone-300 underline-offset-4">
                  Create an account
                </Link>
              </p>
            </div>

            {/* Google OAuth */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-stone-200 rounded-xl text-stone-700 font-medium hover:bg-stone-50 hover:border-stone-300 transition-all disabled:opacity-50 hover:shadow-sm group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-stone-50/80 px-4 text-xs font-medium text-stone-400 uppercase tracking-wider backdrop-blur-sm">or</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full px-4 py-3 bg-white/50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-stone-400 hover:text-stone-600 font-medium">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 pr-12 bg-white/50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-stone-900/10"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-stone-400">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-stone-500 hover:text-stone-800 transition-colors">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-stone-500 hover:text-stone-800 transition-colors">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}