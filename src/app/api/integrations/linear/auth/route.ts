// Linear OAuth - Start Authorization Flow
// Docs: https://developers.linear.app/docs/oauth/authentication

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

const LINEAR_CLIENT_ID = process.env.LINEAR_CLIENT_ID || '';
const LINEAR_REDIRECT_URI = process.env.LINEAR_REDIRECT_URI || 'http://localhost:3000/api/integrations/linear/callback';

export async function GET(request: NextRequest) {
  // Verify user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.redirect(new URL('/login?callbackUrl=/settings', request.url));
  }

  if (!LINEAR_CLIENT_ID) {
    return NextResponse.redirect(
      new URL('/settings?tab=integrations&error=linear_not_configured', request.url)
    );
  }

  // Generate state for CSRF protection (in production, store this in a cookie/session)
  const state = Buffer.from(JSON.stringify({
    userId: session.user.id,
    timestamp: Date.now(),
  })).toString('base64');

  // Linear OAuth URL
  const authUrl = new URL('https://linear.app/oauth/authorize');
  authUrl.searchParams.set('client_id', LINEAR_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', LINEAR_REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'read,write,issues:create');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('prompt', 'consent');

  return NextResponse.redirect(authUrl.toString());
}
