// Slack OAuth - Handle Callback
// Docs: https://api.slack.com/authentication/oauth-v2

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID || '';
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET || '';
const SLACK_REDIRECT_URI = process.env.SLACK_REDIRECT_URI || 'http://localhost:3000/api/integrations/slack/callback';

interface SlackTokenResponse {
  ok: boolean;
  access_token?: string;
  token_type?: string;
  scope?: string;
  bot_user_id?: string;
  app_id?: string;
  team?: {
    id: string;
    name: string;
  };
  authed_user?: {
    id: string;
    scope?: string;
    access_token?: string;
  };
  incoming_webhook?: {
    channel: string;
    channel_id: string;
    configuration_url: string;
    url: string;
  };
  error?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    console.error('Slack OAuth error:', error);
    return NextResponse.redirect(
      new URL('/settings?tab=integrations&error=slack_denied', request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/settings?tab=integrations&error=slack_no_code', request.url)
    );
  }

  // Verify session
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.redirect(
      new URL('/login?callbackUrl=/settings', request.url)
    );
  }

  // Verify state (CSRF protection)
  if (state) {
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      if (stateData.userId !== session.user.id) {
        return NextResponse.redirect(
          new URL('/settings?tab=integrations&error=slack_state_mismatch', request.url)
        );
      }
    } catch {
      console.warn('Failed to parse state, proceeding anyway');
    }
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code,
        redirect_uri: SLACK_REDIRECT_URI,
      }),
    });

    const tokenData: SlackTokenResponse = await tokenResponse.json();

    if (!tokenData.ok || !tokenData.access_token) {
      console.error('Slack token exchange failed:', tokenData.error);
      return NextResponse.redirect(
        new URL('/settings?tab=integrations&error=slack_token_failed', request.url)
      );
    }

    // Store in Supabase (if configured)
    if (isSupabaseConfigured()) {
      const supabase = createServerSupabaseClient();
      if (supabase) {
        // Get user's organization
        const { data: orgMember } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', session.user.id)
          .single();

        if (orgMember) {
          // Upsert integration
          const { error: upsertError } = await supabase
            .from('integrations')
            .upsert({
              organization_id: orgMember.organization_id,
              platform: 'slack',
              access_token: tokenData.access_token,
              config: {
                scope: tokenData.scope,
                botUserId: tokenData.bot_user_id,
                appId: tokenData.app_id,
                webhookUrl: tokenData.incoming_webhook?.url,
                webhookChannel: tokenData.incoming_webhook?.channel,
                webhookChannelId: tokenData.incoming_webhook?.channel_id,
              },
              user_info: tokenData.team ? {
                teamId: tokenData.team.id,
                teamName: tokenData.team.name,
                authedUserId: tokenData.authed_user?.id,
              } : null,
              is_active: true,
            } as Record<string, unknown>, {
              onConflict: 'organization_id,platform',
            });

          if (upsertError) {
            console.error('Failed to store Slack integration:', upsertError);
          }
        }
      }
    }
    // In demo mode, we skip storage but still show success

    return NextResponse.redirect(
      new URL('/settings?tab=integrations&success=slack', request.url)
    );
  } catch (error) {
    console.error('Slack OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/settings?tab=integrations&error=slack_failed', request.url)
    );
  }
}
