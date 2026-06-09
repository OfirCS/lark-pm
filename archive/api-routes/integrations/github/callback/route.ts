// GitHub OAuth - Handle Callback (for Issues Integration)
// Docs: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';

const GITHUB_CLIENT_ID = process.env.GITHUB_INTEGRATION_CLIENT_ID || process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_INTEGRATION_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET || '';

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface GitHubUserResponse {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    console.error('GitHub OAuth error:', error);
    return NextResponse.redirect(
      new URL('/settings?tab=integrations&error=github_denied', request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/settings?tab=integrations&error=github_no_code', request.url)
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
          new URL('/settings?tab=integrations&error=github_state_mismatch', request.url)
        );
      }
    } catch {
      console.warn('Failed to parse state, proceeding anyway');
    }
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData: GitHubTokenResponse = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('GitHub token exchange failed:', tokenData);
      return NextResponse.redirect(
        new URL('/settings?tab=integrations&error=github_token_failed', request.url)
      );
    }

    // Fetch user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const userData: GitHubUserResponse = await userResponse.json();

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
              platform: 'github',
              access_token: tokenData.access_token,
              config: {
                scope: tokenData.scope,
              },
              user_info: {
                githubUserId: userData.id,
                login: userData.login,
                name: userData.name,
                email: userData.email,
                avatarUrl: userData.avatar_url,
              },
              is_active: true,
            } as Record<string, unknown>, {
              onConflict: 'organization_id,platform',
            });

          if (upsertError) {
            console.error('Failed to store GitHub integration:', upsertError);
          }
        }
      }
    }
    // In demo mode, we skip storage but still show success

    return NextResponse.redirect(
      new URL('/settings?tab=integrations&success=github', request.url)
    );
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/settings?tab=integrations&error=github_failed', request.url)
    );
  }
}
