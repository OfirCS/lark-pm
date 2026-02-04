// API route to save/load company settings from Supabase
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getServerUser } from '@/lib/auth/server';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Supabase not configured',
      data: null
    });
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Failed to create Supabase client' });
  }

  try {
    // Try to get authenticated user
    const user = await getServerUser();

    let query = supabase
      .from('company_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    // If user is authenticated, get their settings
    if (user) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error fetching company:', error);
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({
      success: true,
      data: data || null,
      userId: user?.id || null
    });
  } catch (err) {
    console.error('Error in GET /api/company:', err);
    return NextResponse.json({ success: false, error: 'Server error' });
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Supabase not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local'
    });
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Failed to create Supabase client' });
  }

  try {
    const body = await request.json();
    const {
      productName,
      productDescription,
      competitors,
      searchTerms,
      subreddits,
      twitterKeywords,
      enabledSources,
      selectedIntegrations,
      onboardingCompleted,
    } = body;

    // Try to get authenticated user
    const user = await getServerUser();

    // Check if we have existing settings for this user
    let existingQuery = supabase
      .from('company_settings')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1);

    if (user) {
      existingQuery = existingQuery.eq('user_id', user.id);
    }

    const { data: existing } = await existingQuery.single();

    let result;

    const settingsData = {
      product_name: productName,
      product_description: productDescription,
      competitors: competitors || [],
      search_terms: searchTerms || [],
      subreddits: subreddits || [],
      twitter_keywords: twitterKeywords || [],
      enabled_sources: enabledSources || [],
      selected_integrations: selectedIntegrations || [],
      onboarding_completed: onboardingCompleted || false,
      user_id: user?.id || null,
    };

    if (existing?.id) {
      // Update existing
      result = await supabase
        .from('company_settings')
        .update(settingsData)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Insert new
      result = await supabase
        .from('company_settings')
        .insert(settingsData)
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error saving company:', result.error);
      return NextResponse.json({ success: false, error: result.error.message });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      userId: user?.id || null
    });
  } catch (err) {
    console.error('Error in POST /api/company:', err);
    return NextResponse.json({ success: false, error: 'Server error' });
  }
}
