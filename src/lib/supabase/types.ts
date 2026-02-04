// Supabase Database Types
// Generated schema types for type-safe queries

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: 'free' | 'pro' | 'enterprise';
          product_name: string | null;
          product_context: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          plan?: 'free' | 'pro' | 'enterprise';
          product_name?: string | null;
          product_context?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          plan?: 'free' | 'pro' | 'enterprise';
          product_name?: string | null;
          product_context?: string | null;
          updated_at?: string;
        };
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member';
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: 'owner' | 'admin' | 'member';
          created_at?: string;
        };
        Update: {
          role?: 'owner' | 'admin' | 'member';
        };
      };
      feedback: {
        Row: {
          id: string;
          organization_id: string;
          content: string;
          source: string;
          source_url: string | null;
          source_id: string | null;
          author: string | null;
          author_email: string | null;
          sentiment: 'positive' | 'neutral' | 'negative' | null;
          category: 'bug' | 'feature_request' | 'complaint' | 'praise' | 'question' | 'other' | null;
          priority: 'urgent' | 'high' | 'medium' | 'low' | null;
          priority_score: number | null;
          customer_segment: 'enterprise' | 'mid_market' | 'smb' | 'trial' | 'unknown' | null;
          arr_value: number | null;
          tags: string[] | null;
          product_area: string | null;
          cluster_id: string | null;
          ticket_id: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          content: string;
          source: string;
          source_url?: string | null;
          source_id?: string | null;
          author?: string | null;
          author_email?: string | null;
          sentiment?: 'positive' | 'neutral' | 'negative' | null;
          category?: 'bug' | 'feature_request' | 'complaint' | 'praise' | 'question' | 'other' | null;
          priority?: 'urgent' | 'high' | 'medium' | 'low' | null;
          priority_score?: number | null;
          customer_segment?: 'enterprise' | 'mid_market' | 'smb' | 'trial' | 'unknown' | null;
          arr_value?: number | null;
          tags?: string[] | null;
          product_area?: string | null;
          cluster_id?: string | null;
          ticket_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          source?: string;
          source_url?: string | null;
          author?: string | null;
          sentiment?: 'positive' | 'neutral' | 'negative' | null;
          category?: 'bug' | 'feature_request' | 'complaint' | 'praise' | 'question' | 'other' | null;
          priority?: 'urgent' | 'high' | 'medium' | 'low' | null;
          priority_score?: number | null;
          customer_segment?: 'enterprise' | 'mid_market' | 'smb' | 'trial' | 'unknown' | null;
          arr_value?: number | null;
          tags?: string[] | null;
          product_area?: string | null;
          cluster_id?: string | null;
          ticket_id?: string | null;
          metadata?: Json | null;
          updated_at?: string;
        };
      };
      feedback_clusters: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          summary: string | null;
          feedback_count: number;
          avg_priority_score: number | null;
          top_category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          summary?: string | null;
          feedback_count?: number;
          avg_priority_score?: number | null;
          top_category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          summary?: string | null;
          feedback_count?: number;
          avg_priority_score?: number | null;
          top_category?: string | null;
          updated_at?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          organization_id: string;
          platform: 'linear' | 'github' | 'jira' | 'notion';
          external_id: string;
          external_url: string;
          title: string;
          description: string | null;
          status: 'open' | 'in_progress' | 'done' | 'cancelled';
          feedback_ids: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          platform: 'linear' | 'github' | 'jira' | 'notion';
          external_id: string;
          external_url: string;
          title: string;
          description?: string | null;
          status?: 'open' | 'in_progress' | 'done' | 'cancelled';
          feedback_ids?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          external_id?: string;
          external_url?: string;
          title?: string;
          description?: string | null;
          status?: 'open' | 'in_progress' | 'done' | 'cancelled';
          feedback_ids?: string[];
          updated_at?: string;
        };
      };
      integrations: {
        Row: {
          id: string;
          organization_id: string;
          platform: string;
          access_token: string;
          refresh_token: string | null;
          token_expires_at: string | null;
          config: Json | null;
          connected_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          platform: string;
          access_token: string;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          config?: Json | null;
          connected_at?: string;
          updated_at?: string;
        };
        Update: {
          access_token?: string;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          config?: Json | null;
          updated_at?: string;
        };
      };
      data_sources: {
        Row: {
          id: string;
          organization_id: string;
          type: 'reddit' | 'twitter' | 'slack' | 'intercom' | 'zendesk' | 'custom';
          name: string;
          config: Json;
          enabled: boolean;
          last_synced_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          type: 'reddit' | 'twitter' | 'slack' | 'intercom' | 'zendesk' | 'custom';
          name: string;
          config: Json;
          enabled?: boolean;
          last_synced_at?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          config?: Json;
          enabled?: boolean;
          last_synced_at?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Helper types for easy access
export type User = Database['public']['Tables']['users']['Row'];
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type Feedback = Database['public']['Tables']['feedback']['Row'];
export type FeedbackInsert = Database['public']['Tables']['feedback']['Insert'];
export type Ticket = Database['public']['Tables']['tickets']['Row'];
export type Integration = Database['public']['Tables']['integrations']['Row'];
export type DataSource = Database['public']['Tables']['data_sources']['Row'];
export type FeedbackCluster = Database['public']['Tables']['feedback_clusters']['Row'];
