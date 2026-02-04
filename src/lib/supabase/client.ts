// Supabase Client Configuration
// Server and client-side Supabase clients

import { createBrowserClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// Browser client (for client components)
export function createBrowserSupabaseClient() {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured - running in demo mode');
    return null;
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Server client with service role (for API routes)
export function createServerSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured - running in demo mode');
    return null;
  }

  if (!supabaseServiceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not set - using anon key');
    return createClient(supabaseUrl, supabaseAnonKey);
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Generic client for simple operations (lazy initialization)
let _supabase: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

// Legacy export for backward compatibility
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to get user from session
export async function getCurrentUser() {
  const client = getSupabase();
  if (!client) return null;

  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  return user;
}

// Helper to get organization for user
export async function getUserOrganization(userId: string) {
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from('organization_members')
    .select('organization_id, organizations(*)')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return (data as { organizations: unknown }).organizations;
}
