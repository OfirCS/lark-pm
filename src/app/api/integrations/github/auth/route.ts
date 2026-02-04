// GitHub OAuth - Start Authorization Flow (for Issues Integration)
// This is separate from NextAuth GitHub login
// Docs: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

const GITHUB_CLIENT_ID = process.env.GITHUB_INTEGRATION_CLIENT_ID || process.env.GITHUB_CLIENT_ID || '';
const GITHUB_REDIRECT_URI = process.env.GITHUB_INTEGRATION_REDIRECT_URI || 'http://localhost:3000/api/integrations/github/callback';

export async function GET(request: NextRequest) {
  // Verify user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.redirect(new URL('/login?callbackUrl=/settings', request.url));
  }

  if (!GITHUB_CLIENT_ID) {
    return NextResponse.redirect(
      new URL('/settings?tab=integrations&error=github_not_configured', request.url)
    );
  }

  // Generate state for CSRF protection
  const state = Buffer.from(JSON.stringify({
    userId: session.user.id,
    timestamp: Date.now(),
  })).toString('base64');

  // GitHub OAuth URL - requesting repo scope for issues
  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', GITHUB_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', GITHUB_REDIRECT_URI);
  authUrl.searchParams.set('scope', 'repo read:user');
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}
