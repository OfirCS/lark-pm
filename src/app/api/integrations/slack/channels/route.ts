// Slack API - Fetch Channels
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

  // Get Slack integration
  const { data: integration } = await supabase
    .from('integrations')
    .select('access_token')
    .eq('organization_id', orgMember.organization_id)
    .eq('platform', 'slack')
    .eq('is_active', true)
    .single();

  if (!integration?.access_token) {
    return NextResponse.json({ error: 'Slack not connected' }, { status: 400 });
  }

  try {
    // Fetch public channels
    const response = await fetch('https://slack.com/api/conversations.list?types=public_channel&limit=200', {
      headers: {
        Authorization: `Bearer ${integration.access_token}`,
      },
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.error || 'Failed to fetch channels');
    }

    // Return simplified channel data
    const channels = data.channels?.map((channel: {
      id: string;
      name: string;
      is_private: boolean;
      num_members: number;
    }) => ({
      id: channel.id,
      name: channel.name,
      isPrivate: channel.is_private,
      memberCount: channel.num_members,
    })) || [];

    return NextResponse.json({ channels });
  } catch (error) {
    console.error('Failed to fetch Slack channels:', error);
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
}
