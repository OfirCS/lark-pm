// API route to save/load collected feedback from Supabase
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: false, error: 'Supabase not configured', data: [] });
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Failed to create Supabase client' });
  }

  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabase
      .from('collected_feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching feedback:', error);
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('Error in GET /api/feedback:', err);
    return NextResponse.json({ success: false, error: 'Server error' });
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: false, error: 'Supabase not configured' });
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Failed to create Supabase client' });
  }

  try {
    const body = await request.json();
    const { items, companyId } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ success: false, error: 'Items array required' });
    }

    // Map items to database format
    const records = items.map((item: {
      item: {
        id?: string;
        content: string;
        title?: string;
        source: string;
        url?: string;
        author?: string;
      };
      classification?: {
        sentiment?: string;
        category?: string;
        priority?: string;
        priorityScore?: number;
      };
    }) => ({
      company_id: companyId || null,
      content: item.item.content,
      title: item.item.title,
      source: item.item.source,
      source_url: item.item.url,
      author: item.item.author,
      sentiment: item.classification?.sentiment,
      category: item.classification?.category,
      priority: item.classification?.priority,
      priority_score: item.classification?.priorityScore,
    }));

    const { data, error } = await supabase
      .from('collected_feedback')
      .insert(records)
      .select();

    if (error) {
      console.error('Error saving feedback:', error);
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({
      success: true,
      data,
      count: data?.length || 0
    });
  } catch (err) {
    console.error('Error in POST /api/feedback:', err);
    return NextResponse.json({ success: false, error: 'Server error' });
  }
}
