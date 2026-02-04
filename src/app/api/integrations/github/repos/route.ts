// GitHub API - Fetch User's Repositories
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createServerSupabaseClient } from '@/lib/supabase/client';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();

  // Get user's organization
  const { data: orgMember } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', session.user.id)
    .single();

  if (!orgMember) {
    return NextResponse.json({ error: 'No organization found' }, { status: 404 });
  }

  // Get GitHub integration
  const { data: integration } = await supabase
    .from('integrations')
    .select('access_token')
    .eq('organization_id', orgMember.organization_id)
    .eq('platform', 'github')
    .eq('is_active', true)
    .single();

  if (!integration?.access_token) {
    return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 });
  }

  try {
    // Fetch user's repos (including org repos they have access to)
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        Authorization: `Bearer ${integration.access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos = await response.json();

    // Return simplified repo data
    const simplifiedRepos = repos.map((repo: {
      id: number;
      full_name: string;
      name: string;
      owner: { login: string };
      private: boolean;
      html_url: string;
    }) => ({
      id: repo.id,
      fullName: repo.full_name,
      name: repo.name,
      owner: repo.owner.login,
      private: repo.private,
      url: repo.html_url,
    }));

    return NextResponse.json({ repos: simplifiedRepos });
  } catch (error) {
    console.error('Failed to fetch GitHub repos:', error);
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
  }
}
