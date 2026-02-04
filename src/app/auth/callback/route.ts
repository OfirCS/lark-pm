import { createServerSupabaseClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createServerSupabaseClient();
    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  }

  // Redirect to dashboard after auth
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}
