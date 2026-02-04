// Linear API - Fetch Teams
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createServerSupabaseClient } from '@/lib/supabase/client';
import { getLinearTeams } from '@/lib/integrations/linear';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  // Get user's organization
  const { data: orgMember } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', session.user.id)
    .single();

  if (!orgMember) {
    return NextResponse.json({ error: 'No organization found' }, { status: 404 });
  }

  // Get Linear integration
  const { data: integration } = await supabase
    .from('integrations')
    .select('access_token')
    .eq('organization_id', orgMember.organization_id)
    .eq('platform', 'linear')
    .eq('is_active', true)
    .single();

  if (!integration?.access_token) {
    return NextResponse.json({ error: 'Linear not connected' }, { status: 400 });
  }

  try {
    const teams = await getLinearTeams(`Bearer ${integration.access_token}`);
    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Failed to fetch Linear teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}
