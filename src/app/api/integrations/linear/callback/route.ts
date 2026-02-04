// Linear OAuth - Handle Callback
// Docs: https://developers.linear.app/docs/oauth/authentication

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';

const LINEAR_CLIENT_ID = process.env.LINEAR_CLIENT_ID || '';
const LINEAR_CLIENT_SECRET = process.env.LINEAR_CLIENT_SECRET || '';
const LINEAR_REDIRECT_URI = process.env.LINEAR_REDIRECT_URI || 'http://localhost:3000/api/integrations/linear/callback';

interface LinearTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
}

interface LinearUserResponse {
  data?: {
    viewer?: {
      id: string;
      name: string;
      email: string;
      avatarUrl?: string;
    };
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    console.error('Linear OAuth error:', error);
    return NextResponse.redirect(
      new URL('/settings?tab=integrations&error=linear_denied', request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/settings?tab=integrations&error=linear_no_code', request.url)
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
          new URL('/settings?tab=integrations&error=linear_state_mismatch', request.url)
        );
      }
    } catch {
      console.warn('Failed to parse state, proceeding anyway');
    }
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.linear.app/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: LINEAR_CLIENT_ID,
        client_secret: LINEAR_CLIENT_SECRET,
        redirect_uri: LINEAR_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Linear token exchange failed:', errorText);
      return NextResponse.redirect(
        new URL('/settings?tab=integrations&error=linear_token_failed', request.url)
      );
    }

    const tokenData: LinearTokenResponse = await tokenResponse.json();

    // Fetch user info from Linear
    const userResponse = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify({
        query: `
          query {
            viewer {
              id
              name
              email
              avatarUrl
            }
          }
        `,
      }),
    });

    const userData: LinearUserResponse = await userResponse.json();
    const viewer = userData.data?.viewer;

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
              platform: 'linear',
              access_token: tokenData.access_token,
              config: {
                scope: tokenData.scope,
                expiresIn: tokenData.expires_in,
              },
              user_info: viewer ? {
                linearUserId: viewer.id,
                name: viewer.name,
                email: viewer.email,
                avatarUrl: viewer.avatarUrl,
              } : null,
              is_active: true,
            } as Record<string, unknown>, {
              onConflict: 'organization_id,platform',
            });

          if (upsertError) {
            console.error('Failed to store Linear integration:', upsertError);
          }
        }
      }
    }
    // In demo mode, we skip storage but still show success

    return NextResponse.redirect(
      new URL('/settings?tab=integrations&success=linear', request.url)
    );
  } catch (error) {
    console.error('Linear OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/settings?tab=integrations&error=linear_failed', request.url)
    );
  }
}
