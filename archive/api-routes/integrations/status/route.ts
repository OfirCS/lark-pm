// Get all integration statuses for current user's organization
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Demo mode - return empty integrations
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ integrations: {}, demoMode: true });
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ integrations: {}, demoMode: true });
  }

  // Get user's organization
  const { data: orgMember } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', session.user.id)
    .single();

  if (!orgMember) {
    return NextResponse.json({ integrations: {} });
  }

  // Get all integrations for org
  const { data: integrations } = await supabase
    .from('integrations')
    .select('platform, is_active, config, user_info, connected_at')
    .eq('organization_id', orgMember.organization_id);

  const status: Record<string, {
    connected: boolean;
    config: Record<string, unknown>;
    userInfo: Record<string, unknown> | null;
    connectedAt: string | null;
  }> = {};

  for (const integration of integrations || []) {
    status[integration.platform] = {
      connected: integration.is_active,
      config: integration.config as Record<string, unknown>,
      userInfo: integration.user_info as Record<string, unknown> | null,
      connectedAt: integration.connected_at,
    };
  }

  return NextResponse.json({ integrations: status });
}
