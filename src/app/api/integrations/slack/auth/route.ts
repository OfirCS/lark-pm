// Slack OAuth - Start Authorization Flow
// Docs: https://api.slack.com/authentication/oauth-v2

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID || '';
const SLACK_REDIRECT_URI = process.env.SLACK_REDIRECT_URI || 'http://localhost:3000/api/integrations/slack/callback';

export async function GET(request: NextRequest) {
  // Verify user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.redirect(new URL('/login?callbackUrl=/settings', request.url));
  }

  if (!SLACK_CLIENT_ID) {
    return NextResponse.redirect(
      new URL('/settings?tab=integrations&error=slack_not_configured', request.url)
    );
  }

  // Generate state for CSRF protection
  const state = Buffer.from(JSON.stringify({
    userId: session.user.id,
    timestamp: Date.now(),
  })).toString('base64');

  // Slack OAuth URL
  // Scopes: chat:write for sending messages, channels:read for listing channels
  const authUrl = new URL('https://slack.com/oauth/v2/authorize');
  authUrl.searchParams.set('client_id', SLACK_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', SLACK_REDIRECT_URI);
  authUrl.searchParams.set('scope', 'chat:write,channels:read,incoming-webhook');
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}
